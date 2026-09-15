# Ask Your Notes Bot

A hosted, multi-user RAG (retrieval-augmented generation) system that answers questions using each user's own Markdown notes.

## Language

**User**:
A person who has signed in and owns a private collection of Notes. The boundary that keeps one person's Notes, Chunks, and Answers isolated from everyone else's.
_Avoid_: Account, customer

**Note**:
A Markdown document uploaded by a User, visible only to that User.
_Avoid_: Document, file

**Chunk**:
A contiguous slice of a Note's text, sized to fit the embedding model and overlapping slightly with its neighbors. The unit that gets embedded, stored, and retrieved.
_Avoid_: Passage, segment, snippet

**Ingestion**:
The pipeline that runs when a User adds a Note: splits it into Chunks, embeds each Chunk, and writes them to the Vector Store.
_Avoid_: Indexing, loading

**Embedding**:
The numeric vector representation of a Chunk's text (or of a Query), produced by the embedding model, used to measure similarity between them.
_Avoid_: Vector (on its own)

**Vector Store**:
The Postgres + pgvector table that persists Chunks alongside their Embeddings and supports similarity search over them.
_Avoid_: Database, vector DB, index

**Query**:
A signed-in User's question submitted through the chat UI. Each Query stands alone — it is answered using only its own text, with no memory of earlier messages.
_Avoid_: Question, prompt

**Retrieval**:
The step that embeds a Query and finds the top-k most similar Chunks — searched only among the querying User's own Chunks — in the Vector Store.
_Avoid_: Search, lookup

**Source**:
A retrieved Chunk shown to the User alongside an Answer, identifying which Note it came from.
_Avoid_: Citation, reference

**Answer**:
The model's response to a Query, generated from the Query and its retrieved Sources.
_Avoid_: Response, completion
