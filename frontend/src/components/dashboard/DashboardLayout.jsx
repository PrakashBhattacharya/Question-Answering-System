import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CommandPalette from './CommandPalette'
import ModelDetailsModal from './ModelDetailsModal'
import Toast from './Toast'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({
  activeView,
  onSelectView,
  onNewQuery,
  onSignOut,
  user,
  toasts = [],
  onDismissToast,
  onAddToast,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [modelDetailsOpen, setModelDetailsOpen] = useState(false)

  // Global keyboard shortcuts (Ctrl+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={styles.appShell}>
      {/* Ambient atmosphere matching login page reference */}
      <div className={styles.beam} aria-hidden="true" />
      <div className={styles.halo} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />

      {/* Sidebar — fixed, does not scroll */}
      <Sidebar
        activeView={activeView}
        onSelectView={onSelectView}
        onNewQuery={onNewQuery}
        onOpenModelDetails={() => setModelDetailsOpen(true)}
        onSignOut={onSignOut}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        user={user}
      />

      {/* Main Content Area — offset to clear fixed sidebar */}
      <div
        className={`${styles.mainContainer} ${collapsed ? styles.sidebarCollapsed : ''}`}
      >
        {/* Topbar */}
        <Topbar
          activeView={activeView}
          onOpenCommandPalette={() => setPaletteOpen(true)}
          onOpenModelDetails={() => setModelDetailsOpen(true)}
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          user={user}
          onSelectView={onSelectView}
          onSignOut={onSignOut}
        />

        {/* View viewport with smooth view transitions */}
        <main className={styles.viewport}>
          <div key={activeView} className={styles.viewTransition}>
            {children}
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectView={onSelectView}
        onNewQuery={onNewQuery}
        onOpenModelDetails={() => setModelDetailsOpen(true)}
        onSignOut={onSignOut}
      />

      {/* Model Technical Details Modal */}
      <ModelDetailsModal
        isOpen={modelDetailsOpen}
        onClose={() => setModelDetailsOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={onDismissToast} />
    </div>
  )
}
