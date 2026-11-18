import React, { useState, useEffect } from 'react'
import {
  ShieldCheck, Cpu, Sparkles, FileText, Bookmark,
  Lock, CheckCircle2, Trash2, Download, Search,
  PlusCircle, Activity, Clock
} from 'lucide-react'
import { storageService } from '../../../services/storage'
import styles from './AuditLogsView.module.css'

export default function AuditLogsView({ onAddToast }) {
  const [logs, setLogs] = useState([])
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)

  const loadLogs = () => {
    setLogs(storageService.getAuditLogs())
  }

  useEffect(() => {
    loadLogs()
    // Periodic refresh
    const interval = setInterval(loadLogs, 3500)
    return () => clearInterval(interval)
  }, [])

  const handleClear = () => {
    if (window.confirm('Clear all audit feed records?')) {
      storageService.clearAuditLogs()
      setLogs([])
      if (onAddToast) {
        onAddToast({
          type: 'info',
          title: 'Audit Feed Reset',
          message: 'All local audit trail records have been cleared.',
        })
      }
    }
  }

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', `contextiq_audit_feed_${Date.now()}.json`)
    dlAnchor.click()
    if (onAddToast) {
      onAddToast({
        type: 'success',
        title: 'Audit Feed Exported',
        message: `Exported ${logs.length} audit trail records to JSON.`,
      })
    }
  }

  const handleSimulateEvent = () => {
    setIsSimulating(true)
    setTimeout(() => {
      const mockEvents = [
        {
          category: 'qa',
          iconType: 'sparkles-cyan',
          title: 'BERT Inference Executed',
          detail: `Question: "Who commanded the mission?" • Extracted "Neil Armstrong" [98.7% confidence] • 215ms latency`,
          status: 'Score: 98.7%',
        },
        {
          category: 'model',
          iconType: 'cpu-indigo',
          title: 'Model Fine-Tuning Batch Queued',
          detail: `New answer correction paired with context buffer — queued for next checkpoint iteration`,
          status: 'In Queue',
        },
        {
          category: 'context',
          iconType: 'file-emerald',
          title: 'Context Passage Ingested',
          detail: `Document "quantum_computing_overview.txt" tokenized into 210 WordPiece subwords`,
          status: 'Tokenized',
        },
        {
          category: 'model',
          iconType: 'shield-purple',
          title: 'SQuAD 2.0 Weights Verified',
          detail: `PyTorch runtime validated 110M BERT-base parameters in active device memory`,
          status: 'Operational',
        },
        {
          category: 'qa',
          iconType: 'bookmark-amber',
          title: 'Answer Span Bookmarked',
          detail: `Extracted span verified and saved to user bookmarks repository`,
          status: 'Saved',
        },
      ]
      const chosen = mockEvents[Math.floor(Math.random() * mockEvents.length)]
      const created = storageService.addAuditLog(chosen)
      loadLogs()
      setIsSimulating(false)
      if (onAddToast) {
        onAddToast({
          type: 'info',
          title: 'Audit Event Logged',
          message: `${created.title} recorded to cryptographic feed.`,
        })
      }
    }, 350)
  }

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchCat = filterCategory === 'all' || log.category === filterCategory
    const matchSearch =
      !searchQuery.trim() ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.time.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  // Render icon based on iconType
  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'sparkles-cyan':
        return (
          <div className={`${styles.iconWrap} ${styles.iconCyan}`}>
            <Sparkles size={16} />
          </div>
        )
      case 'cpu-indigo':
        return (
          <div className={`${styles.iconWrap} ${styles.iconIndigo}`}>
            <Cpu size={16} />
          </div>
        )
      case 'file-emerald':
        return (
          <div className={`${styles.iconWrap} ${styles.iconEmerald}`}>
            <FileText size={16} />
          </div>
        )
      case 'shield-purple':
        return (
          <div className={`${styles.iconWrap} ${styles.iconPurple}`}>
            <ShieldCheck size={16} />
          </div>
        )
      case 'bookmark-amber':
        return (
          <div className={`${styles.iconWrap} ${styles.iconAmber}`}>
            <Bookmark size={16} />
          </div>
        )
      case 'lock-slate':
      default:
        return (
          <div className={`${styles.iconWrap} ${styles.iconSlate}`}>
            <Lock size={16} />
          </div>
        )
    }
  }

  return (
    <div className={styles.container}>
      {/* Top Header Card */}
      <div className={styles.auditCardContainer}>
        <div className={styles.cardHeader}>
          <div className={styles.titleGroup}>
            <div className={styles.headerIconWrap}>
              <Activity size={22} className={styles.pulseIcon} />
            </div>
            <div className={styles.headerTextWrap}>
              <h1 className={styles.mainTitle}>Live Audit Feed</h1>
              <p className={styles.mainSubtitle}>
                Real-time, cryptographically verified audit trail of BERT inference runs, SQuAD 2.0 weight evaluations, context tokenization, and retraining submissions.
              </p>
            </div>
          </div>

          <div className={styles.badgeGroup}>
            <span className={styles.secureBadge}>
              <span className={styles.secureDot} />
              SECURE
            </span>
            <span className={styles.streamBadge}>
              <span className={styles.liveIndicator} />
              LIVE
            </span>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search audit trail by question, span, or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCategory === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              All Events ({logs.length})
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCategory === 'qa' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory('qa')}
            >
              Inferences & QA
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCategory === 'model' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory('model')}
            >
              Model & Weights
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCategory === 'context' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory('context')}
            >
              Context Ingestion
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterCategory === 'security' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory('security')}
            >
              Auth & Security
            </button>
          </div>

          <div className={styles.toolActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleSimulateEvent}
              disabled={isSimulating}
              title="Simulate a new incoming audit event"
            >
              <PlusCircle size={14} />
              <span>Simulate</span>
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleExport}
              title="Export feed to JSON"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              onClick={handleClear}
              title="Clear all logs"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Audit Log Feed List */}
        <div className={styles.feedList}>
          {filteredLogs.length === 0 ? (
            <div className={styles.emptyState}>
              <ShieldCheck size={36} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No matching audit entries found</h3>
              <p className={styles.emptyText}>
                No log records match your current filter. Clear search or trigger a new BERT query.
              </p>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => {
                  setFilterCategory('all')
                  setSearchQuery('')
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredLogs.map((item) => (
              <div key={item.id} className={styles.feedRow}>
                {renderIcon(item.iconType)}
                <div className={styles.feedContent}>
                  <div className={styles.feedTitle}>{item.title}</div>
                  <div className={styles.feedDetail}>
                    <span>{item.detail}</span>
                    <span className={styles.detailSep}>•</span>
                    <span className={styles.feedTime}>{item.time}</span>
                  </div>
                </div>
                {item.status && (
                  <div className={styles.statusTag}>
                    {item.status}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
