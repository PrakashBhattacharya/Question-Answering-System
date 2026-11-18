import React, { useState, useMemo } from 'react'
import {
  History, Search, Filter, Copy, Trash2, ArrowUpRight,
  CheckCircle2, AlertCircle, Clock, Check, Sparkles,
  Layers, BarChart2, ShieldCheck, Zap, Plus, Crown,
  Terminal, Flame
} from 'lucide-react'
import { storageService } from '../../../services/storage'
import { soundService } from '../../../services/soundService'
import { useTheme } from '../../../context/ThemeContext'
import styles from './HistoryView.module.css'

const SAMPLE_HISTORIES = [
  {
    question: 'What is the capital and largest city of France?',
    answer: 'Paris',
    score: 0.984,
    has_answer: true,
    context: 'France is a country in Western Europe. Its capital and largest city is Paris, known for the Eiffel Tower and the Louvre museum.',
  },
  {
    question: 'Who discovered the moons of Jupiter in 1610?',
    answer: '',
    score: 0.12,
    has_answer: false,
    context: 'The solar system consists of the Sun and the objects that orbit it, including eight major planets.',
  },
  {
    question: 'What energy does photosynthesis convert into chemical energy?',
    answer: 'light energy',
    score: 0.946,
    has_answer: true,
    context: 'Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel metabolic activities.',
  },
]

