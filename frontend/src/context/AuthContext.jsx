import { createContext, useCallback, useContext, useState } from 'react'
import { clearToken, getToken, login as apiLogin } from '../api/client'

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json)
    if (claims.exp && claims.exp * 1000 < Date.now()) return null
    return claims
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken()
    return token ? decodeToken(token) : null
  })

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password)
    setUser(decodeToken(data.access_token))
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
