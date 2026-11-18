import React, { useState } from 'react'
import {
  History, ArrowUpRight, Copy, Trash2, Clock,
  MessageSquare, Sparkles, Check, ChevronDown, ChevronUp, FileText
} from 'lucide-react'
import styles from './RecentQueries.module.css'

function formatRelativeTime(isoString) {
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  } catch {
    return 'Recently'
  }
}

export default function RecentQueries({
  queries = [],
  onLoadQuery,
  onCopy,
  onDeleteQuery,
  onClearAll,
}) {
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const handleCopy = (id, text) => {
    onCopy(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className={styles.container}>
      {/* ── Timeline Header ───────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <History size={14} className={styles.headerIcon} />
          </div>
          <div>
            <h3 className={styles.title}>Research Activity Timeline</h3>
            <span className={styles.subTitle}>Sequential Inference Log & Answers</span>
          </div>
          {queries.length > 0 && (
            <span className={styles.countBadge}>{queries.length}</span>
          )}
        </div>

        {queries.length > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClearAll}
          >
            Clear History
          </button>
        )}
      </div>

      {queries.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <MessageSquare size={22} strokeWidth={1.4} />
          </div>
          <h4 className={styles.emptyTitle}>No research queries yet</h4>
          <p className={styles.emptyDesc}>
            Your queries will automatically form an interactive activity timeline as you run inference.
          </p>
        </div>
      ) : (
        /* ── Vertical Animated Timeline ───────────────────────── */
        <div className={styles.timelineList}>
          {queries.map((q, idx) => {
            const scorePct = Math.round((q.score || 0) * 100)
            const hasAns = q.has_answer && q.answer
            const isExpanded = expandedId === q.id
            const isLast = idx === queries.length - 1

            return (
              <div
                key={q.id}
                className={`${styles.timelineNode} ${isExpanded ? styles.timelineNodeExpanded : ''}`}
              >
                {/* Vertical Stem Line & Pulsing Bullet */}
                <div className={styles.stemRail}>
                  <div className={`${styles.nodeDot} ${hasAns ? styles.nodeDotAnswered : styles.nodeDotNoAnswer}`}>
                    <span className={styles.dotCore} />
                  </div>
                  {!isLast && <div className={styles.stemLine} />}
                </div>

                {/* Timeline Card Content */}
                <div
                  className={styles.nodeCard}
                  onClick={() => toggleExpand(q.id)}
                >
                  <div className={styles.nodeHeaderRow}>
                    <div className={styles.nodeQuestionWrap}>
                      <span className={styles.nodeTime}>{formatRelativeTime(q.timestamp)}</span>
                      <h4 className={styles.nodeQuestion}>{q.question}</h4>
                    </div>

                    <div className={styles.nodeMetaBadges}>
                      <span className={styles.scorePill}>
                        {hasAns ? `${scorePct}% Confidence` : 'Abstained'}
                      </span>
                      <div className={styles.expandChevron}>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Answer & Proof Preview */}
                  {isExpanded && (
                    <div className={styles.expandedContent} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.answerBox}>
                        <span className={styles.answerLabel}>Resolved Span:</span>
                        <p className={styles.answerText}>
                          {hasAns ? `"${q.answer}"` : 'No contiguous span verified with sufficient threshold.'}
                        </p>
                      </div>

                      {q.context && (
                        <div className={styles.contextSnippet}>
                          <FileText size={11} className={styles.docIcon} />
                          <span>{q.context.slice(0, 140)}...</span>
                        </div>
                      )}

                      <div className={styles.cardActionsRow}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => onLoadQuery(q)}
                        >
                          <ArrowUpRight size={13} />
                          <span>Load in Workspace</span>
                        </button>

                        {hasAns && (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleCopy(q.id, q.answer)}
                          >
                            {copiedId === q.id ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copiedId === q.id ? 'Copied' : 'Copy Span'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => onDeleteQuery(q.id)}
                          title="Delete from timeline"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
