import os

from google import genai
from google.genai import types
from groq import Groq

EMBED_MODEL = "gemini-embedding-001"
EMBED_DIM = 768
CHAT_MODEL = "openai/gpt-oss-120b"
TOP_K = 4

_gemini = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
_groq = Groq(api_key=os.environ["GROQ_API_KEY"])


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    """Pack paragraphs into ~chunk_size-word chunks, carrying the last
    `overlap` words of each chunk into the next one."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    current: list[str] = []
    for para in paragraphs:
        words = para.split()
        if current and len(current) + len(words) > chunk_size:
            chunks.append(" ".join(current))
            current = current[-overlap:] if overlap else []
        current.extend(words)
    if current:
        chunks.append(" ".join(current))
    return chunks


def embed(text: str) -> list[float]:
    result = _gemini.models.embed_content(
        model=EMBED_MODEL,
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=EMBED_DIM),
    )
    return result.embeddings[0].values


def to_pgvector(embedding: list[float]) -> str:
    return "[" + ",".join(repr(x) for x in embedding) + "]"


def answer(question: str, context: str) -> str:
    prompt = (
        "Answer the question using only the notes below. "
        "If the notes don't contain the answer, say you don't know.\n\n"
        f"Notes:\n{context}\n\nQuestion: {question}"
    )
    result = _groq.chat.completions.create(
        model=CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return result.choices[0].message.content
