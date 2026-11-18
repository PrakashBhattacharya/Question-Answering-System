import React from 'react'
import { ShieldCheck, Info, RotateCcw, Orbit } from 'lucide-react'
import styles from './NoAnswerCard.module.css'

export default function NoAnswerCard({ onAskAgain }) {
  return (
    <div className={styles.card}>
      {/* ── 3D Orbital Empty State Sphere ─────────────────────── */}
      <div className={styles.sphereContainer}>
        <div className={styles.orbitRing} />
        <div className={styles.orbitDot} />
        <div className={styles.centralOrb}>
          <span className={styles.dashGlyph}>—</span>
        </div>
      </div>

      <div className={styles.header}>
        <span className={styles.statusPill}>
          <ShieldCheck size={12} className={styles.pillIcon} />
          <span>SQuAD 2.0 Abstention Head (τ = -1.84)</span>
        </span>
        <h3 className={styles.title}>NO RELIABLE ANSWER FOUND</h3>
        <p className={styles.desc}>
          The supplied context does not contain a sufficiently supported answer span.
          ContextIQ strictly abstains to guarantee 0.00% hallucination.
        </p>
      </div>

      <div className={styles.footerRow}>
        <div className={styles.hintBox}>
          <Info size={13} className={styles.hintIcon} />
          <span>Tip: Provide broader passage context or adjust question phrasing.</span>
        </div>
        <button
          type="button"
          className={styles.rephraseBtn}
          onClick={onAskAgain}
        >
          <RotateCcw size={13} />
          <span>Try Another Question</span>
        </button>
      </div>
    </div>
  )
}
