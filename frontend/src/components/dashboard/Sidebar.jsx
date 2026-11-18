import React, { useState } from 'react'
import {
  LayoutDashboard, FileText, History, Bookmark,
  BarChart3, Code2, Settings, HelpCircle, LogOut,
  ChevronLeft, ChevronRight, Plus, MessageSquareDot,
  Activity, Sparkles, Shield, ListChecks
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import UserDropdownMenu from './UserDropdownMenu'
import styles from './Sidebar.module.css'

export default function Sidebar({
  activeView,
  onSelectView,
  onNewQuery,
  onOpenModelDetails,
  onSignOut,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  user,
}) {
  const { theme } = useTheme()
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const isImperium = theme === 'imperium'

  const navGroups = [
    {
      group: isImperium ? 'INTELLIGENCE' : 'WORKSPACE',
      items: [
        { id: 'workspace',  label: 'Dashboard',      icon: LayoutDashboard, badge: null },
        { id: 'documents',  label: 'Documents',      icon: FileText,       badge: null },
        { id: 'history',    label: 'History',        icon: History,        badge: null },
        { id: 'saved',      label: 'Saved',          icon: Bookmark,       badge: null },
      ],
    },
    {
      group: isImperium ? 'ANALYSIS' : 'INTELLIGENCE & DEV',
      items: [
        { id: 'analytics',  label: 'Analytics',      icon: BarChart3,      badge: null },
        { id: 'playground', label: 'API Playground', icon: Code2,          badge: isImperium ? 'ROYAL' : 'REST' },
        { id: 'bulk',       label: 'Bulk Q&A',       icon: ListChecks,     badge: 'NEW' },
        { id: 'feedback',   label: isImperium ? 'Evaluation' : 'Model Feedback', icon: MessageSquareDot,badge: isImperium ? 'SQuAD' : 'NEW' },
      ],
    },
    {
      group: isImperium ? 'SYSTEM' : 'PLATFORM',
      items: [
        { id: 'logs',       label: isImperium ? 'Audit Ledger' : 'Live Audit Feed', icon: Activity, badge: isImperium ? 'SECURE' : 'SECURE' },
        { id: 'settings',   label: 'Settings',       icon: Settings,       badge: null },
      ],
    },
  ]

  const userName  = user?.full_name || (user?.email ? user.email.split('@')[0] : 'User')
  const userEmail = user?.email     || 'user@contextiq.ai'
  const userInitials = (userName || 'U')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const handleNavClick = (viewId) => {
    onSelectView(viewId)
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${
          mobileOpen ? styles.sidebarMobileOpen : ''
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Ambient sidebar glow */}
        <div className={styles.sidebarAmbientGlow} />

        {/* Brand header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>
            <div className={styles.logoMark}>
              <div className={styles.logoPulseHalo} />
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="url(#sb-g)" strokeWidth="1.25" />
                <path d="M7 10h6M10 7v6" stroke="url(#sb-g2)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="10" r="2" fill="#5e6ad2" />
                <defs>
                  <linearGradient id="sb-g" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="sb-g2" x1="7" y1="7" x2="13" y2="13" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {!collapsed && (
              <div className={styles.brandTextWrap}>
                <span className={styles.brandName}>CONTEXTIQ</span>
                <span className={styles.brandTag}>
                  <span className={styles.brandDot} />
                  BERT SQuAD 2.0
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            className={styles.collapseToggle}
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* High-Tech "+ New Query" CTA button */}
        <div className={styles.newQueryWrap}>
          <button
            type="button"
            className={styles.newQueryBtn}
            onClick={() => {
              onNewQuery()
              if (onCloseMobile) onCloseMobile()
            }}
            title="Start a new question answering query"
          >
            <div className={styles.newQueryGlow} />
            <div className={styles.newQueryContent}>
              <Plus size={15} className={styles.plusIcon} />
              {!collapsed && (
                <>
                  <span className={styles.newQueryLabel}>
                    {theme === 'pixelcraft' ? '[ ? New Query ]' : 'New Query'}
                  </span>
                  <span className={styles.newQueryKey}>⌘N</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Main navigation grouped */}
        <nav className={styles.navSection}>
          {navGroups.map((grp, gIdx) => (
            <div key={gIdx} className={styles.navGroup}>
              {!collapsed && (
                <div className={styles.groupHeader}>{grp.group}</div>
              )}
              <div className={styles.navList}>
                {grp.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id

                  const pixelcraftPrefix = {
                    workspace: '▣ ',
                    documents: '▤ ',
                    history: '◈ ',
                    saved: '★ ',
                    analytics: '▲ ',
                    playground: '❖ ',
                    feedback: '✉ ',
                    logs: '⚡ ',
                    settings: '⚙ ',
                  }[item.id] || ''

                  const labelText = theme === 'pixelcraft' ? `${pixelcraftPrefix}${item.label}` : item.label

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                      onClick={() => handleNavClick(item.id)}
                      title={collapsed ? item.label : undefined}
                    >
                      {isActive && <span className={styles.activeGlowLine} />}
                      <Icon size={16} className={styles.navIcon} />
                      {!collapsed && (
                        <span className={styles.navLabel}>{labelText}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span
                          className={`${styles.navBadge} ${
                            item.badge === 'NEW'
                              ? styles.navBadgeNew
                              : item.badge === 'SECURE'
                              ? styles.navBadgeSecure
                              : styles.navBadgeRest
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section: Help, Profile, Logout */}
        <div className={styles.bottomSection}>
          <button
            type="button"
            className={styles.bottomItem}
            onClick={onOpenModelDetails}
            title="Model specs and architecture details"
          >
            <HelpCircle size={15} className={styles.bottomIcon} />
            {!collapsed && <span>Model Info & Help</span>}
          </button>

          {/* User profile tile with Dropdown */}
          <div
            className={`${styles.profileRow} ${userDropdownOpen ? styles.profileRowActive : ''}`}
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            title="Click to view user profile & details"
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={userDropdownOpen}
          >
            <div className={styles.avatarWrap}>
              <div className={styles.userAvatar}>{userInitials}</div>
              <span className={styles.avatarOnlineDot} />
            </div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <div className={styles.userNameRow}>
                  <span className={styles.userDisplayName}>{userName}</span>
                  <span className={styles.proBadge}>PRO</span>
                </div>
                <span className={styles.userEmailText}>{userEmail}</span>
              </div>
            )}

            <UserDropdownMenu
              isOpen={userDropdownOpen}
              onClose={() => setUserDropdownOpen(false)}
              user={user}
              onSelectView={onSelectView}
              onOpenModelDetails={onOpenModelDetails}
              onSignOut={onSignOut}
              position="top"
            />
          </div>

          {/* Sign out */}
          <button
            type="button"
            className={`${styles.bottomItem} ${styles.logoutItem}`}
            onClick={onSignOut}
            title="Sign out of your account"
          >
            <LogOut size={14} className={styles.bottomIcon} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
