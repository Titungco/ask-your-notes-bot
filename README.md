# Ask Your Notes Bot

RAG over your own Markdown notes, fully local via Ollama + Postgres/pgvector.

## Prerequisites

- Ollama running locally with `ollama pull qwen3` and `ollama pull mxbai-embed-large`
- Docker (add yourself to the docker group first: `sudo usermod -aG docker $USER`, then relogin)

## Run it

```bash
# 1. Start Postgres + pgvector
docker compose up -d

# 2. Backend
cd backend
source .venv/bin/activate
python ingest.py          # chunks notes/*.md, embeds, stores in pgvector
uvicorn main:app --reload # serves http://localhost:8000

# 3. Frontend (separate terminal)
cd frontend
npm run dev                # serves http://localhost:5173
```

Drop more `.md` files into `notes/` and re-run `python ingest.py` to reindex.
