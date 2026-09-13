import ollama

EMBED_MODEL = "mxbai-embed-large"
CHAT_MODEL = "qwen3"
TOP_K = 4


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
    return ollama.embeddings(model=EMBED_MODEL, prompt=text)["embedding"]


def to_pgvector(embedding: list[float]) -> str:
    return "[" + ",".join(repr(x) for x in embedding) + "]"
