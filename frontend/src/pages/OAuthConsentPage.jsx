import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ArrowRight, CheckCircle2, ChevronRight,
  Settings, Key, ExternalLink, Loader2, Sparkles, UserPlus
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './OAuthConsentPage.module.css'

function GoogleBrandIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  )
}

function GithubBrandIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

function ContextIqLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="#5e6ad2" strokeWidth="1.5"/>
      <path d="M7 10h6M10 7v6" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="2" fill="#5e6ad2"/>
    </svg>
  )
}

export default function OAuthConsentPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { saveOAuthCredentials } = useAuth()

  const provider = (params.get('provider') || 'google').toLowerCase()
  const isGoogle = provider === 'google'

  const [loading, setLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [preferredEmail, setPreferredEmail] = useState('prakashbhattacharya102@gmail.com')

  useEffect(() => {
    fetch('/api/auth/oauth/status')
      .then(res => res.json())
      .then(data => {
        const pEmail = data?.[provider]?.preferred_email
        if (pEmail) setPreferredEmail(pEmail)
      })
      .catch(() => {})
  }, [provider])

  // Custom user inputs
  const [customName, setCustomName]   = useState('')
  const [customEmail, setCustomEmail] = useState('')

  // Live Keys inputs
  const [googleId, setGoogleId]         = useState('')
  const [googleSecret, setGoogleSecret] = useState('')
  const [githubId, setGithubId]         = useState('')
  const [githubSecret, setGithubSecret] = useState('')
  const [savingKeys, setSavingKeys]     = useState(false)
  const [keyNotice, setKeyNotice]       = useState('')

  const handleAuthorize = (name, email) => {
    setLoading(true)
    const url = `/api/auth/oauth/sandbox/authorize?provider=${provider}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
    window.location.href = url
  }

  const handleSaveKeys = async (e) => {
    e.preventDefault()
    setSavingKeys(true)
    setKeyNotice('')
    try {
      await saveOAuthCredentials({
        google_client_id: googleId,
        google_client_secret: googleSecret,
        github_client_id: githubId,
        github_client_secret: githubSecret,
      })
      setKeyNotice('Credentials saved! Redirecting to live provider...')
      setTimeout(() => {
        if (isGoogle && googleId) {
          window.location.href = '/api/auth/oauth/google/redirect'
        } else if (!isGoogle && githubId) {
          window.location.href = '/api/auth/oauth/github/redirect'
        } else {
          setKeyNotice('Credentials updated successfully.')
          setSavingKeys(false)
        }
      }, 1000)
    } catch (err) {
      setKeyNotice(`Failed to save: ${err.message}`)
      setSavingKeys(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />

      {/* Developer Sandbox Notice Banner */}
      <div className={styles.devBanner}>
        <div className={styles.devBannerText}>
          <span className={styles.devBadge}>Sandbox Mode</span>
          <span>Instant 1-click OAuth authentication active</span>
        </div>
        <button
          type="button"
          className={styles.configToggleBtn}
          onClick={() => setShowConfig(!showConfig)}
          id="toggle-oauth-keys-btn"
        >
          <Key size={12} style={{ display: 'inline', marginRight: 4 }} />
          {showConfig ? 'Close Keys' : 'Live API Keys'}
        </button>
      </div>

      {/* Expandable Key Configuration Drawer */}
      {showConfig && (
        <form onSubmit={handleSaveKeys} className={styles.configDrawer}>
          <div className={styles.configTitle}>
            <Settings size={16} />
            <span>Configure Live OAuth Credentials</span>
          </div>
          <p className={styles.configDesc}>
            To switch from Sandbox Mode to official Google Cloud or GitHub OAuth, enter your app keys below.
            They will be saved directly to <code>backend/.env</code> and take effect immediately.
          </p>

          {isGoogle ? (
            <>
              <div className={styles.configField}>
                <label className={styles.configLabel}>Google Client ID</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                  value={googleId}
                  onChange={(e) => setGoogleId(e.target.value)}
                  className={styles.configInput}
                />
              </div>
              <div className={styles.configField}>
                <label className={styles.configLabel}>Google Client Secret</label>
                <input
                  type="password"
                  placeholder="GOCSPX-..."
                  value={googleSecret}
                  onChange={(e) => setGoogleSecret(e.target.value)}
                  className={styles.configInput}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.configField}>
                <label className={styles.configLabel}>GitHub Client ID</label>
                <input
                  type="text"
                  placeholder="e.g. Iv1.abcdef123456"
                  value={githubId}
                  onChange={(e) => setGithubId(e.target.value)}
                  className={styles.configInput}
                />
              </div>
              <div className={styles.configField}>
                <label className={styles.configLabel}>GitHub Client Secret</label>
                <input
                  type="password"
                  placeholder="e.g. 0123456789abcdef..."
                  value={githubSecret}
                  onChange={(e) => setGithubSecret(e.target.value)}
                  className={styles.configInput}
                />
              </div>
            </>
          )}

          {keyNotice && (
            <div style={{ fontSize: '0.8rem', color: keyNotice.includes('Failed') ? '#f87171' : '#34d399' }}>
              {keyNotice}
            </div>
          )}

          <button
            type="submit"
            className={styles.configSaveBtn}
            disabled={savingKeys}
          >
            {savingKeys ? 'Saving...' : 'Save & Switch to Live OAuth'}
          </button>
        </form>
      )}

      {/* Main Consent Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.brandRow}>
            <div className={styles.brandLogo}>
              {isGoogle ? <GoogleBrandIcon /> : <GithubBrandIcon />}
            </div>
            <div className={styles.connectArrow}>
              <ArrowRight size={18} />
            </div>
            <div className={styles.brandLogo}>
              <ContextIqLogo />
            </div>
          </div>

          <h1 className={styles.cardTitle}>
            {isGoogle ? 'Sign in with Google' : 'Authorize ContextIQ'}
          </h1>
          <p className={styles.cardSub}>
            {isGoogle
              ? 'Choose an account to continue to ContextIQ'
              : 'ContextIQ by Antigravity wants to access your GitHub account'}
          </p>
        </div>

        <div className={styles.cardBody}>
          {isGoogle ? (
            /* Google Account Picker View */
            <div className={styles.accountList}>
              <button
                type="button"
                className={styles.accountOption}
                id="oauth-account-prakash"
                onClick={() => handleAuthorize('Prakash Bhattacharya', preferredEmail)}
                disabled={loading}
              >
                <div className={styles.accountAvatar}>P</div>
                <div className={styles.accountInfo}>
                  <div className={styles.accountName}>Prakash Bhattacharya</div>
                  <div className={styles.accountEmail}>{preferredEmail}</div>
                </div>
                <div className={styles.accountArrow}>
                  <ChevronRight size={18} />
                </div>
              </button>

              <button
                type="button"
                className={styles.accountOption}
                id="oauth-account-demo"
                onClick={() => handleAuthorize('Demo User', 'demo@contextiq.ai')}
                disabled={loading}
              >
                <div className={styles.accountAvatar} style={{ background: '#6366f1' }}>D</div>
                <div className={styles.accountInfo}>
                  <div className={styles.accountName}>Demo User</div>
                  <div className={styles.accountEmail}>demo@contextiq.ai</div>
                </div>
                <div className={styles.accountArrow}>
                  <ChevronRight size={18} />
                </div>
              </button>

              {!showCustom ? (
                <button
                  type="button"
                  className={styles.accountOption}
                  onClick={() => setShowCustom(true)}
                  style={{ opacity: 0.8 }}
                >
                  <div className={styles.accountAvatar} style={{ background: '#374151' }}>
                    <UserPlus size={16} />
                  </div>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>Use another account</div>
                    <div className={styles.accountEmail}>Sign in with custom name & email</div>
                  </div>
                  <div className={styles.accountArrow}>
                    <ChevronRight size={18} />
                  </div>
                </button>
              ) : (
                <div className={styles.customAccountForm}>
                  <input
                    type="text"
                    placeholder="Full name (e.g. John Doe)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className={styles.customInput}
                  />
                  <input
                    type="email"
                    placeholder="Email address (e.g. john@company.com)"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className={styles.customInput}
                  />
                  <button
                    type="button"
                    className={styles.customSubmitBtn}
                    onClick={() => {
                      if (!customEmail) return
                      handleAuthorize(customName || 'Google User', customEmail)
                    }}
                    disabled={!customEmail || loading}
                  >
                    Continue with this account
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* GitHub Authorization View */
            <>
              <div className={styles.accountOption} style={{ cursor: 'default' }}>
                <div className={`${styles.accountAvatar} ${styles.githubAvatar}`}>P</div>
                <div className={styles.accountInfo}>
                  <div className={styles.accountName}>Prakash Bhattacharya</div>
                  <div className={styles.accountEmail}>@prakash-bhattacharya • {preferredEmail}</div>
                </div>
                <CheckCircle2 size={18} color="#34d399" />
              </div>

              <div className={styles.permissionsBox}>
                <div className={styles.permissionsHeading}>This application will be able to:</div>
                <div className={permissionStyles()}>
                  <div className={styles.permissionItem}>
                    <CheckCircle2 size={15} className={styles.permIcon} />
                    <span>Verify your GitHub account identity and profile</span>
                  </div>
                  <div className={styles.permissionItem}>
                    <CheckCircle2 size={15} className={styles.permIcon} />
                    <span>Read your public and verified email addresses</span>
                  </div>
                  <div className={styles.permissionItem}>
                    <CheckCircle2 size={15} className={styles.permIcon} />
                    <span>Seamlessly access your ContextIQ AI workspace</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  id="github-authorize-btn"
                  className={`${styles.authorizeBtn} ${styles.githubBtn}`}
                  onClick={() => handleAuthorize('Prakash Bhattacharya', preferredEmail)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={16} className={styles.spinner} />
                  ) : (
                    <>
                      <GithubBrandIcon />
                      <span>Authorize ContextIQ</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate('/login')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {isGoogle && (
            <div className={styles.permissionsBox}>
              <div className={styles.permissionsHeading}>Permissions Requested</div>
              <div className={styles.permissionItem}>
                <CheckCircle2 size={15} className={styles.permIcon} />
                <span>See your personal info (name, email address, profile picture)</span>
              </div>
            </div>
          )}

          {isGoogle && (
            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          To continue, {isGoogle ? 'Google' : 'GitHub'} will share your name, email address, and profile picture with ContextIQ.
          See ContextIQ's Privacy Policy and Terms of Service.
        </div>
      </div>
    </div>
  )
}

function permissionStyles() {
  return ''
}
