import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000/chat'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: data.answer, sources: data.sources },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: `Error: ${err.message}`, sources: [] },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat">
      <h1>Ask Your Notes</h1>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <p>{m.content}</p>
            {m.sources?.length > 0 && (
              <details className="sources">
                <summary>Sources ({m.sources.length})</summary>
                {m.sources.map((s, j) => (
                  <div key={j} className="source">
                    <strong>{s.note} #{s.chunk_index}</strong>{' '}
                    <span>({s.score.toFixed(3)})</span>
                    <p>{s.content}</p>
                  </div>
                ))}
              </details>
            )}
          </div>
        ))}
        {loading && <div className="message bot">Thinking…</div>}
      </div>

      <form onSubmit={sendMessage} className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your notes…"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

export default App
