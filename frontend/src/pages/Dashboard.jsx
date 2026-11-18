import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import QueryWorkspace from '../components/dashboard/workspace/QueryWorkspace'
import DocumentsView from '../components/dashboard/views/DocumentsView'
import HistoryView from '../components/dashboard/views/HistoryView'
import SavedView from '../components/dashboard/views/SavedView'
import AnalyticsView from '../components/dashboard/views/AnalyticsView'
import PlaygroundView from '../components/dashboard/views/PlaygroundView'
import SettingsView from '../components/dashboard/views/SettingsView'
import FeedbackView from '../components/dashboard/views/FeedbackView'
import AuditLogsView from '../components/dashboard/views/AuditLogsView'
import BulkQAView from '../components/dashboard/views/BulkQAView'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlView = searchParams.get('view')
  const [activeView, setActiveView] = useState(urlView || 'workspace')

  useEffect(() => {
    if (urlView && urlView !== activeView) {
      setActiveView(urlView)
    }
  }, [urlView])

  const handleSelectView = (viewId) => {
    setActiveView(viewId)
    setSearchParams(viewId === 'workspace' ? {} : { view: viewId })
  }

  const [workspaceContext, setWorkspaceContext] = useState('')
  const [workspaceQuestion, setWorkspaceQuestion] = useState('')
  const [toasts, setToasts] = useState([])

  const userKey = user?.email || user?.id || 'guest'

  // Reset workspace state whenever a different user account logs in
  useEffect(() => {
    setWorkspaceContext('')
    setWorkspaceQuestion('')
    setActiveView('workspace')
  }, [userKey])

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    const newToast = { id, ...toast }
    setToasts((prev) => [newToast, ...prev.slice(0, 4)])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 4000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleSignOut = () => {
    signOut()
    navigate('/', { replace: true })
  }

  const handleNewQuery = () => {
    setWorkspaceContext('')
    setWorkspaceQuestion('')
    setActiveView('workspace')
    addToast({
      type: 'info',
      title: 'New Query Session',
      message: 'Workspace reset to blank state.',
    })
  }

  const handleOpenInWorkspace = (ctx, q = '') => {
    setWorkspaceContext(ctx)
    if (q) setWorkspaceQuestion(q)
    setActiveView('workspace')
    addToast({
      type: 'info',
      title: 'Loaded into Workspace',
      message: 'Document and query ready for extraction.',
    })
  }

  return (
    <DashboardLayout
      key={userKey}
      activeView={activeView}
      onSelectView={handleSelectView}
      onNewQuery={handleNewQuery}
      onSignOut={handleSignOut}
      user={user}
      toasts={toasts}
      onDismissToast={dismissToast}
      onAddToast={addToast}
    >
      {activeView === 'workspace' && (
        <QueryWorkspace
          user={user}
          onSelectView={setActiveView}
          onOpenModelDetails={() => {
            // Can be triggered from command palette or topbar
          }}
          onAddToast={addToast}
          initialContext={workspaceContext}
          initialQuestion={workspaceQuestion}
        />
      )}

      {activeView === 'documents' && (
        <DocumentsView
          user={user}
          onOpenInWorkspace={handleOpenInWorkspace}
          onAddToast={addToast}
        />
      )}

      {activeView === 'history' && (
        <HistoryView
          user={user}
          onOpenInWorkspace={handleOpenInWorkspace}
          onAddToast={addToast}
        />
      )}

      {activeView === 'saved' && (
        <SavedView
          user={user}
          onOpenInWorkspace={handleOpenInWorkspace}
          onAddToast={addToast}
        />
      )}

      {activeView === 'analytics'  && <AnalyticsView user={user} />}

      {activeView === 'playground' && <PlaygroundView user={user} onAddToast={addToast} />}

      {activeView === 'bulk'       && <BulkQAView user={user} onAddToast={addToast} />}

      {activeView === 'feedback'   && <FeedbackView user={user} onAddToast={addToast} />}
      {activeView === 'logs'       && <AuditLogsView user={user} onAddToast={addToast} />}

      {activeView === 'settings'   && <SettingsView user={user} onAddToast={addToast} />}
    </DashboardLayout>
  )
}
