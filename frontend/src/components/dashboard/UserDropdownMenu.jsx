import React, { useEffect, useRef } from 'react'
import {
  Activity, MessageSquareDot, Settings,
  LogOut, Cpu, ShieldCheck
} from 'lucide-react'
import styles from './UserDropdownMenu.module.css'

export default function UserDropdownMenu({
  isOpen,
  onClose,
  user,
  onSelectView,
  onOpenModelDetails,
  onSignOut,
  position = 'bottom', // 'bottom' (for topbar) or 'top' (for sidebar)
}) {
  const menuRef = useRef(null)

  // Click outside listener and Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const fullName = user?.full_name || (user?.email ? user.email.split('@')[0] : 'User')
  const email = user?.email || 'user@contextiq.ai'
  const role = user?.role || 'ML Systems Lead & Admin'
  const initials = (fullName || 'U')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const handleNav = (viewId) => {
    if (onSelectView) onSelectView(viewId)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className={`${styles.dropdown} ${position === 'top' ? styles.positionTop : styles.positionBottom}`}
      role="dialog"
      aria-label="User Account Menu"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Profile Section */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>{initials}</div>
          <span className={styles.onlineBadge} title="Active Session" />
        </div>
        <div className={styles.nameBlock}>
          <div className={styles.nameRow}>
            <span className={styles.userName}>{fullName}</span>
            <span className={styles.roleBadge}>ADMIN</span>
          </div>
          <span className={styles.userEmail}>{email}</span>
          <span className={styles.roleTitle}>{role}</span>
        </div>
      </div>

      {/* Quick Model & Quota Summary */}
      <div className={styles.quickStats}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Active Engine</span>
          <span className={styles.statVal}>BERT v2.4</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Inferences</span>
          <span className={styles.statVal}>1,420</span>
        </div>
      </div>

      {/* Navigation & Action Links */}
      <div className={styles.navGroup}>
        <button
          type="button"
          className={styles.menuItem}
          onClick={() => handleNav('logs')}
        >
          <Activity size={15} className={styles.menuIcon} />
          <div className={styles.menuItemText}>
            <div className={styles.menuItemHead}>
              <span>Live Audit Feed</span>
              <span className={styles.badgeLive}>LIVE</span>
            </div>
            <span className={styles.menuItemSub}>Real-time verified activity logs</span>
          </div>
        </button>

        <button
          type="button"
          className={styles.menuItem}
          onClick={() => handleNav('feedback')}
        >
          <MessageSquareDot size={15} className={styles.menuIcon} />
          <div className={styles.menuItemText}>
            <span>Model Feedback Pipeline</span>
            <span className={styles.menuItemSub}>Answer reviews & retraining queue</span>
          </div>
        </button>

        {onOpenModelDetails && (
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              onOpenModelDetails()
              onClose()
            }}
          >
            <Cpu size={15} className={styles.menuIcon} />
            <div className={styles.menuItemText}>
              <span>BERT Architecture Specs</span>
              <span className={styles.menuItemSub}>deepset/bert-base-cased-squad2</span>
            </div>
          </button>
        )}

        <button
          type="button"
          className={styles.menuItem}
          onClick={() => handleNav('settings')}
        >
          <Settings size={15} className={styles.menuIcon} />
          <div className={styles.menuItemText}>
            <span>Settings & Preferences</span>
            <span className={styles.menuItemSub}>API keys, token parameters</span>
          </div>
        </button>
      </div>

      {/* Footer / Sign Out */}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.signOutBtn}
          onClick={() => {
            onClose()
            if (onSignOut) onSignOut()
          }}
        >
          <LogOut size={14} />
          <span>Sign Out of ContextIQ</span>
        </button>
      </div>
    </div>
  )
}
