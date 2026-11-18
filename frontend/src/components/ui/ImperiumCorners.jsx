import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './ImperiumCorners.module.css'

export default function ImperiumCorners() {
  const { isImperium } = useTheme()
  if (!isImperium) return null

  return (
    <>
      <div className={`${styles.corner} ${styles.topLeft}`} aria-hidden="true" />
      <div className={`${styles.corner} ${styles.topRight}`} aria-hidden="true" />
      <div className={`${styles.corner} ${styles.bottomLeft}`} aria-hidden="true" />
      <div className={`${styles.corner} ${styles.bottomRight}`} aria-hidden="true" />
    </>
  )
}
