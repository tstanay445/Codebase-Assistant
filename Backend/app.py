import os
import time
import uuid
import shutil
import zipfile
import jwt
import bcrypt
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, UploadFile, File, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from ingestion import chunk, get_embedings, save_to_database
from retreival import get_top_k, generate_answer 

load_dotenv()

app = FastAPI(title="Unified Codebase RAG Assistant Monolith")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cross-platform environment configs
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:0000@localhost:5433/vectordb")
BASE_STORAGE_DIR = os.getenv("STORAGE_DIR", "D:\\CodeBaseAssistantRAG\\storage")
os.makedirs(BASE_STORAGE_DIR, exist_ok=True)

SECRET_KEY = "your-super-secret-immutable-key-change-this-in-production"
ALGORITHM = "HS256"
security = HTTPBearer()

class AuthRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS workspaces (
                id UUID PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                workspace_name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, workspace_name)
            );
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Database structural initialization complete.")
    except Exception as e:
        print(f"\n❌ [CRITICAL DATABASE ERROR] Failed to initialize PostgreSQL: {str(e)}\n")

@app.on_event("startup")
def on_startup():
    init_db()

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token identity.")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")

def get_or_create_workspace(user_id: int, workspace_name: str) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    clean_name = workspace_name.strip().lower().replace(" ", "-")
    try:
        cursor.execute("SELECT id FROM workspaces WHERE user_id = %s AND workspace_name = %s;", (user_id, clean_name))
        record = cursor.fetchone()
        if record:
            return record[0]
            
        new_workspace_uuid = str(uuid.uuid4())
        cursor.execute("INSERT INTO workspaces (id, user_id, workspace_name) VALUES (%s, %s, %s);", (new_workspace_uuid, user_id, clean_name))
        conn.commit()
        return new_workspace_uuid
    except Exception as e:
        conn.rollback()
        raise RuntimeError(f"Workspace routing failure: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.post("/api/auth/register")
async def register_user(payload: AuthRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE username = %s;", (payload.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username is already claimed.")
        
        encrypted_password = hash_password(payload.password)
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id;", (payload.username, encrypted_password))
        user_id = cursor.fetchone()[0]
        conn.commit()
        
        token = create_access_token(str(user_id))
        return {"status": "success", "token": token, "username": payload.username}
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.post("/api/auth/login")
async def login_user(payload: AuthRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, password_hash FROM users WHERE username = %s;", (payload.username,))
        user_record = cursor.fetchone()
        if not user_record:
            raise HTTPException(status_code=401, detail="Invalid username or password credentials.")
            
        user_id, database_hashed_password = user_record
        if not verify_password(payload.password, database_hashed_password):
            raise HTTPException(status_code=401, detail="Invalid username or password credentials.")
            
        token = create_access_token(str(user_id))
        return {"status": "success", "token": token, "username": payload.username}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failure: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/api/workspaces")
async def list_workspaces(current_user: str = Depends(get_current_user)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, workspace_name FROM workspaces WHERE user_id = %s;", (int(current_user),))
        records = cursor.fetchall()
        cursor.close()
        conn.close()
        return [{"id": r[0], "workspace_name": r[1]} for r in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch registries: {str(e)}")

@app.post("/api/workspaces")
async def create_workspace(payload: dict, current_user: str = Depends(get_current_user)):
    name = payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Missing workspace name parameter.")
    try:
        workspace_uuid = get_or_create_workspace(int(current_user), name)
        return {"status": "success", "workspace_id": workspace_uuid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/assistant/ingest")
async def ingest_codebase(
    file: UploadFile = File(...), 
    x_workspace_name: str = Header("default-project"), 
    current_user: str = Depends(get_current_user)
):
    try:
        user_id = int(current_user)
        workspace_uuid = get_or_create_workspace(user_id, x_workspace_name)
        
        unique_zip_name = f"{int(time.time() * 1000)}_{file.filename}"
        zip_path = os.path.join(BASE_STORAGE_DIR, unique_zip_name)
        
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extraction_dir = os.path.join(BASE_STORAGE_DIR, f"extracted_{int(time.time() * 1000)}")
        os.makedirs(extraction_dir, exist_ok=True)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extraction_dir)

        raw_chunks = chunk(extraction_dir)
        if not raw_chunks:
            return {"status": "empty", "message": "No valid source code text fields found."}
        
        embedded_chunks = get_embedings(raw_chunks)
        save_to_database(embedded_chunks, workspace_uuid)
        
        os.remove(zip_path)
        shutil.rmtree(extraction_dir, ignore_errors=True)
        return {"status": "success", "message": f"Successfully loaded project code directly to workspace: {x_workspace_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assistant/ask")
async def ask_codebase(
    q: str = Query(..., alias="q"), 
    x_workspace_name: str = Header("default-project"), 
    current_user: str = Depends(get_current_user)
):
    try:
        user_id = int(current_user)
        workspace_uuid = get_or_create_workspace(user_id, x_workspace_name)
        relevant_chunks = get_top_k(q, workspace_uuid, k=3)
        
        if not relevant_chunks:
            return f"No context records found relative to question inside workspace: [{x_workspace_name}]"
            
        return generate_answer(q, relevant_chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)