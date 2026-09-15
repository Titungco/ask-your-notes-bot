# Ask Your Notes Bot

Hosted, multi-user RAG over your own Markdown notes: Groq for chat, Gemini for embeddings, Supabase for auth + Postgres/pgvector storage.

## Prerequisites

- A Supabase project, with:
  - the `pgvector` extension enabled (Database > Extensions)
  - email magic-link auth enabled (on by default)
- A [Groq API key](https://console.groq.com)
- A [Gemini API key](https://aistudio.google.com/apikey)

## Configure

Run the setup wizard — it walks you through creating the Supabase project, enabling pgvector, and grabbing the Groq/Gemini API keys, and writes them into `backend/.env` and `frontend/.env` for you:

```bash
./scripts/setup-cloud.sh
```

Or do it by hand: copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env`, then fill in the values yourself.

## Run it locally

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Sign in with a magic link, then use "Upload note" to add `.md` files (try the ones in `sample-notes/`) and ask questions about them.

## Deploy

- **Frontend**: Vercel, pointed at `frontend/`, with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` (your Render backend URL) set as environment variables.
- **Backend**: Render, via the `render.yaml` Blueprint at the repo root (New > Blueprint, select this repo) — it prompts for the secret env vars at setup time. Alternatively, create a Web Service by hand pointed at `backend/` (`uvicorn main:app --host 0.0.0.0 --port $PORT`, Free plan) with the same variables as `backend/.env` plus `FRONTEND_URL` set to your Vercel URL.

Notes are append-only in this version — no edit/delete yet (see `docs/adr/0003-notes-are-append-only.md`).
