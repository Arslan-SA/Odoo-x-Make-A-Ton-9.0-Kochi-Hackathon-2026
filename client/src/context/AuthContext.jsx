import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { authApi } from '../services/api'

const TOKEN_KEY = 'token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  // Restore the session on a hard refresh.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) return undefined

    let active = true
    authApi
      .me()
      .then(({ data }) => {
        if (active && localStorage.getItem(TOKEN_KEY) === storedToken) {
          setUser(data.data.user)
        }
      })
      .catch(() => {
        if (active && localStorage.getItem(TOKEN_KEY) === storedToken) {
          clearSession()
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [clearSession])

  // A 401 from any API call means the token is dead; drop the session.
  useEffect(() => {
    window.addEventListener('auth:unauthorized', clearSession)
    return () => window.removeEventListener('auth:unauthorized', clearSession)
  }, [clearSession])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem(TOKEN_KEY, data.data.token)
    setUser(data.data.user)
    setLoading(false)
    return data.data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload)
    localStorage.setItem(TOKEN_KEY, data.data.token)
    setUser(data.data.user)
    setLoading(false)
    return data.data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // The token may already be invalid; clearing locally is still correct.
    }
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

