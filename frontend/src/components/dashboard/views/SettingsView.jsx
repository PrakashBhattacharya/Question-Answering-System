import React, { useState } from 'react'
import {
  Palette, User, Server, Keyboard, Check,
  Cpu, Bell, Sliders, Shield, Sparkles
} from 'lucide-react'
import { useTheme, THEMES, THEME_ORDER } from '../../../context/ThemeContext'
import { storageService } from '../../../services/storage'
import styles from './SettingsView.module.css'

const THEME_ICONS = {
  original: '◈',
  void: '✦',
  cloud: '◉',
  ember: '◆',
  pixelcraft: '▣',
}

export default function SettingsView({ user, onAddToast }) {
  const { theme, switchTheme } = useTheme()
  const [prefs, setPrefs] = useState(() => storageService.getPreferences())
  const [backendUrl, setBackendUrl] = useState(prefs.backendUrl || 'http://localhost:8000')
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Model settings (15x increased limits)
  const [maxSeqLength, setMaxSeqLength] = useState('7680')
  const [docStride, setDocStride] = useState('256')
  const [maxAnswerLength, setMaxAnswerLength] = useState('450')
  const [nullScoreThreshold, setNullScoreThreshold] = useState('-1.5')
  const [fp16Enabled, setFp16Enabled] = useState(true)

  // Notification settings
  const [toastDuration, setToastDuration] = useState('4000')
  const [soundEnabled, setSoundEnabled] = useState(false)

  const handleSavePreferences = (e) => {
    e.preventDefault()
    storageService.updatePreferences({
      ...prefs,
      backendUrl,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
    if (onAddToast) {
      onAddToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your workspace preferences have been updated.',
      })
    }
  }

  const shortcuts = [
    { key: 'Ctrl + ↵', action: 'Run BERT extraction from Question panel' },
    { key: 'Ctrl + K', action: 'Open Global Command Palette' },
    { key: 'Esc', action: 'Dismiss modal / command palette' },
    { key: '↑ / ↓', action: 'Navigate command palette search results' },
    { key: 'Enter', action: 'Select command palette item' },
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Settings & <span className={styles.gradientText}>Preferences</span>
        </h1>
        <p className={styles.subTitle}>
          Configure your appearance theme, account credentials, BERT model inference parameters, and workspace controls.
        </p>
      </div>

      <div className={styles.sections}>
        {/* 1. APPEARANCE & THEME SYSTEM */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <Palette size={16} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Appearance & Design System</h2>
              <p className={styles.cardSub}>
                Switch between five complete project-wide visual design systems.
              </p>
            </div>
          </div>

          <div className={styles.themeGrid}>
            {THEME_ORDER.map((themeId) => {
              const td = THEMES[themeId]
              const isActive = theme === themeId
              return (
                <div
                  key={themeId}
                  className={`${styles.themeCard} ${isActive ? styles.themeCardActive : ''}`}
                  onClick={() => switchTheme(themeId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      switchTheme(themeId)
                    }
                  }}
                  aria-pressed={isActive}
                >
                  <div className={styles.themeCardHeader}>
                    <span className={styles.themeCardIcon}>{THEME_ICONS[themeId]}</span>
                    <span className={styles.themeCardName}>{td.name}</span>
                    {isActive && (
                      <span className={styles.activePill}>
                        <Check size={11} /> ACTIVE
                      </span>
                    )}
                  </div>
                  <p className={styles.themeCardSubtitle}>{td.subtitle}</p>

                  {/* Visual Color Miniature */}
                  <div className={styles.themeSwatchBar}>
                    <div className={styles.swatchBlock} style={{ background: td.pixelPreview[0] }} />
                    <div className={styles.swatchBlock} style={{ background: td.pixelPreview[1] }} />
                    <div className={styles.swatchBlock} style={{ background: td.pixelPreview[2] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. USER ACCOUNT */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <User size={16} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Account Profile</h2>
              <p className={styles.cardSub}>Current authenticated user session</p>
            </div>
          </div>

          <div className={styles.profileFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Full Name</label>
              <div className={styles.readOnlyField}>{user?.full_name || (user?.email ? user.email.split('@')[0] : 'ContextIQ User')}</div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Email Address</label>
              <div className={styles.readOnlyField}>{user?.email || 'user@contextiq.ai'}</div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Account ID / Scope</label>
              <div className={styles.readOnlyMono}>{user?.id || user?.email || 'ctx-usr-standard'}</div>
            </div>
          </div>
        </div>

        {/* 3. BERT MODEL & INFERENCE */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <Cpu size={16} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>BERT Engine Parameters</h2>
              <p className={styles.cardSub}>Fine-tune SQuAD 2.0 extractive logits classification</p>
            </div>
          </div>

          <div className={styles.profileFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Max Sequence Length (Tokens)</label>
              <input
                type="number"
                className={styles.input}
                value={maxSeqLength}
                onChange={(e) => setMaxSeqLength(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Document Stride</label>
              <input
                type="number"
                className={styles.input}
                value={docStride}
                onChange={(e) => setDocStride(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Max Answer Length (Tokens)</label>
              <input
                type="number"
                className={styles.input}
                value={maxAnswerLength}
                onChange={(e) => setMaxAnswerLength(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Null-Score Threshold</label>
              <input
                type="text"
                className={styles.input}
                value={nullScoreThreshold}
                onChange={(e) => setNullScoreThreshold(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.switchRow}>
            <div>
              <div className={styles.switchTitle}>FP16 Half-Precision Inference</div>
              <div className={styles.switchDesc}>Accelerates self-attention matrix calculation by ~2.3x.</div>
            </div>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={fp16Enabled}
              onChange={(e) => setFp16Enabled(e.target.checked)}
            />
          </div>
        </div>

        {/* 4. FASTAPI / API CONNECTION */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <Server size={16} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>FastAPI Connection</h2>
              <p className={styles.cardSub}>Backend service configuration and model endpoint</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="backend-url">
                Backend API Origin
              </label>
              <input
                id="backend-url"
                type="text"
                className={styles.input}
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
              />
              <span className={styles.fieldHelp}>
                Vite dev proxy forwards <code>/api/*</code> to this origin automatically.
              </span>
            </div>

            <div className={styles.switchRow}>
              <div>
                <div className={styles.switchTitle}>Auto-scroll to Ground Truth Evidence</div>
                <div className={styles.switchDesc}>Smoothly scroll to extracted span upon inference completion.</div>
              </div>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={prefs.autoScrollEvidence}
                onChange={(e) =>
                  setPrefs({ ...prefs, autoScrollEvidence: e.target.checked })
                }
              />
            </div>

            <div className={styles.cardActions}>
              <button type="submit" className={styles.saveBtn}>
                {savedSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 5. NOTIFICATIONS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <Bell size={16} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Notifications & Toasts</h2>
              <p className={styles.cardSub}>Configure visual alerts and sound telemetry</p>
            </div>
          </div>

          <div className={styles.profileFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Toast Auto-Dismiss (ms)</label>
              <input
                type="number"
                className={styles.input}
                value={toastDuration}
                onChange={(e) => setToastDuration(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.switchRow}>
            <div>
              <div className={styles.switchTitle}>Audible Telemetry Pings</div>
              <div className={styles.switchDesc}>Play a soft chime upon successful extractive verification.</div>
            </div>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
          </div>
        </div>

        {/* 6. KEYBOARD SHORTCUTS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <Keyboard size={16} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Keyboard Shortcuts</h2>
              <p className={styles.cardSub}>Productivity shortcuts for rapid extraction</p>
            </div>
          </div>

          <div className={styles.shortcutsList}>
            {shortcuts.map((sc, idx) => (
              <div key={idx} className={styles.shortcutRow}>
                <span className={styles.shortcutAction}>{sc.action}</span>
                <kbd className={styles.shortcutKbd}>{sc.key}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
