import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './ConfidenceGauge.module.css'

export default function ConfidenceGauge({ score }) {
  const { theme } = useTheme()

  // Normalize score to percentage 0..100
  const normalizedScore = typeof score === 'number'
    ? score <= 1.0 ? Math.round(score * 1000) / 10 : Math.round(score * 10) / 10
    : 0

  const percent = Math.min(100, Math.max(0, normalizedScore))

  // Roman numeral approximation for Imperium (I to X)
  const romanTiers = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  const tierIndex = Math.min(9, Math.floor(percent / 10))
  const romanTier = romanTiers[tierIndex]

  // SVG Ring calculations
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  if (theme === 'pixelcraft') {
    const totalBlocks = 10
    const filledBlocks = Math.round((percent / 100) * totalBlocks)
    return (
      <div className={styles.pixelContainer} title={`Confidence: ${percent}%`}>
        <div className={styles.pixelHeader}>
          <span>HP</span>
          <span>{percent}%</span>
        </div>
        <div className={styles.pixelBlocks}>
          {Array.from({ length: totalBlocks }).map((_, i) => (
            <div
              key={i}
              className={`${styles.pixelBlock} ${i < filledBlocks ? styles.pixelBlockFilled : ''}`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (theme === 'imperium') {
    return (
      <div className={styles.imperiumContainer} title={`Confidence: ${percent}%`}>
        <svg className={styles.svgRing} viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="rgba(212, 175, 55, 0.2)"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#d4af37"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className={styles.imperiumText}>
          <span className={styles.imperiumScore}>{percent}%</span>
          <span className={styles.imperiumTier}>TIER {romanTier}</span>
        </div>
      </div>
    )
  }

  if (theme === 'void') {
    return (
      <div className={styles.voidContainer} title={`Telemetry Confidence: ${percent}%`}>
        <div className={styles.voidHeader}>
          <span>CONF</span>
          <span>{percent}%</span>
        </div>
        <div className={styles.voidBar}>
          <div className={styles.voidFill} style={{ width: `${percent}%` }} />
        </div>
      </div>
    )
  }

  if (theme === 'cloud') {
    return (
      <div className={styles.cloudContainer} title={`Confidence: ${percent}%`}>
        <svg className={styles.svgRing} viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="rgba(37, 99, 235, 0.15)"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={styles.cloudScore}>{percent}%</span>
      </div>
    )
  }

  if (theme === 'ember') {
    return (
      <div className={styles.emberContainer} title={`Confidence: ${percent}%`}>
        <svg className={styles.svgRing} viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="rgba(234, 88, 12, 0.2)"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#ea580c"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={styles.emberScore}>{percent}%</span>
      </div>
    )
  }

  // Default / Original Theme
  return (
    <div className={styles.originalContainer} title={`Confidence: ${percent}%`}>
      <svg className={styles.svgRing} viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="rgba(99, 102, 241, 0.25)"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.originalText}>
        <span className={styles.originalScore}>{percent}%</span>
        <span className={styles.originalLabel}>Confidence</span>
      </div>
    </div>
  )
}
