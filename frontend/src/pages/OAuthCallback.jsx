import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * OAuthCallback — Handles the redirect from the backend after Google/GitHub OAuth.
 *
 * The backend redirects here as:
 *   /oauth-callback?token=<JWT>&user=<JSON-encoded user>
 * or on failure:
 *   /oauth-callback?error=<message>
 */
export default function OAuthCallback() {
  const { processOAuthCallback } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing') // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    try {
      processOAuthCallback()
      setStatus('success')
      // Small delay so user sees the success state before redirect
      setTimeout(() => navigate('/dashboard', { replace: true }), 900)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'OAuth authentication failed.')
      // Redirect to login after a moment so they can retry
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-canvas)',
      gap: '1rem',
      padding: '2rem',
    }}>
      {status === 'processing' && (
        <>
          <Loader2
            size={40}
            style={{
              color: 'var(--accent-indigo)',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Completing sign-in…
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2
            size={40}
            style={{
              color: 'var(--color-success)',
              filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.45))',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Signed in successfully! Redirecting…
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle
            size={40}
            style={{ color: 'var(--color-error)' }}
          />
          <p style={{ color: 'var(--error-400)', fontSize: '0.95rem', textAlign: 'center', maxWidth: '34ch' }}>
            {errorMsg}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Redirecting back to login…
          </p>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
