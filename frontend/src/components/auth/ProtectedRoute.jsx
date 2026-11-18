import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--navy-950)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--glass-border)',
          borderTopColor: 'var(--cyan-400)',
          borderRadius: '50%',
          animation: 'spin-slow 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return user ? children : <Navigate to="/" replace />
}
