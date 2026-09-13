import ollama
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import get_conn
from rag import CHAT_MODEL, TOP_K, embed, to_pgvector

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class Source(BaseModel):
    note: str
    chunk_index: int
    content: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    vector = to_pgvector(embed(req.message))

    conn = get_conn()
    rows = conn.execute(
        """
        SELECT note_path, chunk_index, content, 1 - (embedding <=> %s::vector) AS score
        FROM chunks
        ORDER BY embedding <=> %s::vector
        LIMIT %s
        """,
        (vector, vector, TOP_K),
    ).fetchall()
    conn.close()

    sources = [Source(note=r[0], chunk_index=r[1], content=r[2], score=r[3]) for r in rows]

    context = "\n\n".join(f"[{s.note} #{s.chunk_index}]\n{s.content}" for s in sources)
    prompt = (
        "Answer the question using only the notes below. "
        "If the notes don't contain the answer, say you don't know.\n\n"
        f"Notes:\n{context}\n\nQuestion: {req.message}"
    )
    result = ollama.chat(model=CHAT_MODEL, messages=[{"role": "user", "content": prompt}])

    return ChatResponse(answer=result["message"]["content"], sources=sources)
