import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import SignIn from './SignIn'
import Chat from './Chat'

function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  return session ? <Chat session={session} /> : <SignIn />
}

export default App
