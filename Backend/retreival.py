import os
from sentence_transformers import SentenceTransformer
import psycopg2
from pgvector.psycopg2 import register_vector
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

client = Groq()
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def vectorize_query(query):
    embedded = model.encode(query)
    return embedded

def get_top_k(query,repo_id,k = 3):
    embedded = vectorize_query(query).tolist()
    #Boilerplate to estabalish db connection

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
    register_vector(conn)

    query_sql = """
        SELECT file_path, code_content 
        FROM code_chunks 
        WHERE repo_id = %s
        ORDER BY embedding <=> %s::vector
        LIMIT %s;
    """
    cursor.execute(query_sql,(repo_id,embedded,k))
    candidates = cursor.fetchall()

    cursor.close()
    conn.close()
    return candidates

def generate_answer(query,search_results):
    blocks = []
    for file_path, code_content in search_results:
        blocks.append(f"File:{file_path}\nCode:{code_content}\n")
    full_context = "\n---\n".join(blocks)

    system_prompt = (
        "You are an expert codebase assistant. Answer the user's question using ONLY the provided code context.\n"
        "You MUST format your response exactly using this Markdown layout:\n\n"
        "### 📁 Location\n"
        "* **File:** [File Path]\n\n"
        "### 💻 Exact Snippet\n"
        "```[language]\n"
        "[Exact code snippet]\n"
        "```\n\n"
        "### 💡 Pro Tips & Analysis\n"
        "* [Bullet points with tips or optimization advice]"
    )

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{full_context}\n\nQuestion: {query}"}
        ],
        temperature=0.2 # Low temperature keeps it precise and factual to your code
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    # Test your query
    test_query = "What are the attributes of Alien class?"
    print(f"Searching for: '{test_query}'...\n")
    
    # 1. Fetch relevant blocks from Postgres
    relevant_chunks = get_top_k(test_query, k=3)
    
    # 2. Feed them into Groq to generate the formatted answer
    assistant_response = generate_answer(test_query, relevant_chunks)
    
    # 3. Print the beautifully structured results
    print("\n================ ASSISTANT ANSWER ================\n")
    print(assistant_response)
    print("\n==================================================\n")
