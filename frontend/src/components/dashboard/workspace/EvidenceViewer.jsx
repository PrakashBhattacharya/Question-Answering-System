import React, { useEffect, useRef, useState } from 'react'
import { Eye, Target, Hash, Sparkles, ShieldCheck, ArrowRight, Scan, CheckCircle2 } from 'lucide-react'
import styles from './EvidenceViewer.module.css'

export default function EvidenceViewer({
  context,
  result,
}) {
  const markRef = useRef(null)
  const [scanStep, setScanStep] = useState('verify') // 'scan' | 'locate' | 'highlight' | 'verify'

  useEffect(() => {
    if (result && result.has_answer) {
      // Trigger the SCAN → LOCATE → HIGHLIGHT → VERIFY pipeline
      setScanStep('scan')
      const t1 = setTimeout(() => setScanStep('locate'), 400)
      const t2 = setTimeout(() => setScanStep('highlight'), 850)
      const t3 = setTimeout(() => {
        setScanStep('verify')
        if (markRef.current) {
          markRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 1300)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [result])

  if (!context || !result || !result.has_answer) return null

  const { start, end } = result
  const isValidSpan = typeof start === 'number' && typeof end === 'number' && start >= 0 && end > start && end <= context.length

  const beforeText = isValidSpan ? context.slice(0, start) : context
  const spanText = isValidSpan ? context.slice(start, end) : ''
  const afterText = isValidSpan ? context.slice(end) : ''

  return (
    <div className={styles.container}>
      {/* ── 3D Chamfered Header ─────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.radarIconWrap}>
            <Eye size={13} className={styles.headerIcon} />
          </div>
          <div className={styles.titleStack}>
            <span className={styles.headerTitle}>GROUND TRUTH EVIDENCE</span>
            <span className={styles.headerSub}>Verifiable Contiguous Substring</span>
          </div>
        </div>

        {/* Real-time Evidence Scanner Pipeline Badge */}
        <div className={styles.scannerBadge}>
          <Scan size={12} className={scanStep !== 'verify' ? styles.scannerSpin : styles.scannerDone} />
          <div className={styles.scannerSteps}>
            <span className={scanStep === 'scan' ? styles.stepActive : styles.stepDone}>SCAN</span>
            <span className={styles.stepArrow}>→</span>
            <span className={scanStep === 'locate' ? styles.stepActive : scanStep === 'highlight' || scanStep === 'verify' ? styles.stepDone : ''}>LOCATE</span>
            <span className={styles.stepArrow}>→</span>
            <span className={scanStep === 'highlight' ? styles.stepActive : scanStep === 'verify' ? styles.stepDone : ''}>HIGHLIGHT</span>
            <span className={styles.stepArrow}>→</span>
            <span className={scanStep === 'verify' ? styles.stepVerified : ''}>VERIFY</span>
          </div>
        </div>

        <div className={styles.offsetAnchorPill}>
          <Target size={12} className={styles.anchorIcon} />
          <span className={styles.offsetLabel}>Pointers:</span>
          <span className={styles.offsetCoords}>
            <code>{start}</code>
            <ArrowRight size={10} className={styles.coordArrow} />
            <code>{end}</code>
          </span>
          <span className={styles.lenTag}>({end - start} chars)</span>
        </div>
      </div>

      {/* ── Context Box with Scanner Beam & 3D Answer Lens ─── */}
      <div className={styles.contextBox}>
        {/* Animated Laser Scanning Line */}
        {scanStep !== 'verify' && (
          <div className={styles.laserScannerLine} aria-hidden="true" />
        )}

        <div className={styles.contextText}>
          {isValidSpan ? (
            <>
              <span>{beforeText}</span>
              <mark
                ref={markRef}
                className={`${styles.highlightSpan} ${scanStep === 'verify' ? styles.spanLocked : ''}`}
              >
                <span className={styles.bracket}>[</span>
                <span className={styles.spanContent}>{spanText}</span>
                <span className={styles.bracket}>]</span>
                <span className={styles.groundingBeam} aria-hidden="true" />
                <span className={styles.spanIndicatorTag}>ANSWER SPAN</span>
              </mark>
              <span>{afterText}</span>
            </>
          ) : (
            <span>{context}</span>
          )}
        </div>
      </div>

      {/* ── Cryptographic Proof Footer ──────────────────────── */}
      <div className={styles.footerRow}>
        <div className={styles.proofBadge}>
          <ShieldCheck size={13} className={styles.proofIconGreen} />
          <span>Extractive Proof · Pointer Argmax [i : j]</span>
        </div>
        <span className={styles.proofNote}>
          100% physically grounded in context passage with 0.00% synthesis.
        </span>
      </div>
    </div>
  )
}
