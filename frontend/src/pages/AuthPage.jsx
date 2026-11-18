import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar            from '../components/landing/Navbar'
import HeroSection       from '../components/landing/HeroSection'
import PipelineSection   from '../components/landing/PipelineSection'
import AuthSection       from '../components/auth/AuthSection'
import FeaturesSection   from '../components/landing/FeaturesSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import TechSection       from '../components/landing/TechSection'
import ProductPreview    from '../components/landing/ProductPreview'
import TrustSection      from '../components/landing/TrustSection'
import CtaSection        from '../components/landing/CtaSection'
import Footer            from '../components/landing/Footer'

export default function AuthPage({ initialView = 'home' }) {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [authTab, setAuthTab] = useState('signin')

  // Determine current view from pathname or initialView prop
  const getViewFromPath = useCallback((pathname) => {
    if (pathname === '/features') return 'features'
    if (pathname === '/how-it-works') return 'how-it-works'
    if (pathname === '/technology') return 'technology'
    return initialView || 'home'
  }, [initialView])

  const [currentView, setCurrentView] = useState(() => getViewFromPath(location.pathname))

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    setCurrentView(getViewFromPath(location.pathname))
  }, [location.pathname, getViewFromPath])

  const handleSelectView = useCallback((viewId) => {
    setCurrentView(viewId)
    const path = viewId === 'home' ? '/' : `/${viewId}`
    if (location.pathname !== path) {
      navigate(path)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate, location.pathname])

  const scrollToAuth = useCallback((tab = 'signin') => {
    setAuthTab(tab)
    if (currentView !== 'home') {
      setCurrentView('home')
      navigate('/')
    }
    setTimeout(() => {
      const section = document.getElementById('auth')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 60)
  }, [currentView, navigate])

  return (
    <div className="page-wrap">
      <div className="noise-overlay" aria-hidden="true" />

      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
        onSignIn={() => scrollToAuth('signin')}
        onSignUp={() => scrollToAuth('signup')}
      />

      {/* Content is offset by the sidebar width on desktop */}
      <div className="sidebar-offset">
        <main>
          {/* ── HOME VIEW: Complete top-to-bottom product experience ── */}
          {currentView === 'home' && (
            <>
              <HeroSection
                onGetStarted={() => scrollToAuth('signup')}
                onLearnMore={() => {
                  const el = document.getElementById('how-it-works') || document.getElementById('features')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                  else handleSelectView('how-it-works')
                }}
              />

              <div id="features">
                <FeaturesSection />
              </div>

              <div id="product-preview">
                <ProductPreview />
              </div>

              <div id="how-it-works">
                <HowItWorksSection />
              </div>

              <div id="pipeline">
                <PipelineSection />
              </div>

              <div id="technology">
                <TechSection />
                <TrustSection />
              </div>

              <div id="auth">
                <AuthSection defaultTab={authTab} />
              </div>

              <CtaSection
                onGetStarted={() => scrollToAuth('signup')}
                onLearnMore={() => {
                  const el = document.getElementById('how-it-works')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
              />
            </>
          )}

          {/* ── FEATURES VIEW: Only visible after clicked in the navbar ── */}
          {currentView === 'features' && (
            <div>
              <FeaturesSection />
              <ProductPreview />
              <TrustSection />
              <CtaSection
                onGetStarted={() => scrollToAuth('signup')}
                onLearnMore={() => handleSelectView('how-it-works')}
              />
            </div>
          )}

          {/* ── HOW IT WORKS VIEW: Only visible after clicked in the navbar ── */}
          {currentView === 'how-it-works' && (
            <div>
              <HowItWorksSection />
              <PipelineSection />
              <CtaSection
                onGetStarted={() => scrollToAuth('signup')}
                onLearnMore={() => handleSelectView('features')}
              />
            </div>
          )}

          {/* ── TECHNOLOGY VIEW: Only visible after clicked in the navbar ── */}
          {currentView === 'technology' && (
            <div>
              <TechSection />
              <PipelineSection />
              <CtaSection
                onGetStarted={() => scrollToAuth('signup')}
                onLearnMore={() => handleSelectView('how-it-works')}
              />
            </div>
          )}
        </main>

        <Footer onSelectView={handleSelectView} />
      </div>
    </div>
  )
}
