import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // initial session check
  const [error, setError]     = useState(null)

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('contextiq_token')
    const stored = localStorage.getItem('contextiq_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('contextiq_user')
      }
    }
    setLoading(false)
  }, [])

  // ── Sign In ───────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    setError(null)
    const data = await authApi.signIn(email, password)
    localStorage.setItem('contextiq_token', data.access_token)
    localStorage.setItem('contextiq_user', JSON.stringify(data.user))
    // Notify ThemeProvider (same-tab) that the active user changed
    window.dispatchEvent(new StorageEvent('storage', { key: 'contextiq_user' }))
    setUser(data.user)
    return data
  }, [])

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async (fullName, email, password) => {
    setError(null)
    const data = await authApi.signUp(fullName, email, password)
    localStorage.setItem('contextiq_token', data.access_token)
    localStorage.setItem('contextiq_user', JSON.stringify(data.user))
    window.dispatchEvent(new StorageEvent('storage', { key: 'contextiq_user' }))
    setUser(data.user)
    return data
  }, [])

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(() => {
    authApi.signOut()
    window.dispatchEvent(new StorageEvent('storage', { key: 'contextiq_user' }))
    setUser(null)
  }, [])

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    return authApi.signInWithGoogle()
  }, [])

  // ── GitHub OAuth ──────────────────────────────────────────────────────────
  const signInWithGithub = useCallback(async () => {
    return authApi.signInWithGithub()
  }, [])

  // ── Process OAuth callback (called from /oauth-callback page) ─────────────
  const processOAuthCallback = useCallback(() => {
    const result = authApi.processOAuthCallback()
    window.dispatchEvent(new StorageEvent('storage', { key: 'contextiq_user' }))
    setUser(result.user)
    return result
  }, [])

  const getOAuthStatus = useCallback(async () => {
    return authApi.getOAuthStatus()
  }, [])

  const saveOAuthCredentials = useCallback(async (creds) => {
    return authApi.saveOAuthCredentials(creds)
  }, [])

  const value = {
    user, loading, error, setError,
    signIn, signUp, signOut,
    signInWithGoogle, signInWithGithub, processOAuthCallback,
    getOAuthStatus, saveOAuthCredentials,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
