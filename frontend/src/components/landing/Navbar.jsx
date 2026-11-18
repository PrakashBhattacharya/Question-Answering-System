import React, { useState, useEffect, useCallback } from 'react'
import { ArrowRight, Menu, X, Sparkles, Layers, Cpu, Compass } from 'lucide-react'
import ThemeSelector from '../ui/ThemeSelector'
import AudioToggle from '../ui/AudioToggle'
import styles from './Navbar.module.css'

/* ── Geometric Logo Mark ─────────────────────────────────────── */
function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nav-brand-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="6" stroke="url(#nav-brand-grad)" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="3" fill="#6366f1" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ── Navigation Items ────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'home',         label: 'Home',         sectionId: 'home',         icon: Compass },
  { id: 'features',     label: 'Features',     sectionId: 'features',     icon: Sparkles },
  { id: 'how-it-works', label: 'How It Works', sectionId: 'how-it-works', icon: Layers },
  { id: 'technology',   label: 'Technology',   sectionId: 'technology',   icon: Cpu },
]

export default function Navbar({
  currentView = 'home',
  onSelectView,
  onSignIn,
  onSignUp,
  onScrollTo,
}) {
  const [activeId, setActiveId] = useState(currentView)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Keep activeId in sync with currentView
  useEffect(() => {
    setActiveId(currentView)
  }, [currentView])

  // Track scroll position for navbar glass elevation & active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      if (window.scrollY < 200) {
        setActiveId('home')
        return
      }

      const SECTION_CHECKS = [
        { id: 'technology',   elId: 'technology' },
        { id: 'how-it-works', elId: 'how-it-works' },
        { id: 'features',     elId: 'features' },
      ]

      for (const s of SECTION_CHECKS) {
        const el = document.getElementById(s.elId)
        if (el && window.scrollY >= el.offsetTop - 180) {
          setActiveId(s.id)
          return
        }
      }
      setActiveId('home')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile drawer on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleNav = useCallback((item) => {
    setMenuOpen(false)
    setActiveId(item.id)

    if (item.id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (onSelectView) onSelectView('home')
      return
    }

    const el = document.getElementById(item.sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (onSelectView) {
      onSelectView(item.id)
    }
  }, [onSelectView])

  const logoClick = useCallback((e) => {
    e.preventDefault()
    setMenuOpen(false)
    setActiveId('home')
    if (onSelectView) {
      onSelectView('home')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [onSelectView])

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.navContainer}>
        {/* Brand */}
        <a href="/" className={styles.brand} onClick={logoClick} aria-label="ContextIQ Home">
          <div className={styles.logoWrap}>
            <LogoMark />
          </div>
          <span className={styles.brandTitle}>ContextIQ</span>
          <span className={styles.brandPill}>BERT · SQuAD 2.0</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className={styles.navDesktop} aria-label="Main Navigation">
          <div className={styles.navLinksPill}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  onClick={() => handleNav(item)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={14} className={styles.navLinkIcon} />
                  <span>{item.label}</span>
                  {isActive && <span className={styles.activePillIndicator} />}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Right CTA Actions */}
        <div className={styles.actionsDesktop}>
          <ThemeSelector />
          <AudioToggle />
          <button
            type="button"
            className={styles.btnSignIn}
            onClick={onSignIn}
          >
            Sign In
          </button>
          <button
            type="button"
            className={styles.btnGetStarted}
            onClick={onSignUp}
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
                  onClick={() => handleNav(item)}
                >
                  <div className={styles.mobileNavIconWrap}>
                    <Icon size={16} />
                  </div>
                  <span className={styles.mobileNavLabel}>{item.label}</span>
                  {isActive && <span className={styles.mobileActiveDot} />}
                </button>
              )
            })}
          </div>

          <div className={styles.mobileDrawerDivider} />

          <div className={styles.mobileDrawerActions}>
            <button
              type="button"
              className={styles.btnSignInMobile}
              onClick={() => { setMenuOpen(false); onSignIn?.(); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={styles.btnGetStartedMobile}
              onClick={() => { setMenuOpen(false); onSignUp?.(); }}
            >
              Get Started Free <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
