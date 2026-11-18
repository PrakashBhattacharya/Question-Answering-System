import React, { useState, useEffect, useCallback, useId } from 'react'
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, Zap,
  Sparkles, Terminal, ShieldCheck, Cpu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import ThemeAuthAtmosphere from './ThemeAuthAtmosphere'
import styles from './AuthSection.module.css'

/* ── Brand Icons ─────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

/* ── Password strength ──────────────────────────────────────── */
function scorePassword(pw) {
  if (!pw) return { score: 0, label: '', color: '#4a5060' }
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const levels = [
    { label: 'Weak',         color: '#f87171' },
    { label: 'Fair',         color: '#fb923c' },
    { label: 'Good',         color: '#60a5fa' },
    { label: 'Strong',       color: '#34d399' },
    { label: 'Very strong',  color: '#a78bfa' },
  ]
  return { score: Math.max(1, s), ...levels[Math.min(s, 4)] }
}

/* ── Input Field ────────────────────────────────────────────── */
function InputField({ label, id, type = 'text', value, onChange, error, icon: Icon, right, placeholder, autoComplete, hint }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
        {hint && <span className={styles.fieldHint}>{hint}</span>}
      </div>
      <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
        {Icon && (
          <span className={styles.inputIcon} aria-hidden="true">
            <Icon size={14} />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${styles.input} ${Icon ? styles.hasLeft : ''} ${right ? styles.hasRight : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        {right && <div className={styles.inputRight}>{right}</div>}
      </div>
      {error && (
        <span id={`${id}-err`} className={styles.fieldError} role="alert">
          <AlertCircle size={11} />
          {error}
        </span>
      )}
    </div>
  )
}

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" className={styles.eyeBtn} onClick={onToggle} aria-label={show ? 'Hide' : 'Show'} tabIndex={-1}>
      {show ? <EyeOff size={13} /> : <Eye size={13} />}
    </button>
  )
}

