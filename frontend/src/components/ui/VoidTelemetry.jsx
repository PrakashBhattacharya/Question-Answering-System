import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './VoidTelemetry.module.css'

export default function VoidTelemetry({ model = 'bert' }) {
  const { isVoid } = useTheme()
  if (!isVoid) return null

  return (
    <div className={styles.bar} aria-label="System telemetry">
      <div className={styles.item}>
        <div className={styles.dot} />
        <span>SYS: <span className={styles.val}>READY</span></span>
      </div>
      <div className={styles.item}>
        <span>ENGINE: <span className={styles.val}>TORCH_EVAL</span></span>
      </div>
      <div className={styles.item}>
        <span>MODEL: <span className={styles.val}>{model.toUpperCase()}</span></span>
      </div>
      <div className={styles.item}>
        <span>PRECISION: <span className={styles.val}>FP32</span></span>
      </div>
    </div>
  )
}
