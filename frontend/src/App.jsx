import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AuthPage from './pages/AuthPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import OAuthCallback from './pages/OAuthCallback'
import OAuthConsentPage from './pages/OAuthConsentPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AmbientCanvas from './components/ui/AmbientCanvas'
import CustomCursor from './components/ui/CustomCursor'
import ThemeHud from './components/ui/ThemeHud'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AmbientCanvas />
        <CustomCursor />
        <ThemeHud />
        <Routes>
          <Route path="/" element={<AuthPage initialView="home" />} />
          <Route path="/features" element={<AuthPage initialView="features" />} />
          <Route path="/how-it-works" element={<AuthPage initialView="how-it-works" />} />
          <Route path="/technology" element={<AuthPage initialView="technology" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/oauth-consent" element={<OAuthConsentPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  )
}
