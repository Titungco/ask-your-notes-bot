import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { supabase } from './supabaseClient'

function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function sendMagicLink(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
      <Typography variant="h5">Ask Your Notes</Typography>

      {sent ? (
        <Alert severity="success">Check your email for a sign-in link.</Alert>
      ) : (
        <Box component="form" onSubmit={sendMagicLink} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="contained">
            Send magic link
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      )}
    </Container>
  )
}

export default SignIn