function Notice({ msg, onDismiss }) {
  if (!msg) return null
  return (
    <div className={styles.notice} role="status">
      <span className={styles.noticeDot} />
      <span>{msg}</span>
      <button type="button" className={styles.noticeClose} onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SIGN IN FORM
══════════════════════════════════════════════════════════════ */
export function SignInForm({ onSwitch }) {
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth()
  const navigate = useNavigate()
  const uid = useId()

  const [form, setForm]         = useState({ email: '', password: '' })
  const [errors, setErrors]     = useState({})
  const [showPw, setShowPw]     = useState(false)
  const [remember, setRemember] = useState(false)
  const [status, setStatus]     = useState('idle')
  const [serverErr, setServerErr] = useState('')
  const [notice, setNotice]     = useState('')
  const [oauthLoading, setOauthLoading] = useState('')  // 'google' | 'github' | ''

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  const fillDemo = () => {
    setForm({ email: 'demo@contextiq.ai', password: 'Demo123!' })
    setErrors({})
    setServerErr('')
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setStatus('loading')
    setServerErr('')
    try {
      await signIn(form.email, form.password)
      setStatus('success')
      setTimeout(() => navigate('/dashboard'), 700)
    } catch (err) {
      setStatus('error')
      setServerErr(err.message || 'Sign in failed. Please verify your credentials.')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Welcome back</h2>
        <p className={styles.formSub}>Log in to your ContextIQ workspace</p>
      </div>

      {/* Demo autofill */}
      <button type="button" className={styles.demoBtn} onClick={fillDemo}>
        <Zap size={12} />
        Try demo account
      </button>

      {/* Social auth */}
      <div className={styles.socialRow}>
        <button
          type="button"
          id="signin-google-btn"
          className={`${styles.socialBtn} ${oauthLoading === 'google' ? styles.socialBtnLoading : ''}`}
          disabled={!!oauthLoading}
          onClick={async () => {
            setOauthLoading('google')
            setNotice('')
            setServerErr('')
            try {
              await signInWithGoogle()
              // If we reach here without a redirect, something unusual happened
            } catch (err) {
              setOauthLoading('')
              setNotice(err.message || 'Google sign-in is not available right now.')
            }
          }}
        >
          {oauthLoading === 'google'
            ? <Loader2 size={14} className={styles.spinner} />
            : <GoogleIcon />}
          <span>Google</span>
        </button>
        <button
          type="button"
          id="signin-github-btn"
          className={`${styles.socialBtn} ${oauthLoading === 'github' ? styles.socialBtnLoading : ''}`}
          disabled={!!oauthLoading}
          onClick={async () => {
            setOauthLoading('github')
            setNotice('')
            setServerErr('')
            try {
              await signInWithGithub()
            } catch (err) {
              setOauthLoading('')
              setNotice(err.message || 'GitHub sign-in is not available right now.')
            }
          }}
        >
          {oauthLoading === 'github'
            ? <Loader2 size={14} className={styles.spinner} />
            : <GithubIcon />}
          <span>GitHub</span>
        </button>
      </div>

      <Notice msg={notice} onDismiss={() => setNotice('')} />

      <div className={styles.orDivider}>
        <span>OR CONTINUE WITH EMAIL</span>
      </div>

      <InputField label="Email" id={`${uid}-email`} type="email"
        value={form.email} onChange={set('email')} error={errors.email}
        icon={Mail} placeholder="name@company.com" autoComplete="email" />

      <InputField label="Password" id={`${uid}-pw`}
        type={showPw ? 'text' : 'password'}
        value={form.password} onChange={set('password')} error={errors.password}
        icon={Lock} placeholder="Enter your password" autoComplete="current-password"
        right={<EyeToggle show={showPw} onToggle={() => setShowPw(v => !v)} />} />

      <div className={styles.formOptions}>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className={styles.checkInput} />
          <span className={styles.checkBox} />
          <span>Remember this session</span>
        </label>
        <button type="button" className={styles.forgotBtn}
          onClick={() => setNotice('Password reset link will be sent if account exists.')}>
          Forgot password?
        </button>
      </div>

      {serverErr && (
        <div className={styles.errorBox} role="alert">
          <AlertCircle size={13} />
          <span>{serverErr}</span>
        </div>
      )}

      <button type="submit" className={styles.primaryBtn}
        disabled={status === 'loading' || status === 'success'}>
        {status === 'loading' ? (
          <><Loader2 size={14} className={styles.spinner} /><span>Authenticating…</span></>
        ) : status === 'success' ? (
          <><CheckCircle2 size={14} /><span>Redirecting…</span></>
        ) : (
          <><span>Continue</span><span className={styles.kbdReturn}>↵</span></>
        )}
      </button>

      <p className={styles.switchLine}>
        Don't have an account?{' '}
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>Create account</button>
      </p>
    </form>
  )
}

/* ══════════════════════════════════════════════════════════════
   SIGN UP FORM
══════════════════════════════════════════════════════════════ */
export function SignUpForm({ onSwitch }) {
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth()
  const navigate = useNavigate()
  const uid = useId()

  const [form, setForm]     = useState({ fullName: '', email: '', password: '', confirm: '', terms: false })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw]   = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [status, setStatus]   = useState('idle')
  const [serverErr, setServerErr] = useState('')
  const [notice, setNotice]   = useState('')
  const [oauthLoading, setOauthLoading] = useState('')  // 'google' | 'github' | ''

  const set = k => e => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  const strength = scorePassword(form.password)

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Must be at least 8 characters'
    if (!form.confirm) e.confirm = 'Please confirm your password'
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    if (!form.terms) e.terms = 'Please accept the terms to continue'
    return e
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setStatus('loading')
    setServerErr('')
    try {
      await signUp(form.fullName, form.email, form.password)
      setStatus('success')
      setTimeout(() => navigate('/dashboard'), 700)
    } catch (err) {
      setStatus('error')
      setServerErr(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Create your workspace</h2>
        <p className={styles.formSub}>Extract precise answers from your documents</p>
      </div>

      {/* Social auth */}
      <div className={styles.socialRow}>
        <button
          type="button"
          id="signup-google-btn"
          className={`${styles.socialBtn} ${oauthLoading === 'google' ? styles.socialBtnLoading : ''}`}
          disabled={!!oauthLoading}
          onClick={async () => {
            setOauthLoading('google')
            setNotice('')
            setServerErr('')
            try {
              await signInWithGoogle()
            } catch (err) {
              setOauthLoading('')
              setNotice(err.message || 'Google sign-in is not available right now.')
            }
          }}
        >
          {oauthLoading === 'google'
            ? <Loader2 size={14} className={styles.spinner} />
            : <GoogleIcon />}
          <span>Google</span>
        </button>
        <button
          type="button"
          id="signup-github-btn"
          className={`${styles.socialBtn} ${oauthLoading === 'github' ? styles.socialBtnLoading : ''}`}
          disabled={!!oauthLoading}
          onClick={async () => {
            setOauthLoading('github')
            setNotice('')
            setServerErr('')
            try {
              await signInWithGithub()
            } catch (err) {
              setOauthLoading('')
              setNotice(err.message || 'GitHub sign-in is not available right now.')
            }
          }}
        >
          {oauthLoading === 'github'
            ? <Loader2 size={14} className={styles.spinner} />
            : <GithubIcon />}
          <span>GitHub</span>
        </button>
      </div>

      <Notice msg={notice} onDismiss={() => setNotice('')} />

      <div className={styles.orDivider}><span>OR CONTINUE WITH EMAIL</span></div>

      <InputField label="Full Name" id={`${uid}-name`}
        value={form.fullName} onChange={set('fullName')} error={errors.fullName}
        icon={User} placeholder="Alex Rivera" autoComplete="name" />

      <InputField label="Work Email" id={`${uid}-email`} type="email"
        value={form.email} onChange={set('email')} error={errors.email}
        icon={Mail} placeholder="alex@company.com" autoComplete="email" />

      {/* Password with strength meter */}
      <div className={styles.field}>
        <div className={styles.fieldHeader}>
          <label htmlFor={`${uid}-pw`} className={styles.fieldLabel}>Password</label>
          {form.password && (
            <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
          )}
        </div>
        <div className={`${styles.inputWrap} ${errors.password ? styles.inputError : ''}`}>
          <span className={styles.inputIcon} aria-hidden="true"><Lock size={14} /></span>
          <input id={`${uid}-pw`} type={showPw ? 'text' : 'password'}
            value={form.password} onChange={set('password')}
            placeholder="Min. 8 characters" autoComplete="new-password"
            className={`${styles.input} ${styles.hasLeft} ${styles.hasRight}`}
            aria-invalid={!!errors.password} />
          <div className={styles.inputRight}><EyeToggle show={showPw} onToggle={() => setShowPw(v => !v)} /></div>
        </div>
        {form.password && (
          <div className={styles.strengthMeter}>
            {[1,2,3,4,5].map(level => (
              <div key={level} className={styles.strengthSeg}
                style={{
                  background: level <= strength.score ? strength.color : 'rgba(255,255,255,0.07)',
                  boxShadow: level <= strength.score ? `0 0 6px ${strength.color}55` : 'none',
                }} />
            ))}
          </div>
        )}
        {errors.password && (
          <span className={styles.fieldError} role="alert">
            <AlertCircle size={11} />{errors.password}
          </span>
        )}
      </div>

      <InputField label="Confirm Password" id={`${uid}-cpw`}
        type={showCpw ? 'text' : 'password'}
        value={form.confirm} onChange={set('confirm')} error={errors.confirm}
        icon={Lock} placeholder="Repeat password" autoComplete="new-password"
        right={<EyeToggle show={showCpw} onToggle={() => setShowCpw(v => !v)} />} />

      <div className={styles.termsRow}>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={form.terms} onChange={set('terms')} className={styles.checkInput} />
          <span className={styles.checkBox} />
          <span className={styles.termsText}>
            I agree to the <span className={styles.termsLink}>Terms</span> and{' '}
            <span className={styles.termsLink}>Privacy Policy</span>
          </span>
        </label>
        {errors.terms && (
          <span className={styles.fieldError} role="alert">
            <AlertCircle size={11} />{errors.terms}
          </span>
        )}
      </div>

      {serverErr && (
        <div className={styles.errorBox} role="alert">
          <AlertCircle size={13} />
          <span>{serverErr}</span>
        </div>
      )}

      <button type="submit" className={styles.primaryBtn}
        disabled={status === 'loading' || status === 'success'}>
        {status === 'loading' ? (
          <><Loader2 size={14} className={styles.spinner} /><span>Creating workspace…</span></>
        ) : status === 'success' ? (
          <><CheckCircle2 size={14} /><span>Workspace created!</span></>
        ) : (
          <><span>Create workspace</span><span className={styles.kbdReturn}>↵</span></>
        )}
      </button>

      <p className={styles.switchLine}>
        Already have an account?{' '}
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>Log in</button>
      </p>
    </form>
  )
}

/* ══════════════════════════════════════════════════════════════
   LINEAR AUTH CARD — Shared (used on /login and /signup pages)
══════════════════════════════════════════════════════════════ */
export function LinearAuthCard({ activeTab, onSwitchTab }) {
  const { isImperium } = useTheme()

  return (
    <div className={styles.card}>
      <div className={styles.cardTopBorder} aria-hidden="true" />
      {isImperium && <div className={styles.cardRoyalTrim} aria-hidden="true" />}

      {/* Segmented control tabs */}
      <div className={styles.tabTrack} role="tablist">
        <button type="button" role="tab"
          aria-selected={activeTab === 'signin'}
          className={`${styles.tabBtn} ${activeTab === 'signin' ? styles.tabActive : ''}`}
          onClick={() => onSwitchTab('signin')}>
          Sign In
        </button>
        <button type="button" role="tab"
          aria-selected={activeTab === 'signup'}
          className={`${styles.tabBtn} ${activeTab === 'signup' ? styles.tabActive : ''}`}
          onClick={() => onSwitchTab('signup')}>
          Create Account
        </button>
        <div className={styles.tabGlider}
          style={{ transform: `translateX(${activeTab === 'signup' ? '100%' : '0%'})` }} />
      </div>

      {/* Form container */}
      <div className={styles.formViewport}>
        <div className={styles.formSlide}
          style={{
            position: activeTab === 'signin' ? 'relative' : 'absolute',
            transform: `translateX(${activeTab === 'signup' ? '-100%' : '0%'})`,
            opacity: activeTab === 'signin' ? 1 : 0,
            pointerEvents: activeTab === 'signin' ? 'auto' : 'none',
          }}>
          <SignInForm onSwitch={() => onSwitchTab('signup')} />
        </div>
        <div className={styles.formSlide}
          style={{
            position: activeTab === 'signup' ? 'relative' : 'absolute',
            transform: `translateX(${activeTab === 'signin' ? '100%' : '0%'})`,
            opacity: activeTab === 'signup' ? 1 : 0,
            pointerEvents: activeTab === 'signup' ? 'auto' : 'none',
          }}>
          <SignUpForm onSwitch={() => onSwitchTab('signin')} />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SIDE PANEL — BERT Live Demo showcase
══════════════════════════════════════════════════════════════ */
function SidePanel() {
  const { isImperium } = useTheme()

  return (
    <div className={styles.sidePanel} aria-hidden="true">
      <div className={styles.sideBrand}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke={isImperium ? "url(#sp-imp-g)" : "url(#sp-g)"} strokeWidth="1.25"/>
          <path d="M7 10h6M10 7v6" stroke={isImperium ? "url(#sp-imp-g2)" : "url(#sp-g2)"} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="10" cy="10" r="2" fill={isImperium ? "#d4af37" : "#5e6ad2"}/>
          <defs>
            <linearGradient id="sp-g" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee"/><stop offset="1" stopColor="#a855f7"/>
            </linearGradient>
            <linearGradient id="sp-g2" x1="7" y1="7" x2="13" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee"/><stop offset="1" stopColor="#a855f7"/>
            </linearGradient>
            <linearGradient id="sp-imp-g" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f5e7b2"/><stop offset="1" stopColor="#c9a227"/>
            </linearGradient>
            <linearGradient id="sp-imp-g2" x1="7" y1="7" x2="13" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff4c7"/><stop offset="1" stopColor="#d4af37"/>
            </linearGradient>
          </defs>
        </svg>
        <div>
          <div className={styles.sideBrandName}>
            {isImperium && <span className={styles.royalPrefix}>⚜ </span>}ContextIQ Engine
          </div>
          <div className={styles.sideBrandSub}>BERT Extractive QA v2.4</div>
        </div>
        <div className={styles.sideStatus}>
          <span className={styles.sideStatusDot} />
          Live
        </div>
      </div>

      <div className={styles.sideQuote}>
        "Precision answers extracted directly from your context. Zero hallucinations, full evidence."
      </div>

      {/* Terminal card */}
      <div className={styles.termCard}>
        <div className={styles.termHeader}>
          <div className={styles.termDots}>
            <span style={{ background: isImperium ? '#c9a227' : '#ff5f56' }} />
            <span style={{ background: isImperium ? '#e5c766' : '#ffbd2e' }} />
            <span style={{ background: isImperium ? '#f5e7b2' : '#27c93f' }} />
          </div>
          <div className={styles.termTitle}>
            <Terminal size={10} />
            <span>bert-base-cased-qa</span>
          </div>
          <div className={styles.termLatency}>14ms</div>
        </div>
        <div className={styles.termBody}>
          <div className={styles.termRow}>
            <span className={styles.termTag}>CTX</span>
            <span className={styles.termCtx}>
              "…outputs start and end token logits over{' '}
              <mark className={styles.termHighlight}>passage representations</mark>
              {' '}to extract exact facts."
            </span>
          </div>
          <div className={styles.termRow}>
            <span className={styles.termTag}>Q</span>
            <span className={styles.termQ}>"What does the transformer output?"</span>
          </div>
          <div className={styles.termAnswer}>
            <CheckCircle2 size={11} className={styles.termCheck} />
            <span>passage representations</span>
            <span className={styles.termScore}>99.4%</span>
          </div>
        </div>
      </div>

      {/* Feature items */}
      <div className={styles.sideFeatures}>
        <div className={styles.sideFeature}>
          <ShieldCheck size={14} style={{ color: isImperium ? '#d4af37' : '#4ade80', flexShrink: 0 }} />
          <div>
            <div className={styles.sideFeatureTitle}>Zero Hallucinations</div>
            <div className={styles.sideFeatureDesc}>Extracts verbatim spans from supplied context</div>
          </div>
        </div>
        <div className={styles.sideFeature}>
          <Cpu size={14} style={{ color: isImperium ? '#e5c766' : '#60a5fa', flexShrink: 0 }} />
          <div>
            <div className={styles.sideFeatureTitle}>Sub-25ms Inference</div>
            <div className={styles.sideFeatureDesc}>GPU-accelerated tokenization and span heads</div>
          </div>
        </div>
      </div>

      <div className={styles.kbdHints}>
        <div className={styles.kbdHint}><span className="linear-kbd">Tab</span><span>Next field</span></div>
        <div className={styles.kbdHint}><span className="linear-kbd">↵</span><span>Submit</span></div>
        <div className={styles.kbdHint}><span className="linear-kbd">Esc</span><span>Dismiss</span></div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   AUTH SECTION (Embedded in landing page)
══════════════════════════════════════════════════════════════ */
export default function AuthSection({ defaultTab = 'signin' }) {
  const { isImperium } = useTheme()
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => { setActiveTab(defaultTab) }, [defaultTab])
  const switchTo = useCallback(tab => setActiveTab(tab), [])

  return (
    <section id="auth" className={styles.section}>
      <ThemeAuthAtmosphere variant="section" />

      <div className="container">
        <div className={styles.sectionHead}>
          <span className={styles.sectionBadge}>
            {isImperium ? <span className={styles.royalBadgeMark}>⚜</span> : <Sparkles size={11} />}
            AUTHENTICATION
          </span>
          <h2 className={styles.sectionTitle}>Access precision extractive intelligence</h2>
          <p className={styles.sectionSub}>
            Engineered for teams querying dense documents, technical manuals, and knowledge bases.
          </p>
        </div>

        <div className={styles.layout}>
          <SidePanel />
          <div className={styles.cardCol}>
            <LinearAuthCard activeTab={activeTab} onSwitchTab={switchTo} />
          </div>
        </div>
      </div>
    </section>
  )
}
