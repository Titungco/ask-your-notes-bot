# Queries are independent; no conversation memory

This project is a chat UI, which normally implies follow-ups can reference earlier turns. We decided each Query is answered using only its own text — no prior messages are passed into retrieval or the Answer. This keeps the first version focused on the core RAG loop (chunk → embed → retrieve → answer) without also designing how history should shape retrieval. Follow-ups like "what about the second one?" won't resolve correctly yet; adding a Conversation concept and history-aware retrieval is a deliberate future step, not an oversight.
