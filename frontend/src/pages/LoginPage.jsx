import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LinearAuthCard } from '../components/auth/AuthSection'
import ThemeSelector from '../components/ui/ThemeSelector'
import ThemeAuthAtmosphere from '../components/auth/ThemeAuthAtmosphere'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isSignUpRoute = location.pathname === '/signup'
  const [activeTab, setActiveTab] = useState(isSignUpRoute ? 'signup' : 'signin')

  useEffect(() => {
    setActiveTab(location.pathname === '/signup' ? 'signup' : 'signin')
  }, [location.pathname])

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    navigate(tab === 'signup' ? '/signup' : '/login', { replace: true })
  }

  return (
    <div className={styles.pageContainer}>
      {/* Theme-matching Context-Aware Background Atmosphere */}
      <ThemeAuthAtmosphere />

      {/* Top Header */}
      <header className={styles.topHeader}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => navigate('/')}
          aria-label="Return to ContextIQ homepage"
        >
          <ArrowLeft size={14} />
          <span className={styles.logoBack}>
            <span className={styles.logoBackMark}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="url(#lp-g)" strokeWidth="1.25"/>
                <path d="M7 10h6M10 7v6" stroke="url(#lp-g2)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="2" fill="#5e6ad2"/>
                <defs>
                  <linearGradient id="lp-g" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22d3ee"/><stop offset="1" stopColor="#a855f7"/>
                  </linearGradient>
                  <linearGradient id="lp-g2" x1="7" y1="7" x2="13" y2="13" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22d3ee"/><stop offset="1" stopColor="#a855f7"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            ContextIQ
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeSelector />
          <div className={styles.statusIndicator}>
            <span className={styles.greenDot} />
            BERT v2.4 Operational
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={styles.mainContent}>
        <div className={styles.brandHeader}>
          <div className={styles.logoBadge}>
            <div className={styles.logoHalo} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="rgba(255,255,255,0.18)" strokeWidth="1.25" />
              <path d="M7 12h10M12 7v10" stroke="url(#lb-g)" strokeWidth="1.75" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3" fill="#5e6ad2" />
              <defs>
                <linearGradient id="lb-g" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#67e8f9" />
                  <stop offset="0.5" stopColor="#5e6ad2" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className={styles.pageTitle}>
            {activeTab === 'signin' ? 'Sign in to ContextIQ' : 'Create your workspace'}
          </h1>
          <p className={styles.pageSub}>
            Extractive question-answering with zero hallucinations
          </p>
        </div>

        <div className={styles.cardWrapper}>
          <LinearAuthCard activeTab={activeTab} onSwitchTab={handleTabSwitch} />
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} ContextIQ Technologies Inc.</span>
        <div className={styles.footerLinks}>
          <button type="button" className={styles.footerLink} onClick={() => navigate('/')}>Home</button>
          <button type="button" className={styles.footerLink}>Privacy</button>
          <button type="button" className={styles.footerLink}>Terms</button>
          <button type="button" className={styles.footerLink}>Security</button>
        </div>
      </footer>
    </div>
  )
}
