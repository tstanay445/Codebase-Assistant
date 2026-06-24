import os
import zipfile
from langchain_text_splitters import Language,RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import psycopg2
import uuid
from pgvector.psycopg2 import register_vector

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def extract_codebase(zip_file_path,extraction_directory):

    """
        A function to extract the incoming directory to a specified folder
    """

    os.makedirs(extraction_directory,exist_ok=True)
    try:
        with zipfile.ZipFile(zip_file_path,'r') as f:
            f.extractall(extraction_directory)
            return extraction_directory
    except zipfile.BadZipFile:
        print("Error : This zip file cannot be extracted")
        return None
    
# zip_file_path = r"D:\GettingStartedWithSpring\Compressed file.zip"
# extraction_directory = r"D:\CodeBaseAssistantRAG"
# extract_codebase(zip_file_path,extraction_directory)

EXTENSION_MAPPING = {
    '.py': 'python', '.java': 'java', '.cpp': 'cpp', '.hpp': 'cpp',
    '.c': 'c', '.h': 'c', '.js': 'javascript', '.jsx': 'javascript',
    '.ts': 'typescript', '.tsx': 'typescript', '.md': 'markdown', '.html': 'html'
}

LANGCHAIN_ENUM_MAPPING = {
    'python': Language.PYTHON, 'java': Language.JAVA, 'cpp': Language.CPP,
    'c': Language.C, 'javascript': Language.JS, 'typescript': Language.TS,
    'markdown': Language.MARKDOWN, 'html': Language.HTML
}



def chunk(dir_name):
    all_chunks = []
    for root, _ , files in os.walk(dir_name):
        for file in files:
            _ , ext = os.path.splitext(file)
            ext = ext.lower()

            if ext in EXTENSION_MAPPING:
                lang_str = EXTENSION_MAPPING[ext]
                lang_enum = LANGCHAIN_ENUM_MAPPING[lang_str]
                path_to_file = os.path.join(root,file)
                try:
                    with open(path_to_file,'r',encoding='utf-8') as f:
                        content = f.read()
                    if not content.strip():
                        continue
                    splitter = RecursiveCharacterTextSplitter.from_language(
                        language = lang_enum,
                        chunk_size = 1200,
                        chunk_overlap = 200
                    )

                    docs = splitter.create_documents([content])

                    for idx,doc in enumerate(docs):
                        snippet = doc.page_content
                        start_char = content.find(snippet)
                        start_line = content.count('\n', 0, max(0, start_char)) + 1
                        end_line = start_line + snippet.count('\n')

                        all_chunks.append({
                            "file_path": os.path.relpath(path_to_file, dir_name),
                            "content": snippet,
                            "metadata": {
                                "language": lang_str,
                                "start_line": start_line,
                                "end_line": end_line,
                                "chunk_index": idx
                            }
                        })
                except UnicodeDecodeError:
                    print("skipping this binary file , file name " + file)
    print(f"Generated {len(all_chunks)} chunks with rich metadata.")
    return all_chunks

def get_embedings(chunks):
    contents = [c['content'] for c in chunks]
    embeddings = model.encode(contents)
    for idx,c in enumerate(chunks):
        c['embedding'] = embeddings[idx]
    return chunks

def save_to_database(chunks,user_uuid):
    print("Connecting to local Docker database...")
    
    # Matches the credentials from your Docker command
    conn = psycopg2.connect(
        dbname="vectordb",
        user="postgres",
        password="0000",
        host="localhost",
        port="5433"
    )
    
    cursor = conn.cursor()
    
    # 1. Ensure pgvector is enabled and create the table if it doesn't exist
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS code_chunks (
            id UUID PRIMARY KEY,
            repo_id UUID,
            file_path VARCHAR(255),
            start_line INT,
            end_line INT,
            language VARCHAR(50),
            code_content TEXT,
            embedding VECTOR(384) -- 384 dimensions for all-MiniLM-L6-v2
        );
    """)
    conn.commit()
    
    # 2. Register pgvector with psycopg2
    register_vector(conn)
    
    dummy_repo_id = str(uuid.uuid4())
    print(f"Saving {len(chunks)} chunks to Postgres...")
    
    # 3. Insert the chunks
    for chunk in chunks:
        chunk_id = str(uuid.uuid4())
        meta = chunk['metadata']
        
        cursor.execute(
            """
            INSERT INTO code_chunks 
            (id, repo_id, file_path, start_line, end_line, language, code_content, embedding) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                chunk_id, 
                user_uuid, # 👈 Save under the specific user's deterministic UUID partition key!
                chunk['file_path'], 
                meta['start_line'], meta['end_line'], meta['language'], 
                chunk['content'], chunk['embedding']
            )
        )
        
    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Success: All chunks and vectors saved to the database!")