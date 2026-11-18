import React, { useState, useEffect, useRef } from 'react'
import {
  Search, PlusCircle, FileText, History, Bookmark,
  BarChart3, Code2, Settings, LogOut, Cpu, ArrowRight,
  Command, CornerDownLeft, Sparkles, Activity
} from 'lucide-react'
import styles from './CommandPalette.module.css'

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectView,
  onNewQuery,
  onOpenModelDetails,
  onSignOut,
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const commands = [
    {
      id: 'new-query',
      title: 'New Query',
      subtitle: 'Start a fresh Question Answering session',
      category: 'Workspace',
      icon: PlusCircle,
      action: () => {
        onNewQuery()
        onClose()
      },
    },
    {
      id: 'workspace',
      title: 'Open Workspace',
      subtitle: 'Navigate to Question Answering Workspace',
      category: 'Navigation',
      icon: Command,
      action: () => {
        onSelectView('workspace')
        onClose()
      },
    },
    {
      id: 'documents',
      title: 'Open Documents',
      subtitle: 'Browse, manage, and load context documents',
      category: 'Navigation',
      icon: FileText,
      action: () => {
        onSelectView('documents')
        onClose()
      },
    },
    {
      id: 'history',
      title: 'Search History',
      subtitle: 'Review past queries and extracted answers',
      category: 'Navigation',
      icon: History,
      action: () => {
        onSelectView('history')
        onClose()
      },
    },
    {
      id: 'saved',
      title: 'Open Saved Answers',
      subtitle: 'Access bookmarked answer cards and proof',
      category: 'Navigation',
      icon: Bookmark,
      action: () => {
        onSelectView('saved')
        onClose()
      },
    },
    {
      id: 'analytics',
      title: 'Open Analytics',
      subtitle: 'View real session metrics & benchmark evaluations',
      category: 'Navigation',
      icon: BarChart3,
      action: () => {
        onSelectView('analytics')
        onClose()
      },
    },
    {
      id: 'playground',
      title: 'Open API Playground',
      subtitle: 'Test live POST /qa/answer requests directly',
      category: 'Developer',
      icon: Code2,
      action: () => {
        onSelectView('playground')
        onClose()
      },
    },
    {
      id: 'feedback',
      title: 'Open Model Feedback & Improvement',
      subtitle: 'Submit reviews and manage fine-tuning training queue',
      category: 'Model',
      icon: Sparkles,
      action: () => {
        onSelectView('feedback')
        onClose()
      },
    },
    {
      id: 'logs',
      title: 'Open Live Audit Feed',
      subtitle: 'Real-time cryptographic audit trail of inference and tickets',
      category: 'Security',
      icon: Sparkles,
      action: () => {
        onSelectView('logs')
        onClose()
      },
    },
    {
      id: 'model-details',
      title: 'View Model Architecture & Specs',
      subtitle: 'Inspect deepset/bert-base-cased-squad2 parameters',
      category: 'System',
      icon: Cpu,
      action: () => {
        onOpenModelDetails()
        onClose()
      },
    },
    {
      id: 'settings',
      title: 'Settings & Preferences',
      subtitle: 'Configure account, backend URL, and keyboard shortcuts',
      category: 'Settings',
      icon: Settings,
      action: () => {
        onSelectView('settings')
        onClose()
      },
    },
    {
      id: 'logout',
      title: 'Log Out',
      subtitle: 'Sign out of ContextIQ session',
      category: 'Account',
      icon: LogOut,
      action: () => {
        onSignOut()
        onClose()
      },
    },
  ]

  const filteredCommands = commands.filter((cmd) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    )
  })

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className={styles.inputWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Type a command or search workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.escBadge}>ESC</span>
        </div>

        {/* Results list */}
        <div className={styles.list}>
          {filteredCommands.length === 0 ? (
            <div className={styles.empty}>
              No commands matching "<span>{query}</span>"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon
              const isSelected = idx === selectedIndex

              return (
                <div
                  key={cmd.id}
                  className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className={styles.itemIcon}>
                    <Icon size={15} />
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>{cmd.title}</span>
                      <span className={styles.itemCategory}>{cmd.category}</span>
                    </div>
                    <span className={styles.itemSub}>{cmd.subtitle}</span>
                  </div>
                  {isSelected && (
                    <div className={styles.returnHint}>
                      <CornerDownLeft size={12} />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerHints}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>esc</kbd> Dismiss</span>
          </div>
          <span className={styles.brandTag}>ContextIQ Command Hub</span>
        </div>
      </div>
    </div>
  )
}
