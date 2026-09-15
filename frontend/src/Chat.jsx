import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import SendIcon from '@mui/icons-material/Send'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import LogoutIcon from '@mui/icons-material/Logout'
import { supabase } from './supabaseClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Chat({ session }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const fileInputRef = useRef(null)

  function authHeaders() {
    return { Authorization: `Bearer ${session.access_token}` }
  }

  async function sendMessage(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
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

  async function uploadNote(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    setUploadStatus({ severity: 'info', text: `Uploading ${file.name}…` })
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const data = await res.json()
      setUploadStatus({ severity: 'success', text: `Uploaded ${file.name} — ${data.chunks} chunk(s) indexed.` })
    } catch (err) {
      setUploadStatus({ severity: 'error', text: err.message })
    }
  }

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" gutterBottom>
          Ask Your Notes
        </Typography>
        <Tooltip title="Sign out">
          <IconButton onClick={() => supabase.auth.signOut()} size="small">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          size="small"
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current.click()}
        >
          Upload note
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          hidden
          onChange={uploadNote}
        />
      </Box>
      {uploadStatus && (
        <Alert severity={uploadStatus.severity} sx={{ mb: 1 }} onClose={() => setUploadStatus(null)}>
          {uploadStatus.text}
        </Alert>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1,
                bgcolor: m.role === 'user' ? 'primary.main' : 'grey.100',
                color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                borderRadius: 2,
              }}
            >
              <Typography component="div" variant="body1">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </Typography>
            </Paper>

            {m.sources?.length > 0 && (
              <Accordion sx={{ mt: 0.5 }} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="caption">Sources ({m.sources.length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {m.sources.map((s, j) => (
                    <Box key={j}>
                      <Typography variant="caption" fontWeight="bold">
                        {s.note} #{s.chunk_index}
                      </Typography>{' '}
                      <Typography variant="caption" color="text.secondary">
                        ({s.score.toFixed(3)})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.content}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-start' }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Thinking…
            </Typography>
          </Box>
        )}
      </Box>

      <Box component="form" onSubmit={sendMessage} sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your notes…"
          disabled={loading}
        />
        <Button type="submit" variant="contained" endIcon={<SendIcon />} disabled={loading || !input.trim()}>
          Send
        </Button>
      </Box>
    </Container>
  )
}

export default Chat
