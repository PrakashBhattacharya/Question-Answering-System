import React, { useState, useEffect } from 'react'
import {
  Search, Bell, ChevronRight, Menu, CheckCircle2,
  AlertCircle, Sparkles, User, ExternalLink, ShieldCheck, ChevronDown
} from 'lucide-react'
import { systemApi } from '../../services/api'
import UserDropdownMenu from './UserDropdownMenu'
import ThemeSelector from '../ui/ThemeSelector'
import AudioToggle from '../ui/AudioToggle'
import styles from './Topbar.module.css'

export default function Topbar({
  activeView,
  onOpenCommandPalette,
  onOpenModelDetails,
  onToggleMobileSidebar,
  user,
  onSelectView,
  onSignOut,
}) {
  const [modelStatus, setModelStatus] = useState('checking')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  // Live health check on mount and interval
  useEffect(() => {
    let mounted = true
    const checkHealth = async () => {
      try {
        const res = await systemApi.health()
        if (mounted) {
          setModelStatus(res?.status === 'ok' ? 'operational' : 'degraded')
        }
      } catch {
        if (mounted) setModelStatus('offline')
      }
    }

    checkHealth()
    const timer = setInterval(checkHealth, 30000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const viewLabels = {
    workspace: 'Question Answering Workspace',
    documents: 'Document Repository',
    history: 'Query History',
    saved: 'Saved Answers',
    analytics: 'Performance & Benchmarks',
    playground: 'FastAPI Playground',
    feedback: 'Model Feedback & Retraining Pipeline',
    logs: 'Live Audit Feed',
    settings: 'Settings & Preferences',
  }

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'
  const userInitials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className={styles.topbar}>
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <span className={styles.crumbRoot}>ContextIQ</span>
          <ChevronRight size={12} className={styles.crumbSep} />
          <span className={styles.crumbCurrent}>{viewLabels[activeView] || 'Workspace'}</span>
        </nav>
      </div>

      {/* Right: Search trigger, Status, Notifications, Profile */}
      <div className={styles.rightSection}>
        {/* Command palette search trigger */}
        <button
          type="button"
          className={styles.searchTrigger}
          onClick={onOpenCommandPalette}
          title="Open Command Palette (Ctrl + K)"
        >
          <Search size={13} className={styles.searchIcon} />
          <span className={styles.searchText}>Search or press</span>
          <kbd className={styles.searchKbd}>Ctrl K</kbd>
        </button>

        {/* Dynamic Model Status 3D Core Badge */}
        <button
          type="button"
          className={`${styles.statusBadge} ${
            modelStatus === 'operational'
              ? styles.statusOk
              : modelStatus === 'checking'
              ? styles.statusChecking
              : styles.statusError
          }`}
          onClick={onOpenModelDetails}
          title="Click to view BERT SQuAD 2.0 configuration"
        >
          <div className={styles.miniCoreWidget}>
            <span className={styles.miniCoreRing} />
            <span className={styles.statusDot} />
          </div>
          <span className={styles.statusLabel}>
            {modelStatus === 'operational'
              ? 'MODEL READY'
              : modelStatus === 'checking'
              ? 'CHECKING ENGINE'
              : 'MODEL OFFLINE'}
          </span>
        </button>

        {/* Theme Selector & Sound Toggle */}
        <ThemeSelector />
        <AudioToggle />

        {/* Notifications */}
        <div className={styles.notifWrapper}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View system notifications"
          >
            <Bell size={15} />
            <span className={styles.notifDot} />
          </button>

          {notificationsOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>System Notifications</span>
                <span className={styles.notifCount}>1 new</span>
              </div>
              <div className={styles.notifList}>
                <div className={styles.notifItem}>
                  <div className={styles.notifIconWrap}>
                    <ShieldCheck size={14} />
                  </div>
                  <div className={styles.notifText}>
                    <div className={styles.notifItemTitle}>SQuAD 2.0 Checkpoint Active</div>
                    <div className={styles.notifItemDesc}>
                      FastAPI server verified deepset/bert-base-cased-squad2 weights in memory.
                    </div>
                    <div className={styles.notifTime}>Just now</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User avatar pill with Dropdown */}
        <div
          className={`${styles.userPill} ${userDropdownOpen ? styles.userPillActive : ''}`}
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          title="Click to view user profile and account options"
          aria-haspopup="true"
          aria-expanded={userDropdownOpen}
        >
          <div className={styles.avatar}>{userInitials}</div>
          <span className={styles.userName}>{firstName}</span>
          <ChevronDown
            size={13}
            className={`${styles.userChevron} ${userDropdownOpen ? styles.userChevronOpen : ''}`}
          />

          <UserDropdownMenu
            isOpen={userDropdownOpen}
            onClose={() => setUserDropdownOpen(false)}
            user={user}
            onSelectView={onSelectView}
            onOpenModelDetails={onOpenModelDetails}
            onSignOut={onSignOut}
            position="bottom"
          />
        </div>
      </div>
    </header>
  )
}
