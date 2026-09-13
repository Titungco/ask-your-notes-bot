import pathlib

from db import get_conn
from rag import chunk_text, embed, to_pgvector

NOTES_DIR = pathlib.Path(__file__).resolve().parent.parent / "notes"


def main() -> None:
    conn = get_conn()
    conn.execute("TRUNCATE chunks")
    for path in sorted(NOTES_DIR.glob("*.md")):
        chunks = chunk_text(path.read_text())
        for i, chunk in enumerate(chunks):
            vector = to_pgvector(embed(chunk))
            conn.execute(
                "INSERT INTO chunks (note_path, chunk_index, content, embedding) "
                "VALUES (%s, %s, %s, %s::vector)",
                (path.name, i, chunk, vector),
            )
        print(f"{path.name}: {len(chunks)} chunks")
    conn.close()


if __name__ == "__main__":
    main()
