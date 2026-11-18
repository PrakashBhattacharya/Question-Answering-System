import React, { useState, useEffect, useRef } from 'react'
import { Palette, Check, X } from 'lucide-react'
import { useTheme, THEMES, THEME_ORDER } from '../../context/ThemeContext'
import styles from './ThemeSelector.module.css'

const THEME_ICONS = {
  original: '◈',
  void: '✦',
  cloud: '◉',
  ember: '◆',
  pixelcraft: '▣',
  imperium: '⚜',
}

const THEME_NUMBERS = {
  original: '01',
  void: '02',
  cloud: '03',
  ember: '04',
  pixelcraft: '05',
  imperium: '06',
}

function ThemePreviewSwatch({ themeData }) {
  const { pixelPreview } = themeData
  return (
    <div className={styles.swatch}>
      <div className={styles.swatchBg} style={{ background: pixelPreview[0] }} />
      <div className={styles.swatchAccent} style={{ background: pixelPreview[1] }} />
      <div className={styles.swatchSecondary} style={{ background: pixelPreview[2] }} />
    </div>
  )
}

export default function ThemeSelector() {
  const { theme, switchTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const btnRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const currentTheme = THEMES[theme]

  return (
    <div className={styles.wrapper}>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Change theme"
        aria-expanded={open}
        title="Appearance"
      >
        <Palette size={14} />
        <span className={styles.triggerLabel}>
          {THEME_ICONS[theme]} {currentTheme?.name || 'Theme'}
        </span>
      </button>

      {open && (
        <div ref={panelRef} className={styles.panel} role="dialog" aria-label="Theme selector">
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>APPEARANCE</span>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close theme selector"
            >
              <X size={14} />
            </button>
          </div>

          <div className={styles.themeList}>
            {THEME_ORDER.map((themeId) => {
              const td = THEMES[themeId]
              const isActive = theme === themeId
              return (
                <button
                  key={themeId}
                  type="button"
                  className={`${styles.themeRow} ${isActive ? styles.themeRowActive : ''}`}
                  onClick={(e) => {
                    switchTheme(themeId, e)
                    setTimeout(() => setOpen(false), 240)
                  }}
                  aria-pressed={isActive}
                >
                  <div className={styles.themeRowLeft}>
                    <div className={styles.radioOuter}>
                      {isActive ? (
                        <div className={styles.radioDot} />
                      ) : null}
                    </div>
                    <ThemePreviewSwatch themeData={td} />
                    <div className={styles.themeInfo}>
                      <div className={styles.themeRowTop}>
                        <span className={styles.themeNum}>{THEME_NUMBERS[themeId]}</span>
                        <span className={styles.themeName}>{td.name}</span>
                      </div>
                      <span className={styles.themeSubtitle}>{td.subtitle}</span>
                    </div>
                  </div>
                  {isActive && (
                    <div className={styles.activeCheck}>
                      <Check size={11} />
                      <span>Active</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
