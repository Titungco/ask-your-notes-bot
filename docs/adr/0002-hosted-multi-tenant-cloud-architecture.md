# Replace local single-user app with hosted multi-tenant cloud app

This project started as a local-only, single-user RAG bot: Ollama for both chat and embeddings, Postgres/pgvector in local Docker, notes read from a filesystem folder. The goal shifted to learning cloud deployment, and we replaced this entirely rather than keeping both modes.

Going cloud forced two changes at once. First, the backend now runs on a server (Render), which can't reach local Ollama, so chat moved to Groq and embeddings moved to Gemini — two different providers because Groq doesn't offer embedding models. Second, since supporting multiple people was itself a stated goal, this became a real multi-tenant app: Notes are now private per User (Supabase Auth + a Vector Store scoped by user) rather than one shared corpus.

We considered keeping a local mode and a cloud mode side by side behind a swappable backend, but that means solving backend-swapping and multi-tenancy at the same time. We chose to commit fully to the cloud version instead, accepting free-tier limitations (Render cold starts, Supabase pausing after a week of inactivity, Groq/Gemini rate limits) as a deliberate tradeoff for a $0, learning-focused deployment. The old local-only version remains available in git history.
