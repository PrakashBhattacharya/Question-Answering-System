import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import styles from './PipelineSection.module.css'

/* ── Figure 1: High-Tech Document Ingestion & In-Memory Pipeline ── */
function Fig1Illustration() {
  return (
    <svg className={styles.wireSvg} viewBox="0 0 280 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fig1-sheet1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="fig1-sheet2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0f1117" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="fig1-laser" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#6366f1" stopOpacity="1" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fig1-laser-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="fig1-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <ellipse cx="140" cy="110" rx="90" ry="60" fill="url(#fig1-glow)" />

      {/* In-Memory Base Platform */}
      <g opacity="0.9">
        <path d="M45 145 L140 185 L235 145 L140 105 Z" fill="#0d111c" stroke="rgba(99, 102, 241, 0.35)" strokeWidth="1.2" />
        <path d="M45 145 L45 155 L140 195 L235 155 L235 145" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
        <path d="M140 185 L140 195" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />

        {/* Memory Array Blocks */}
        <rect x="75" y="135" width="22" height="12" rx="3" transform="skewY(-15)" fill="rgba(34, 211, 238, 0.15)" stroke="#22d3ee" strokeWidth="0.8" />
        <rect x="110" y="145" width="22" height="12" rx="3" transform="skewY(-15)" fill="rgba(99, 102, 241, 0.2)" stroke="#818cf8" strokeWidth="0.8" />
        <rect x="145" y="155" width="22" height="12" rx="3" transform="skewY(-15)" fill="rgba(168, 85, 247, 0.15)" stroke="#c084fc" strokeWidth="0.8" />
        <rect x="180" y="140" width="22" height="12" rx="3" transform="skewY(15)" fill="rgba(74, 222, 128, 0.15)" stroke="#4ade80" strokeWidth="0.8" />
      </g>

      {/* Back Glass Sheet */}
      <g transform="translate(10, -5)">
        <rect x="90" y="32" width="105" height="115" rx="8" transform="rotate(-6 90 32)" fill="url(#fig1-sheet1)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
      </g>

      {/* Front Ingested Document Card */}
      <rect x="78" y="24" width="124" height="128" rx="10" fill="url(#fig1-sheet2)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" />

      {/* Document Header Bar */}
      <rect x="92" y="38" width="40" height="6" rx="3" fill="#818cf8" />
      <rect x="174" y="38" width="16" height="6" rx="2" fill="rgba(34, 211, 238, 0.25)" stroke="#22d3ee" strokeWidth="0.6" />

      {/* Document Text Lines */}
      <rect x="92" y="52" width="96" height="3.5" rx="1.75" fill="rgba(255, 255, 255, 0.45)" />
      <rect x="92" y="60" width="84" height="3.5" rx="1.75" fill="rgba(255, 255, 255, 0.25)" />
      <rect x="92" y="68" width="90" height="3.5" rx="1.75" fill="rgba(255, 255, 255, 0.25)" />
      <rect x="92" y="76" width="70" height="3.5" rx="1.75" fill="rgba(255, 255, 255, 0.25)" />
      <rect x="92" y="84" width="96" height="3.5" rx="1.75" fill="rgba(255, 255, 255, 0.35)" />
      <rect x="92" y="92" width="80" height="3.5" rx="1.75" fill="rgba(255, 255, 255, 0.2)" />

      {/* Laser Scanning Fan & Aperture Beam */}
      <polygon points="68,74 212,74 195,96 85,96" fill="url(#fig1-laser-beam)" />
      <rect x="65" y="73" width="150" height="2" rx="1" fill="url(#fig1-laser)" />
      <circle cx="140" cy="74" r="3.5" fill="#22d3ee" />
      <circle cx="140" cy="74" r="7" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="2 2" />

      {/* Privacy Shield Capsule */}
      <g transform="translate(140, 142)">
        <circle cx="0" cy="0" r="14" fill="#0d111c" stroke="#4ade80" strokeWidth="1.2" />
        <path d="M-5 -2 L0 -6 L5 -2 V2 C5 5 0 8 0 8 C0 8 -5 5 -5 2 Z" fill="rgba(74, 222, 128, 0.2)" stroke="#4ade80" strokeWidth="1" />
        <circle cx="0" cy="0" r="1.5" fill="#4ade80" />
      </g>
    </svg>
  )
}

/* ── Figure 2: Neural Self-Attention & Bidirectional Cross-Attention Matrix ── */
function Fig2Illustration() {
  return (
    <svg className={styles.wireSvg} viewBox="0 0 280 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fig2-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fig2-syn-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="fig2-syn-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Concentric Attention Orbital Rings */}
      <ellipse cx="140" cy="105" rx="100" ry="55" stroke="rgba(255, 255, 255, 0.07)" strokeDasharray="3 4" />
      <ellipse cx="140" cy="105" rx="65" ry="36" stroke="rgba(99, 102, 241, 0.25)" strokeDasharray="2 3" />
      <circle cx="140" cy="105" r="45" fill="url(#fig2-core-glow)" />

      {/* Synaptic Attention Curves */}
      <path d="M65 65 Q105 85 140 105" stroke="url(#fig2-syn-cyan)" strokeWidth="1.8" />
      <path d="M215 65 Q175 85 140 105" stroke="url(#fig2-syn-violet)" strokeWidth="1.8" />
      <path d="M65 65 Q140 35 215 65" stroke="rgba(34, 211, 238, 0.35)" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M140 40 L140 105" stroke="rgba(192, 132, 252, 0.6)" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M80 155 Q110 130 140 105" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
      <path d="M200 155 Q170 130 140 105" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />

      {/* Floating Synapse Particles */}
      <circle cx="102" cy="85" r="2.5" fill="#22d3ee" />
      <circle cx="178" cy="85" r="2.5" fill="#c084fc" />
      <circle cx="140" cy="65" r="2" fill="#818cf8" />

      {/* Node 1: Query Vector (Top Left) */}
      <g transform="translate(65, 65)">
        <circle cx="0" cy="0" r="16" fill="#0f111a" stroke="#22d3ee" strokeWidth="1.4" />
        <circle cx="0" cy="0" r="5" fill="#22d3ee" />
        <rect x="-24" y="-28" width="48" height="13" rx="4" fill="#131622" stroke="rgba(34, 211, 238, 0.45)" strokeWidth="0.8" />
        <text x="0" y="-19" textAnchor="middle" fill="#22d3ee" fontSize="7" fontFamily="monospace" fontWeight="700">QUERY Q</text>
      </g>

      {/* Node 2: Key Representation (Top Right) */}
      <g transform="translate(215, 65)">
        <circle cx="0" cy="0" r="16" fill="#0f111a" stroke="#c084fc" strokeWidth="1.4" />
        <circle cx="0" cy="0" r="5" fill="#c084fc" />
        <rect x="-22" y="-28" width="44" height="13" rx="4" fill="#131622" stroke="rgba(192, 132, 252, 0.45)" strokeWidth="0.8" />
        <text x="0" y="-19" textAnchor="middle" fill="#c084fc" fontSize="7" fontFamily="monospace" fontWeight="700">KEY K</text>
      </g>

      {/* Node 3: Value Embeddings (Top Center) */}
      <g transform="translate(140, 36)">
        <circle cx="0" cy="0" r="13" fill="#0f111a" stroke="#818cf8" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="4" fill="#818cf8" />
        <rect x="-24" y="-24" width="48" height="12" rx="3" fill="#131622" stroke="rgba(129, 140, 248, 0.4)" strokeWidth="0.8" />
        <text x="0" y="-16" textAnchor="middle" fill="#818cf8" fontSize="6.5" fontFamily="monospace" fontWeight="700">VALUES V</text>
      </g>

      {/* Node 4 & 5: Context Token Embeddings (Bottom) */}
      <g transform="translate(80, 155)">
        <circle cx="0" cy="0" r="11" fill="#0f111a" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
        <circle cx="0" cy="0" r="3" fill="rgba(255, 255, 255, 0.7)" />
        <text x="0" y="18" textAnchor="middle" fill="#8a8f98" fontSize="6.5" fontFamily="monospace">Token i</text>
      </g>
      <g transform="translate(200, 155)">
        <circle cx="0" cy="0" r="11" fill="#0f111a" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
        <circle cx="0" cy="0" r="3" fill="rgba(255, 255, 255, 0.7)" />
        <text x="0" y="18" textAnchor="middle" fill="#8a8f98" fontSize="6.5" fontFamily="monospace">Token j</text>
      </g>

      {/* Central Transformer Attention Head Core */}
      <g transform="translate(140, 105)">
        <circle cx="0" cy="0" r="22" fill="#131524" stroke="#6366f1" strokeWidth="1.8" />
        <circle cx="0" cy="0" r="15" stroke="rgba(167, 139, 250, 0.45)" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="0" cy="0" r="6" fill="#8b5cf6" />
        {/* Bidirectional Pulse Indicators */}
        <path d="M-10 0 L-6 -4 M-10 0 L-6 4" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M10 0 L6 -4 M10 0 L6 4" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/* ── Figure 3: Precision Extractive Span Caliper ── */
function Fig3Illustration() {
  return (
    <svg className={styles.wireSvg} viewBox="0 0 280 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fig3-span-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="fig3-beacon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Isometric Document Plane */}
      <g opacity="0.95">
        <path d="M35 100 L140 50 L245 100 L140 150 Z" fill="#0d111c" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1.2" />
        <path d="M35 100 L35 108 L140 158 L245 108 L245 100" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
        <path d="M140 150 L140 158" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />

        {/* Preceding Document Text Lines */}
        <path d="M58 92 L118 64" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M128 60 L188 88" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M65 102 L98 87" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1.6" strokeLinecap="round" />

        {/* ── THE EXACT EXTRACTED SPAN (Glowing Target Polygon) ── */}
        <polygon
          points="80,112 170,70 196,82 106,124"
          fill="url(#fig3-span-grad)"
          stroke="#4ade80"
          strokeWidth="1.5"
        />

        {/* Highlighted Answer Text Lines Inside Span */}
        <path d="M94,111 L168,76" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100,118 L158,91" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />

        {/* Start and End Caliper Anchors */}
        <circle cx="80" cy="112" r="3.5" fill="#4ade80" />
        <circle cx="196" cy="82" r="3.5" fill="#22d3ee" />

        {/* Caliper Bracket Reticles */}
        <path d="M78 107 L80 112 L87 109" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M189 85 L196 82 L198 87" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Subsequent Context Lines */}
        <path d="M116 130 L160 110" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M168 106 L218 128" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* Upward Laser Projection Rays */}
      <line x1="80" y1="112" x2="80" y2="48" stroke="#4ade80" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      <line x1="196" y1="82" x2="196" y2="34" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      <line x1="140" y1="97" x2="140" y2="42" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="2 2" />

      {/* Floating Verified Proof Capsule */}
      <g transform="translate(140, 38)">
        <rect x="-75" y="-18" width="150" height="34" rx="8" fill="#0f111c" stroke="#4ade80" strokeWidth="1.2" />
        {/* Verification Shield Icon */}
        <circle cx="-56" cy="-1" r="8" fill="rgba(74, 222, 128, 0.18)" stroke="#4ade80" strokeWidth="1" />
        <path d="M-59 -1 L-57 2 L-53 -3" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Header Text */}
        <text x="-42" y="-6" fill="#f7f8f8" fontSize="8" fontFamily="monospace" fontWeight="700">EXACT CONTIGUOUS SPAN</text>
        <text x="-42" y="6" fill="#4ade80" fontSize="7" fontFamily="monospace" fontWeight="600">P = 99.4% · ZERO HALLUCINATION</text>

        {/* Precision Crosshair in Corner */}
        <circle cx="58" cy="-1" r="5" stroke="#22d3ee" strokeWidth="0.8" />
        <circle cx="58" cy="-1" r="1.5" fill="#22d3ee" />
      </g>
    </svg>
  )
}

