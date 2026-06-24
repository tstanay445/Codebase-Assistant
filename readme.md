# 🚀 CodeRAG: Multi-Tenant Codebase AI Assistant

[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](#)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?logo=fastapi&logoColor=white)](#)
[![Database](https://img.shields.io/badge/Database-Supabase%20%7C%20pgvector-3ECF8E?logo=supabase&logoColor=white)](#)
[![LLM](https://img.shields.io/badge/Inference-Groq%20%7C%20Llama%203.1-F55036?logo=llama&logoColor=white)](#)

**CodeRAG** is a cloud-native, multi-tenant AI codebase assistant. It enables developers to upload entire software repositories as compressed archives and interact with their code using natural language semantic search. By coupling high-performance vector search with low-latency LLMs, CodeRAG surfaces precise code paths, extracts exact execution context, and drafts architectural summaries securely partitioned by user workspaces.

---

## 🏗️ System Architecture

CodeRAG utilizes a completely decoupled full-stack architecture, optimizing heavy Machine Learning workloads for constrained cloud environments while maintaining sub-second inference speeds.

```mermaid
graph TD
    Client([🧑‍💻 Developer Client]) -->|Uploads Code / Queries| UI
    
    subgraph Frontend Cloud [Vercel]
        UI[⚛️ React + Vite UI]
    end
    
    UI -->|REST API (HTTPS)| API
    
    subgraph Backend Cloud [Hugging Face Spaces]
        API[🚀 FastAPI Orchestrator]
        Embedder[🧠 SentenceTransformers<br>all-MiniLM-L6-v2]
        
        API <-->|Lazy Load & Batching| Embedder
    end
    
    API <-->|IPv4 Pooler (Port 6543)| DB[(🐘 Supabase<br>PostgreSQL + pgvector)]
    API <-->|Context + Prompt| LLM[⚡ Groq Cloud<br>Llama 3.1 8B]
```

---

## ✨ Key Engineering Features

* **Strict Multi-Tenant Sandbox Isolation:** Utilizes deterministic workspace UUID partitioning within a shared PostgreSQL schema. This prevents cross-context data leakage, ensuring each developer's sandbox is completely isolated.
* **Memory-Safe Computational Pipeline:** Overcomes free-tier cloud memory ceilings (OOM limits) through a custom lazy-loading ML model initializer and an optimized chunk-batching algorithm, safely embedding massive codebases (60,000+ chunks).
* **High-Performance Semantic Lookup:** Implements cosine distance spatial lookups (`<=>`) on 384-dimensional dense vectors via `pgvector` to identify highly localized code blocks matching raw developer prompts.
* **Asymmetric Network Routing:** Bypasses standard IPv6 routing constraints by utilizing an outbound IPv4 transaction proxy pooler (Supavisor), guaranteeing zero-downtime connectivity inside containerized Docker nodes.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React 18, Vite
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

### Backend
* **Framework:** FastAPI, Uvicorn
* **AI Pipelines:** LangChain (Text Splitters), PyTorch
* **Embeddings:** Hugging Face `all-MiniLM-L6-v2`
* **Deployment:** Hugging Face Spaces (Docker Container)

### Data & Intelligence Layer
* **Vector Store:** Supabase (PostgreSQL with `pgvector` extension)
* **LLM Inference:** Groq API (`llama-3.1-8b-instant`)

---

## 📂 Repository Structure (Monorepo)

```text
coderag/
├── .gitignore          # Global monorepo protection rules
├── README.md           # Master documentation portal
├── frontend/           # Vite + React User Interface
│   ├── src/            
│   └── package.json    
└── backend/            # FastAPI AI Orchestration Engine
    ├── app.py          # Primary application gateway & routes
    ├── ingestion.py    # Code processing, chunking, & vectorization engine
    ├── retreival.py    # Vector similarity lookups & Groq completion logic
    └── requirements.txt
```

---

## 🚀 Local Development Guide

### 1. Environment Setup

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5433
```

**Backend (`backend/.env`):**
```env
# Ensure you URL-encode special characters in your password (e.g., @ becomes %40)
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@[aws-0-us-east-1.pooler.supabase.com:6543/postgres](https://aws-0-us-east-1.pooler.supabase.com:6543/postgres)
GROQ_API_KEY=gsk_your_secure_api_key_here
```

### 2. Booting the Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 5433 --reload
```

### 3. Booting the Frontend (Node)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing the Integration Pipeline

To completely validate the end-to-end integration, execute the following steps:
1. **Authentication:** Register a test user to validate `bcrypt` hashing, JWT generation, and Supabase insertions.
2. **Workspace Provisioning:** Create isolated workspace hubs to test dynamic UUID schema partitioning.
3. **Ingestion Engine:** Upload a clean `.zip` archive (exclude `node_modules`). Verify the extraction, LangChain chunking, and pgvector embeddings matrix generation.
4. **Semantic Retrieval Cycle:** Query the codebase. Verify top-$K$ similarity retrieval and exact Markdown formatting via the Groq LLM engine.