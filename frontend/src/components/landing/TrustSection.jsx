import React from 'react'
import { FileSearch, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import styles from './TrustSection.module.css'

const PRINCIPLES = [
  {
    icon: FileSearch,
    color: 'cyan',
    badge: 'GROUNDING',
    title: 'Evidence-based answers',
    desc: 'Every answer is a direct extraction from the context you supply. Nothing is synthesized or retrieved from external knowledge.',
    metric: '100% Extractive Grounding',
  },
  {
    icon: Eye,
    color: 'blue',
    badge: 'TRANSPARENCY',
    title: 'Auditable results',
    desc: 'You see both the answer and exactly where it came from — the exact character span is highlighted in your original passage.',
    metric: 'Character Offsets [start : end]',
  },
  {
    icon: ShieldCheck,
    color: 'purple',
    badge: 'SAFEGUARD',
    title: 'Zero fabricated answers',
    desc: "When the context doesn't contain a reliable answer, the system says so clearly — rather than hallucinating a plausible response.",
    metric: 'SQuAD 2.0 Negative Gate',
  },
]

const C = {
  cyan:   { icon: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.25)',  color: '#22d3ee', tag: 'rgba(34,211,238,0.12)',  tagText: '#22d3ee' },
  blue:   { icon: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  color: '#60a5fa', tag: 'rgba(59,130,246,0.12)',  tagText: '#60a5fa' },
  purple: { icon: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)', color: '#c084fc', tag: 'rgba(168,85,247,0.12)', tagText: '#c084fc' },
}

function Card({ p, index }) {
  const ref  = useScrollReveal({ threshold: 0.2 })
  const Icon = p.icon
  const c    = C[p.color]
  return (
    <div ref={ref} className={styles.card} style={{ transitionDelay: `${index * 0.08}s` }}>
      <div className={styles.topSpecular} aria-hidden="true" />
      <div className={styles.topBar}>
        <div
          className={styles.iconWrap}
          style={{ background: c.icon, border: `1px solid ${c.border}`, color: c.color }}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <span className={styles.badge} style={{ background: c.tag, color: c.tagText }}>
          {p.badge}
        </span>
      </div>
      <h3 className={styles.cardTitle}>{p.title}</h3>
      <p className={styles.cardDesc}>{p.desc}</p>
      <div className={styles.metricRow}>
        <CheckCircle2 size={13} style={{ color: c.color }} />
        <span className={styles.metricText}>{p.metric}</span>
      </div>
    </div>
  )
}

export default function TrustSection() {
  const titleRef = useScrollReveal({ threshold: 0.2 })
  return (
    <section className={styles.section}>
      <div className={styles.topLine} aria-hidden="true" />
      <div className="container">
        <div ref={titleRef} className={styles.header}>
          <span className="section-eyebrow">Design Principles</span>
          <h2 className="section-heading" style={{ textAlign: 'center' }}>
            Built around <span className="gradient-text">verifiable evidence.</span>
          </h2>
          <p className="section-subheading" style={{ textAlign: 'center', margin: '0 auto' }}>
            ContextIQ is designed from the ground up to be transparent, honest,
            and grounded — because trust matters in AI.
          </p>
        </div>
        <div className={styles.grid}>
          {PRINCIPLES.map((p, i) => <Card key={p.title} p={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
