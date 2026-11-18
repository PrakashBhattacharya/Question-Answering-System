import React, { useState } from 'react'
import { FileText, Loader2, Sparkles, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import styles from './SummarizeCard.module.css'

export default function SummarizeCard({ onSummarize, loading, summary }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const handleCopy = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary.summary).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <FileText size={14} className={styles.icon} />
          </div>
          <div>
            <h3 className={styles.title}>TL;DR Summarizer</h3>
            <p className={styles.desc}>Generate a concise summary of your context using BART</p>
          </div>
        </div>
        <div className={styles.actions}>
          {summary && (
            <button type="button" className={styles.toggleBtn} onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button
            type="button"
            className={styles.summarizeBtn}
            onClick={onSummarize}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={13} className={styles.spin} />
                <span>Summarizing…</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>{summary ? 'Re-summarize' : 'Summarize'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {summary && expanded && (
        <div className={styles.summaryBody}>
          <div className={styles.summaryText}>
            <span className={styles.quoteMark}>"</span>
            {summary.summary}
            <span className={styles.quoteMark}>"</span>
          </div>
          <div className={styles.footer}>
            <div className={styles.stats}>
              <span className={styles.stat}>
                <span className={styles.statVal}>{summary.original_length}</span> words →{' '}
                <span className={styles.statVal}>{summary.summary_length}</span> words
              </span>
              <span className={styles.stat}>
                <span className={styles.statVal}>{Math.round(summary.compression_ratio * 100)}%</span> compression
              </span>
            </div>
            <button type="button" className={styles.copyBtn} onClick={handleCopy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
