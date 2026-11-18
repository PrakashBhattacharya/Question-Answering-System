import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Github, ArrowUp, Code2, Cpu, Sparkles, ExternalLink,
  ShieldCheck, FileCode, CheckCircle2, Zap
} from 'lucide-react'
import styles from './Footer.module.css'

const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.5" stroke="url(#fl-g)" strokeWidth="1.5" />
    <path d="M7 10h6M10 7v6" stroke="url(#fl-g2)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="10" r="2.2" fill="url(#fl-g3)" />
    <defs>
      <linearGradient id="fl-g" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="0.5" stopColor="#8b5cf6" />
        <stop offset="1" stopColor="#22d3ee" />
      </linearGradient>
      <linearGradient id="fl-g2" x1="7" y1="7" x2="13" y2="13" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22d3ee" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
      <radialGradient id="fl-g3" cx="50%" cy="50%" r="50%">
        <stop stopColor="#67e8f9" />
        <stop offset="1" stopColor="#a855f7" />
      </radialGradient>
    </defs>
  </svg>
)

export default function Footer({ onSelectView }) {
  const navigate = useNavigate()

  const handleLink = (view, path) => {
    if (onSelectView) {
      onSelectView(view)
    } else {
      navigate(path)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className={styles.footer}>
      {/* Top glowing boundary line and ambient center glow */}
      <div className={styles.topLine} aria-hidden="true" />
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.inner}>
          {/* Column 1: Brand & Live Status */}
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <div className={styles.logoMark}>
                <Logo />
              </div>
              <span className={styles.logoName}>
                ContextIQ
                <span className={styles.versionBadge}>v2.0</span>
              </span>
            </div>

            <p className={styles.tagline}>
              Precision extractive question answering powered by transformer token embeddings and SQuAD 2.0 span heads. Verbatim facts with zero hallucinations.
            </p>

            {/* Live Operational Status */}
            <div className={styles.statusRow} title="FastAPI and PyTorch inference pipeline is active">
              <span className={styles.statusDot} />
              <span className={styles.statusText}>All systems operational · 14ms</span>
            </div>

            {/* Architecture Badges */}
            <div className={styles.techPills}>
              <span className={styles.techPill}>PyTorch 2.2</span>
              <span className={styles.techPill}>FastAPI</span>
              <span className={styles.techPill}>BERT / RoBERTa</span>
              <span className={styles.techPill}>SQuAD 2.0</span>
              <span className={styles.techPill}>BART CNN</span>
            </div>

            {/* Quick Developer Socials */}
            <div className={styles.socialRow}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className={styles.socialBtn}
                title="View ContextIQ GitHub repository"
              >
                <Github size={13} />
                <span>GitHub</span>
              </a>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className={styles.socialBtn}
                title="View OpenAPI 3.1 Documentation"
              >
                <FileCode size={13} />
                <span>API Docs</span>
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className={styles.col}>
            <div className={styles.colHeader}>
              <span className={styles.colHeaderDot} />
              <div className={styles.colTitle}>Product</div>
            </div>
            <button type="button" className={styles.link} onClick={() => handleLink('home', '/')}>
              Home
            </button>
            <button type="button" className={styles.link} onClick={() => handleLink('features', '/features')}>
              Features
            </button>
            <button type="button" className={styles.link} onClick={() => handleLink('how-it-works', '/how-it-works')}>
              How It Works
            </button>
            <button type="button" className={styles.link} onClick={() => handleLink('technology', '/technology')}>
              Technology
            </button>
            <button type="button" className={styles.link} onClick={() => navigate('/dashboard?view=bulk')}>
              <span>Bulk Q&A Batch</span>
              <span className={styles.newBadge}>New</span>
            </button>
            <button type="button" className={styles.link} onClick={() => navigate('/dashboard')}>
              <span>Text Summarizer</span>
              <span className={styles.newBadge}>v2.0</span>
            </button>
          </div>

          {/* Column 3: Models & Architecture */}
          <div className={styles.col}>
            <div className={styles.colHeader}>
              <span className={styles.colHeaderDot} />
              <div className={styles.colTitle}>Models</div>
            </div>
            <button type="button" className={styles.link} onClick={() => handleLink('technology', '/technology')}>
              BERT Base Cased
            </button>
            <button type="button" className={styles.link} onClick={() => handleLink('technology', '/technology')}>
              RoBERTa SQuAD 2.0
            </button>
            <button type="button" className={styles.link} onClick={() => handleLink('technology', '/technology')}>
              DistilBERT Fast QA
            </button>
            <button type="button" className={styles.link} onClick={() => handleLink('technology', '/technology')}>
              BART Large CNN
            </button>
            <button type="button" className={styles.link} onClick={() => handleLink('technology', '/technology')}>
              Sliding Window 384/128
            </button>
            <button type="button" className={styles.link} onClick={() => handleLink('features', '/features')}>
              SQuAD 2.0 Null Gate
            </button>
          </div>

          {/* Column 4: Developer & API */}
          <div className={styles.col}>
            <div className={styles.colHeader}>
              <span className={styles.colHeaderDot} />
              <div className={styles.colTitle}>Developer</div>
            </div>
            <button type="button" className={styles.link} onClick={() => navigate('/dashboard?view=playground')}>
              API Playground
            </button>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className={styles.link}>
              <span>Swagger / OpenAPI</span>
              <ExternalLink size={10} style={{ opacity: 0.6 }} />
            </a>
            <a href="http://localhost:8000/health" target="_blank" rel="noreferrer" className={styles.link}>
              <span>Health Telemetry</span>
              <ExternalLink size={10} style={{ opacity: 0.6 }} />
            </a>
            <button type="button" className={styles.link} onClick={() => navigate('/dashboard?view=analytics')}>
              Benchmark Analytics
            </button>
            <button type="button" className={styles.link} onClick={() => navigate('/dashboard?view=logs')}>
              Audit & Trace Logs
            </button>
          </div>

          {/* Column 5: Access & Platform */}
          <div className={styles.col}>
            <div className={styles.colHeader}>
              <span className={styles.colHeaderDot} />
              <div className={styles.colTitle}>Access</div>
            </div>
            <button type="button" className={styles.link} onClick={() => navigate('/dashboard')}>
              Launch Dashboard
            </button>
            <button type="button" className={styles.link} onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button type="button" className={styles.link} onClick={() => navigate('/signup')}>
              Create Account
            </button>
            <button type="button" className={styles.link} onClick={() => navigate('/signup')}>
              Demo Preset
            </button>
            <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--t-text-4)' }}>
              Shortcut: <kbd style={{ padding: '0.1rem 0.3rem', background: 'var(--t-surface-hover)', borderRadius: 3, border: '1px solid var(--t-border-0)' }}>T</kbd> to cycle theme
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <div className={styles.bottomInner}>
            <p className={styles.copy}>
              © {new Date().getFullYear()} ContextIQ Inc. An AI-powered extractive QA system.
            </p>

            <div className={styles.engineLabel}>
              <span>PyTorch</span>
              <span className={styles.engineDot}>•</span>
              <span>FastAPI</span>
              <span className={styles.engineDot}>•</span>
              <span>Transformers</span>
            </div>

            <div className={styles.bottomRight}>
              <div className={styles.bottomLinks}>
                <button type="button" className={styles.bottomLink} onClick={() => handleLink('home', '/')}>Privacy</button>
                <button type="button" className={styles.bottomLink} onClick={() => handleLink('home', '/')}>Terms</button>
                <button type="button" className={styles.bottomLink} onClick={() => handleLink('technology', '/technology')}>Security</button>
              </div>

              <button type="button" className={styles.topBtn} onClick={scrollToTop} title="Scroll to top of page">
                <span>Top</span>
                <ArrowUp size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
