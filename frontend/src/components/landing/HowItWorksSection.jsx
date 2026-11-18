import React from 'react'
import { FileText, HelpCircle, Cpu, Sparkles } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import MotionVideoPlayer from '../ui/MotionVideoPlayer'
import styles from './HowItWorksSection.module.css'

const STEPS = [
  {
    number: '01',
    badge: 'INGESTION',
    icon: FileText,
    color: 'cyan',
    title: 'Paste or Upload Text',
    desc: 'Paste any text, article, research notes, or document you want to query.',
    meta: 'Raw Text · 384-tok window',
  },
  {
    number: '02',
    badge: 'INQUIRY',
    icon: HelpCircle,
    color: 'blue',
    title: 'Ask in Plain English',
    desc: 'Type your question naturally, exactly like you would ask a research assistant.',
    meta: 'Natural Language Query',
  },
  {
    number: '03',
    badge: 'ATTENTION',
    icon: Cpu,
    color: 'purple',
    title: 'Bidirectional Reading',
    desc: 'BERT connects tokens, subwords, and semantic intent across bidirectional self-attention.',
    meta: 'Cross-Attention Span Head',
  },
  {
    number: '04',
    badge: 'EXTRACTION',
    icon: Sparkles,
    color: 'green',
    title: 'Extracted Answer & Proof',
    desc: 'See the exact sentence highlighted on your screen with certainty score and zero guesswork.',
    meta: 'Verifiable Source Span',
  },
]

const ICON_STYLES = {
  cyan:   { bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.25)',  color: '#22d3ee', tag: 'rgba(34,211,238,0.12)',  tagText: '#22d3ee' },
  blue:   { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  color: '#60a5fa', tag: 'rgba(59,130,246,0.12)',  tagText: '#60a5fa' },
  purple: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)', color: '#c084fc', tag: 'rgba(168,85,247,0.12)', tagText: '#c084fc' },
  green:  { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   color: '#4ade80', tag: 'rgba(34,197,94,0.12)',   tagText: '#4ade80' },
}

function Step({ step, index, isLast }) {
  const ref  = useScrollReveal({ threshold: 0.15 })
  const Icon = step.icon
  const c    = ICON_STYLES[step.color]

  return (
    <div
      ref={ref}
      className={`${styles.step} ${styles[`step_${step.color}`]}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className={styles.topSpecular} aria-hidden="true" />
      
      {/* Step Header: Step Number & Badge */}
      <div className={styles.stepTopBar}>
        <span className={styles.stepNum}>{step.number}</span>
        <span className={styles.stepBadge} style={{ background: c.tag, color: c.tagText }}>
          {step.badge}
        </span>
      </div>

      <div className={styles.stepInner}>
        {/* Icon circle */}
        <div
          className={styles.iconCircle}
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
        >
          <Icon size={22} strokeWidth={1.8} />
        </div>

        {/* Text */}
        <div className={styles.stepText}>
          <h3 className={styles.stepTitle}>{step.title}</h3>
          <p className={styles.stepDesc}>{step.desc}</p>
        </div>

        {/* Step Micro-meta Pill */}
        <div className={styles.stepMetaRow}>
          <span className={styles.metaDot} style={{ background: c.color }} />
          <span className={styles.metaLabel}>{step.meta}</span>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorksSection() {
  const titleRef = useScrollReveal({ threshold: 0.2 })

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.topLine} aria-hidden="true" />

      <div className="container">
        <div ref={titleRef} className={styles.header}>
          <span className="section-eyebrow">Process</span>
          <h2 className="section-heading">
            From context to answer<br />
            <span className="gradient-text">in four clear steps.</span>
          </h2>
          <p className="section-subheading">
            A clean, interpretable pipeline. Every answer traces directly
            back to evidence in your supplied context.
          </p>
        </div>

        {/* ── 3.6s BERT Pipeline Motion Graphic (Context → Tokenizer → BERT → Start/End → Answer) ── */}
        <div className={styles.motionGraphicCard}>
          <div className={styles.motionGraphicGlow} aria-hidden="true" />
          <MotionVideoPlayer
            concept="pipeline"
            src="/animations/bert-pipeline.webm?v=clear1"
            title="BERT Extractive QA Architecture & Particle Data Flow"
            tag="3.6s Real-Time Pipeline"
            aspectRatio="1200/520"
          />
        </div>

        <div className={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <Step key={s.number} step={s} index={i} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
