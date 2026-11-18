import React from 'react'
import {
  UploadCloud, Plus, History, Bookmark, BarChart3, Code2, Zap, ArrowRight
} from 'lucide-react'
import styles from './QuickActionsCard.module.css'

export default function QuickActionsCard({
  onNewQuery,
  onSelectView,
  onTriggerUpload,
}) {
  const actions = [
    {
      id: 'upload',
      label: 'Upload Document',
      desc: 'Ingest text or markdown',
      icon: UploadCloud,
      shortcut: '⌘U',
      theme: 'cyan',
      action: onTriggerUpload,
    },
    {
      id: 'new-query',
      label: 'New Query',
      desc: 'Reset workspace',
      icon: Plus,
      shortcut: '⌘N',
      theme: 'violet',
      action: onNewQuery,
    },
    {
      id: 'history',
      label: 'View History',
      desc: 'Past inference queries',
      icon: History,
      shortcut: '⌘H',
      theme: 'amber',
      action: () => onSelectView('history'),
    },
    {
      id: 'saved',
      label: 'Saved Answers',
      desc: 'Bookmarked spans',
      icon: Bookmark,
      shortcut: '⌘S',
      theme: 'emerald',
      action: () => onSelectView('saved'),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      desc: 'SQuAD benchmarks',
      icon: BarChart3,
      shortcut: '⌘A',
      theme: 'indigo',
      action: () => onSelectView('analytics'),
    },
    {
      id: 'playground',
      label: 'API Playground',
      desc: 'Raw cURL & Python',
      icon: Code2,
      shortcut: '⌘P',
      theme: 'rose',
      action: () => onSelectView('playground'),
    },
  ]

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBadge}>
            <Zap size={14} className={styles.headerIcon} />
          </div>
          <h3 className={styles.title}>Quick Actions</h3>
        </div>
        <span className={styles.shortcutHint}>Shortcuts Enabled</span>
      </div>

      <div className={styles.grid}>
        {actions.map((act) => {
          const Icon = act.icon

          return (
            <button
              key={act.id}
              type="button"
              className={`${styles.actionBtn} ${styles[`theme_${act.theme}`]}`}
              onClick={act.action}
            >
              <div className={styles.btnGlow} />
              <div className={styles.btnContent}>
                <div className={styles.iconWrap}>
                  <Icon size={15} />
                </div>
                <div className={styles.textWrap}>
                  <div className={styles.labelRow}>
                    <span className={styles.label}>{act.label}</span>
                    <span className={styles.shortcut}>{act.shortcut}</span>
                  </div>
                  <span className={styles.desc}>{act.desc}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
