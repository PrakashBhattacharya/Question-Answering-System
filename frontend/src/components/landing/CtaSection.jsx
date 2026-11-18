import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import styles from './CtaSection.module.css'

export default function CtaSection({ onGetStarted, onLearnMore }) {
  const ref = useScrollReveal({ threshold: 0.25 })
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted()
    else navigate('/signup')
  }

  const handleLearnMore = () => {
    if (onLearnMore) onLearnMore()
    else document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="cta" className={styles.section}>
      <div className={styles.topLine} aria-hidden="true" />
      <div className="container">
        <div ref={ref} className={styles.card}>
          {/* Ambient glow */}
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.beam} aria-hidden="true" />

          <div className={styles.eyebrow}>
            <Sparkles size={12} />
            Get Started for Free
          </div>

          <h2 className={styles.heading}>
            Ready to extract answers<br />
            <span className="gradient-text">from your own context?</span>
          </h2>

          <p className={styles.sub}>
            Create a free account and start querying your content with
            BERT-powered extractive QA — no training required.
          </p>

          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              onClick={handleGetStarted}
            >
              Create free account
              <ArrowRight size={15} />
            </button>
            <button
              className={styles.ghostBtn}
              onClick={handleLearnMore}
            >
              How It Works
            </button>
          </div>

          <p className={styles.note}>No credit card required · Built on BERT · Powered by SQuAD 2.0</p>
        </div>
      </div>
    </section>
  )
}
