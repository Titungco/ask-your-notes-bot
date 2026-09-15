# Notes are append-only in v1

Uploading a Note chunks and embeds it into the User's Vector Store scope, but there is no way yet to edit or delete a Note once uploaded. Removing a Chunk or re-ingesting a changed Note needs explicit deletion and re-embedding logic that hasn't been built. This is a deliberate scope cut to prove the core upload → ask → answer loop first, not an oversight — similar in spirit to [ADR-0001](./0001-independent-queries-no-conversation-memory.md)'s decision to defer conversation memory.