const FIGURES = [
  {
    fig: 'FIG 0.1',
    title: 'Document Ingestion',
    desc: 'Paste notes, upload articles, or feed reports. The system indexes your text in memory with complete data privacy.',
    illustration: Fig1Illustration,
  },
  {
    fig: 'FIG 0.2',
    title: 'Context Understanding',
    desc: 'Connects words, synonyms, and meanings. Understands what you are asking even if your exact wording is different.',
    illustration: Fig2Illustration,
  },
  {
    fig: 'FIG 0.3',
    title: 'Exact Span Extraction',
    desc: 'Pinpoints the exact sentence that answers your question with 100% verifiable source proof and zero hallucinations.',
    illustration: Fig3Illustration,
  },
]

export default function PipelineSection() {
  const titleRef = useScrollReveal({ threshold: 0.2 })

  return (
    <section id="pipeline" className={styles.section}>
      <div className={styles.topLine} aria-hidden="true" />
      <div className="container">
        {/* ── Headline in Linear style (Screenshot 3) ──────────── */}
        <div ref={titleRef} className={styles.header}>
          <h2 className={styles.headline}>
            <span className={styles.headlineWhite}>A new standard for understanding text.</span>{' '}
            <span className={styles.headlineGray}>
              Purpose-built for anyone who reads, studies, or works with documents.
              ContextIQ extracts the truth without guessing or making things up.
            </span>
          </h2>
        </div>

        {/* ── Three Figure panels matching Screenshot 3 ──────── */}
        <div className={styles.figGrid}>
          {FIGURES.map((f, i) => {
            const Illustration = f.illustration
            return (
              <div key={f.fig} className={styles.figCard} style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className={styles.figTop}>
                  <span className={styles.figLabel}>{f.fig}</span>
                  <div className={styles.figDot} />
                </div>

                <div className={styles.canvasArea}>
                  <Illustration />
                </div>

                <div className={styles.figCaption}>
                  <h3 className={styles.figTitle}>{f.title}</h3>
                  <p className={styles.figDesc}>{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
