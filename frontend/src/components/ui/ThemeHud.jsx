import React, { useState, useEffect, useRef } from 'react'
import { useTheme, THEME_ORDER, THEMES } from '../../context/ThemeContext'
import { soundService } from '../../services/soundService'
import styles from './ThemeHud.module.css'

export default function ThemeHud() {
  const { theme, switchTheme, currentTheme } = useTheme()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)
  const initialMount = useRef(true)

  // Listen to keyboard shortcut 't' to cycle themes
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in form inputs
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        document.activeElement?.isContentEditable
      ) {
        return
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        const currentIndex = THEME_ORDER.indexOf(theme)
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + THEME_ORDER.length) % THEME_ORDER.length
          : (currentIndex + 1) % THEME_ORDER.length
        const nextTheme = THEME_ORDER[nextIndex]

        switchTheme(nextTheme)
        soundService.playThemeSwitch(nextTheme)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [theme, switchTheme])

  // Show HUD when theme changes
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }

    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setVisible(false)
    }, 2200)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [theme])

  return (
    <div
      className={`${styles.hud} ${visible ? styles.visible : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.icon}>{currentTheme?.icon || '◈'}</div>
      <div className={styles.content}>
        <div className={styles.title}>
          <span>{currentTheme?.name}</span>
          <span className={styles.badge}>Active Theme</span>
        </div>
        <div className={styles.subtitle}>{currentTheme?.subtitle || currentTheme?.tagline}</div>
      </div>
    </div>
  )
}
