import React, { useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './ConfidenceOrb.module.css'

/**
 * ConfidenceOrb: Interactive 3D sphere with gyroscope rings,
 * orbital particles, confidence arc, and live backend percentage.
 * Pure SVG + CSS 3D (no third-party heavy WebGL).
 */
export default function ConfidenceOrb({ score = 0, size = 110 }) {
  const { theme } = useTheme()

  // Ensure real backend score is normalized accurately
  const normalizedPct = useMemo(() => {
    if (typeof score !== 'number' || isNaN(score)) return 0
    const raw = score <= 1.0 ? score * 100 : score
    return Math.min(100, Math.max(0, Math.round(raw * 10) / 10))
  }, [score])

  // Arc calculation for SVG confidence track
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (normalizedPct / 100) * circumference

  // Theme-specific glow and color palettes
  const themeClass = styles[`orbTheme_${theme}`] || styles.orbTheme_original

  return (
    <div
      className={`${styles.orbWrapper} ${themeClass}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title={`Verified Backend Model Confidence: ${normalizedPct}%`}
    >
      {/* 3D Atmospheric Aura */}
      <div className={styles.ambientAura} aria-hidden="true" />

      {/* Outer Gyroscope Rings */}
      <div className={styles.gyroRing1} aria-hidden="true" />
      <div className={styles.gyroRing2} aria-hidden="true" />

      {/* SVG Arc Meter */}
      <svg className={styles.svgMeter} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={styles.meterTrack}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={styles.meterFill}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>

      {/* Central Holographic Core */}
      <div className={styles.coreOrb}>
        <div className={styles.innerPlasma} />
        <div className={styles.coreData}>
          <span className={styles.scoreNumber}>{normalizedPct}%</span>
          <span className={styles.scoreLabel}>CONFIDENCE</span>
        </div>
      </div>

      {/* Orbiting Photon Particles */}
      <div className={styles.particleCluster} aria-hidden="true">
        <span className={styles.photon1} />
        <span className={styles.photon2} />
        <span className={styles.photon3} />
      </div>
    </div>
  )
}
