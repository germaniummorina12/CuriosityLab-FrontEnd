import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'curiositylab.session'

const ACCOUNTS = [
  { id: 'admin', name: 'Administrator', role: 'admin', tile: 'A' },
  { id: 'user', name: 'Guest User', role: 'user', tile: 'U' },
]

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  }, [session])

  const login = (accountId) => {
    const account = ACCOUNTS.find((a) => a.id === accountId)
    if (!account) return
    setSession(account)
  }

  const logout = () => setSession(null)

  const isAdmin = session?.role === 'admin'

  return (
    <AuthContext.Provider value={{ session, accounts: ACCOUNTS, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
