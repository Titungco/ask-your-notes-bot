import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import get_current_user_id
from db import get_conn
from rag import TOP_K, answer, chunk_text, embed, to_pgvector

app = FastAPI()

allowed_origins = ["http://localhost:5173"]
if frontend_url := os.environ.get("FRONTEND_URL"):
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NoteResponse(BaseModel):
    note_id: str
    chunks: int


@app.post("/notes", response_model=NoteResponse)
async def upload_note(file: UploadFile, user_id: str = Depends(get_current_user_id)) -> NoteResponse:
    text = (await file.read()).decode("utf-8")
    chunks = chunk_text(text)

    conn = get_conn()
    row = conn.execute(
        "INSERT INTO notes (user_id, filename, content) VALUES (%s, %s, %s) RETURNING id",
        (user_id, file.filename, text),
    ).fetchone()
    note_id = row[0]

    for i, chunk in enumerate(chunks):
        vector = to_pgvector(embed(chunk))
        conn.execute(
            "INSERT INTO chunks (note_id, user_id, chunk_index, content, embedding) "
            "VALUES (%s, %s, %s, %s, %s::vector)",
            (note_id, user_id, i, chunk, vector),
        )
    conn.close()

    return NoteResponse(note_id=str(note_id), chunks=len(chunks))


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
def chat(req: ChatRequest, user_id: str = Depends(get_current_user_id)) -> ChatResponse:
    vector = to_pgvector(embed(req.message))

    conn = get_conn()
    rows = conn.execute(
        """
        SELECT n.filename, c.chunk_index, c.content, 1 - (c.embedding <=> %s::vector) AS score
        FROM chunks c
        JOIN notes n ON n.id = c.note_id
        WHERE c.user_id = %s
        ORDER BY c.embedding <=> %s::vector
        LIMIT %s
        """,
        (vector, user_id, vector, TOP_K),
    ).fetchall()
    conn.close()

    sources = [Source(note=r[0], chunk_index=r[1], content=r[2], score=r[3]) for r in rows]
    context = "\n\n".join(f"[{s.note} #{s.chunk_index}]\n{s.content}" for s in sources)

    return ChatResponse(answer=answer(req.message, context), sources=sources)