export default function HistoryView({ onOpenInWorkspace, onAddToast }) {
  const { theme } = useTheme()
  const [history, setHistory] = useState(() => storageService.getHistory())
  const [filter, setFilter] = useState('all') // 'all' | 'answered' | 'no-answer'
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
      if (soundService?.playClick) soundService.playClick()
      if (onAddToast) {
        onAddToast({
          type: 'success',
          title: 'Answer Copied',
          message: 'Extracted text copied to clipboard.',
        })
      }
    })
  }

  const handleDelete = (id) => {
    const updated = storageService.deleteQuery(id)
    setHistory(updated)
    if (soundService?.playClick) soundService.playClick()
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'Query Removed',
        message: 'Deleted query from your history ledger.',
      })
    }
  }

  const handleClearAll = () => {
    storageService.clearHistory()
    setHistory([])
    if (soundService?.playClick) soundService.playClick()
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'History Cleared',
        message: 'All historical query records have been reset.',
      })
    }
  }

  const handleAddSample = () => {
    const sample = SAMPLE_HISTORIES[Math.floor(Math.random() * SAMPLE_HISTORIES.length)]
    const newEntry = {
      id: `query-sample-${Date.now()}`,
      timestamp: Date.now(),
      question: sample.question,
      answer: sample.answer,
      score: sample.score,
      has_answer: sample.has_answer,
      context: sample.context,
      fullContext: sample.context,
    }
    const updated = storageService.saveQuery(newEntry)
    setHistory(storageService.getHistory())
    if (soundService?.playAnswerSuccess) soundService.playAnswerSuccess()
    if (onAddToast) {
      onAddToast({
        type: 'success',
        title: 'Sample Query Injected',
        message: 'Added demonstration inference to history log.',
      })
    }
  }

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filter === 'answered' && (!item.has_answer || !item.answer)) return false
      if (filter === 'no-answer' && (item.has_answer && item.answer)) return false

      const q = search.toLowerCase().trim()
      if (!q) return true
      return (
        item.question?.toLowerCase().includes(q) ||
        item.answer?.toLowerCase().includes(q) ||
        item.context?.toLowerCase().includes(q)
      )
    })
  }, [history, filter, search])

  // Aggregate telemetry
  const totalCount = history.length
  const answeredCount = history.filter((h) => h.has_answer && h.answer).length
  const abstainedCount = history.filter((h) => !h.has_answer || !h.answer).length
  const avgScore = totalCount > 0
    ? Math.round(
        (history.reduce((acc, h) => acc + (h.score || 0), 0) / totalCount) * 100
      )
    : 92

  /* Theme styling details */
  const themeMeta = {
    imperium: {
      badge: '⚜ ROYAL INFERENCE ARCHIVE & QUERY CHRONICLE ⚜',
      titleHighlight: 'Imperial History Log',
      sub: 'Chronicle of past queries, royal answer spans, and confidence distributions.',
      icon: Crown,
    },
    pixelcraft: {
      badge: '▣ RETRO QUERY RUNNER LOG ▣',
      titleHighlight: 'Inference Archive',
      sub: 'Historical neural evaluations stored block by block in local memory.',
      icon: Zap,
    },
    void: {
      badge: '[ DEV_IO :: QUERY_INFERENCE_LEDGER ]',
      titleHighlight: 'Telemetry Ledger',
      sub: 'Audit log of past PyTorch BERT inferences, token indices, and span scores.',
      icon: Terminal,
    },
    cloud: {
      badge: 'ENTERPRISE INFERENCE AUDIT TRAIL',
      titleHighlight: 'Query History',
      sub: 'Review and reload past BERT inferences, extracted spans, and prediction confidence.',
      icon: ShieldCheck,
    },
    ember: {
      badge: 'WARM INTELLIGENCE INQUIRY RECORD',
      titleHighlight: 'Reading Ledger',
      sub: 'A chronological journal of contextual inquiries and answered passages.',
      icon: Flame,
    },
    original: {
      badge: 'BERT INFERENCE CHRONICLE · LOCAL LEDGER',
      titleHighlight: 'Query History',
      sub: 'Review and reload past BERT inferences, extracted spans, and prediction confidence.',
      icon: History,
    },
  }[theme] || {
    badge: 'BERT INFERENCE CHRONICLE · LOCAL LEDGER',
    titleHighlight: 'Query History',
    sub: 'Review and reload past BERT inferences, extracted spans, and prediction confidence.',
    icon: History,
  }

  const ThemeIcon = themeMeta.icon

  return (
    <div className={styles.container}>
      {/* ── Executive Header ────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.eyebrow}>
            <span className={styles.statusPulseDot} />
            <ThemeIcon size={13} className={styles.eyebrowIcon} />
            <span>{themeMeta.badge}</span>
          </div>
          <h1 className={styles.title}>
            Query <span className={styles.gradientText}>{themeMeta.titleHighlight}</span>
          </h1>
          <p className={styles.subTitle}>{themeMeta.sub}</p>
        </div>

        <div className={styles.headerBtnGroup}>
          <button
            type="button"
            className={styles.sampleBtn}
            onClick={handleAddSample}
          >
            <Plus size={14} />
            <span>Inject Sample Query</span>
          </button>

          {history.length > 0 && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClearAll}
            >
              Clear Entire History
            </button>
          )}
        </div>
      </div>

      {/* ── Telemetry Quickstrip (Always Visible) ────────────────── */}
      <div className={styles.telemetryStrip}>
        <div className={styles.telemetryItem}>
          <History size={14} className={styles.telemetryIcon} />
          <span className={styles.telemetryLabel}>Total Queries:</span>
          <span className={styles.telemetryValue}>{totalCount}</span>
        </div>
        <div className={styles.telemetryDivider}>•</div>
        <div className={styles.telemetryItem}>
          <CheckCircle2 size={14} className={styles.telemetryIconGreen} />
          <span className={styles.telemetryLabel}>Answered Spans:</span>
          <span className={styles.telemetryValueGreen}>{answeredCount}</span>
        </div>
        <div className={styles.telemetryDivider}>•</div>
        <div className={styles.telemetryItem}>
          <AlertCircle size={14} className={styles.telemetryIconAmber} />
          <span className={styles.telemetryLabel}>Abstentions / Null:</span>
          <span className={styles.telemetryValue}>{abstainedCount}</span>
        </div>
        <div className={styles.telemetryDivider}>•</div>
        <div className={styles.telemetryItem}>
          <BarChart2 size={14} className={styles.telemetryIcon} />
          <span className={styles.telemetryLabel}>Avg Confidence:</span>
          <span className={styles.telemetryValue}>{avgScore}%</span>
        </div>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────────── */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search questions, extracted answers, or source context…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.pillGroup}>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'all' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All Queries ({totalCount})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'answered' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('answered')}
          >
            Answered ({answeredCount})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${filter === 'no-answer' ? styles.filterPillActive : ''}`}
            onClick={() => setFilter('no-answer')}
          >
            No Answer ({abstainedCount})
          </button>
        </div>

        <span className={styles.recordCount}>
          {filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* ── Query History Cards List ─────────────────────────────── */}
      {filteredHistory.length === 0 ? (
        <div className={styles.emptyWrap}>
          <div className={styles.emptyIconPulse}>
            <History size={34} strokeWidth={1.5} className={styles.emptyIcon} />
          </div>
          <h3 className={styles.emptyTitle}>No Queries in History</h3>
          <p className={styles.emptyDesc}>
            {search || filter !== 'all'
              ? 'No historical queries match your active filter.'
              : 'Run your first BERT extractive inference in the workspace to build your history log.'}
          </p>
          <div className={styles.emptyActionRow}>
            <button
              type="button"
              className={styles.emptySampleBtn}
              onClick={handleAddSample}
            >
              <Plus size={14} />
              <span>Inject Sample Query</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredHistory.map((item) => {
            const hasAns = item.has_answer && item.answer
            const scorePct = Math.round((item.score || 0) * 100)
            const dateStr = new Date(item.timestamp || Date.now()).toLocaleString()

            return (
              <div
                key={item.id}
                className={`${styles.card} ${hasAns ? styles.cardAnswered : styles.cardNoAns}`}
              >
                <div className={styles.cardTop}>
                  <div className={styles.statusPillWrap}>
                    {hasAns ? (
                      <span className={styles.statusAnswered}>
                        <CheckCircle2 size={12} />
                        Answered • {scorePct}% Confidence
                      </span>
                    ) : (
                      <span className={styles.statusNoAns}>
                        <AlertCircle size={12} />
                        Abstention • No Supported Answer
                      </span>
                    )}
                  </div>

                  <div className={styles.timeTag}>
                    <Clock size={12} />
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div className={styles.qSection}>
                  <span className={styles.qLabel}>Q:</span>
                  <h3 className={styles.qText}>{item.question}</h3>
                </div>

                {hasAns && (
                  <div className={styles.ansSection}>
                    <span className={styles.ansLabel}>A:</span>
                    <div className={styles.ansPill}>
                      <span className={styles.ansText}>{item.answer}</span>
                    </div>
                  </div>
                )}

                <div className={styles.contextSnippet}>
                  <span className={styles.snippetLabel}>Source Context Passage:</span>
                  <p className={styles.snippetText}>{item.context || item.fullContext}</p>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.openBtn}
                    onClick={() => {
                      if (soundService?.playClick) soundService.playClick()
                      onOpenInWorkspace(item.fullContext || item.context, item.question)
                    }}
                    title="Open this context and question in the main workspace"
                  >
                    <span>Open in Workspace</span>
                    <ArrowUpRight size={13} />
                  </button>

                  {hasAns && (
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => handleCopy(item.id, item.answer)}
                      title="Copy extracted answer"
                    >
                      {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy Answer'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item.id)}
                    title="Delete query record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
