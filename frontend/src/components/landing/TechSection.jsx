import React, { useState } from 'react'
import { Brain, Flame, Package, Zap, Atom, Database, Cpu, BookOpen, LayoutGrid, ArrowRight } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import TechBook from './TechBook'
import styles from './TechSection.module.css'

const TECH = [
  {
    icon: Brain,
    name: 'BERT Checkpoint',
    role: 'Core Extractive Model',
    roleColor: 'indigo',
    desc: 'Bidirectional Encoder Representations from Transformers. Uses deep bidirectional self-attention to identify precise start and end tokens directly within provided context.',
  },
  {
    icon: Flame,
    name: 'PyTorch',
    role: 'Inference Framework',
    roleColor: 'amber',
    desc: 'Low-latency tensor computation graphs executing token span logits with native GPU acceleration and optimized CPU multi-threading.',
  },
  {
    icon: Package,
    name: 'Hugging Face Transformers',
    role: 'Model Hub & Tokenizer',
    roleColor: 'cyan',
    desc: 'Production-ready WordPiece tokenization with fast subword encoding, handling vocabulary token offsets and attention masking seamlessly.',
  },
  {
    icon: Zap,
    name: 'FastAPI',
    role: 'Asynchronous Backend',
    roleColor: 'green',
    desc: 'High-throughput async Python REST API with automatic Pydantic validation, keeping inference overhead under 5ms per payload.',
  },
  {
    icon: Atom,
    name: 'React 18 & Vite',
    role: 'Frontend Client',
    roleColor: 'blue',
    desc: 'Component-driven interactive dashboard with zero layout shifts, real-time evidence span highlights, and sub-millisecond local state updates.',
  },
  {
    icon: Database,
    name: 'SQuAD 2.0 Dataset',
    role: 'Evaluation & Benchmarks',
    roleColor: 'violet',
    desc: 'Stanford Question Answering Dataset with over 150k questions including 50k negative examples, benchmarked for both exact match and unanswerable detection.',
  },
]

const ROLE_COLORS = {
  indigo: { bg: 'rgba(99, 102, 241, 0.1)',  color: '#818cf8', border: 'rgba(99, 102, 241, 0.25)' },
  amber:  { bg: 'rgba(245, 158, 11, 0.1)',  color: '#fbbf24', border: 'rgba(245, 158, 11, 0.25)' },
  cyan:   { bg: 'rgba(34, 211, 238, 0.1)',  color: '#22d3ee', border: 'rgba(34, 211, 238, 0.25)' },
  green:  { bg: 'rgba(34, 197, 94, 0.1)',   color: '#4ade80', border: 'rgba(34, 197, 94, 0.25)' },
  blue:   { bg: 'rgba(59, 130, 246, 0.1)',  color: '#60a5fa', border: 'rgba(59, 130, 246, 0.25)' },
  violet: { bg: 'rgba(139, 92, 246, 0.1)',  color: '#a78bfa', border: 'rgba(139, 92, 246, 0.25)' },
}

function TechCard({ t, index, onOpenBook }) {
  const ref = useScrollReveal({ threshold: 0.12 })
  const Icon = t.icon
  const rc = ROLE_COLORS[t.roleColor]

  return (
    <div
      ref={ref}
      className={styles.card}
      style={{ transitionDelay: `${index * 0.06}s` }}
      onClick={() => onOpenBook(Math.floor(index / 2))}
      role="button"
      tabIndex={0}
      title="Click to read in Architecture Codex"
    >
      <div className={styles.topSpecular} aria-hidden="true" />
      <div className={styles.cardTop}>
        <div className={styles.iconBox} style={{ background: rc.bg, borderColor: rc.border, color: rc.color }}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <div className={styles.titleWrap}>
          <div className={styles.name}>{t.name}</div>
          <span className={styles.role} style={{ color: rc.color }}>{t.role}</span>
        </div>
      </div>
      <p className={styles.desc}>{t.desc}</p>
      <div className={styles.cardActionHint}>
        <span>Open in Codex</span>
        <ArrowRight size={12} />
      </div>
      <div className={styles.cardCornerFold} aria-hidden="true" />
    </div>
  )
}

export default function TechSection() {
  const titleRef = useScrollReveal({ threshold: 0.2 })
  const [viewMode, setViewMode] = useState('book') // 'book' (default) | 'grid'

  return (
    <section id="technology" className={styles.section}>
      <div className={styles.topLine} aria-hidden="true" />

      <div className="container">
        <div ref={titleRef} className={styles.header}>
          <span className="section-eyebrow">
            <Cpu size={11} />
            Stack & Architecture Codex
          </span>
          <h2 className="section-heading">
            Built on proven, battle-tested<br />
            <span className="gradient-text">machine learning foundations.</span>
          </h2>
          <p className="section-subheading">
            ContextIQ unifies transformer representations with production-grade backend engineering
            to deliver instant, verifiable answers without remote model dependencies.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className={styles.toggleWrap}>
          <div className={styles.toggleContainer} role="tablist" aria-label="View layout switch">
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'book' ? styles.toggleBtnActive : ''}`}
              onClick={() => setViewMode('book')}
              role="tab"
              aria-selected={viewMode === 'book'}
            >
              <BookOpen size={14} />
              <span>3D Codex Book</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleBtnActive : ''}`}
              onClick={() => setViewMode('grid')}
              role="tab"
              aria-selected={viewMode === 'grid'}
            >
              <LayoutGrid size={14} />
              <span>Architecture Grid</span>
            </button>
          </div>
        </div>

        {/* Interactive 3D Book View */}
        {viewMode === 'book' ? (
          <TechBook />
        ) : (
          <div className={styles.grid}>
            {TECH.map((t, i) => (
              <TechCard
                key={t.name}
                t={t}
                index={i}
                onOpenBook={() => setViewMode('book')}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
