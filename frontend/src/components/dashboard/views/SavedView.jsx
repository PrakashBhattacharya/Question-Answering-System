import React, { useState } from 'react'
import {
  Bookmark, Copy, Trash2, ArrowUpRight, Clock, Check,
  Sparkles, Target, ShieldCheck, Quote
} from 'lucide-react'
import { storageService } from '../../../services/storage'
import styles from './SavedView.module.css'

export default function SavedView({ onOpenInWorkspace, onAddToast }) {
  const [saved, setSaved] = useState(() => storageService.getSaved())
  const [copiedId, setCopiedId] = useState(null)

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
      if (onAddToast) {
        onAddToast({
          type: 'success',
          title: 'Copied',
          message: 'Saved answer copied to clipboard.',
        })
      }
    })
  }

  const handleDelete = (id) => {
    const updated = storageService.removeSaved(id)
    setSaved(updated)
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'Bookmark Removed',
        message: 'Answer removed from saved collection.',
      })
    }
  }

  return (
    <div className={styles.container}>
      {/* ── Executive Header ────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.eyebrow}>
            <span className={styles.statusPulseDot} />
            <span>Extractive Knowledge Archive · Verified Spans</span>
          </div>
          <h1 className={styles.title}>
            Saved <span className={styles.gradientText}>Answers</span>
          </h1>
          <p className={styles.subTitle}>
            Bookmarked extractions, ground-truth proofs, and confidence scores for future reference.
          </p>
        </div>

        <span className={styles.countBadge}>
          {saved.length} {saved.length === 1 ? 'saved extraction' : 'saved extractions'}
        </span>
      </div>

      {saved.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Bookmark size={32} strokeWidth={1.2} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No saved answers yet</h3>
          <p className={styles.emptyDesc}>
            Click the "Save" button on any extracted answer in the workspace to store it here.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {saved.map((item) => {
            const dateStr = new Date(item.savedAt).toLocaleDateString()
            const scorePct = Math.round((item.score || 0) * 100)

            return (
              <div key={item.id} className={styles.gemCard}>
                {/* 3D Embossed Quote Watermark */}
                <div className={styles.quoteWatermark} aria-hidden="true">
                  <Quote size={88} />
                </div>

                {/* Top Row: Score & Date Badges */}
                <div className={styles.cardTop}>
                  <div className={styles.scoreBadge}>
                    <Sparkles size={11} />
                    <span>{scorePct}% Confidence</span>
                  </div>

                  <div className={styles.sealBadge}>
                    <ShieldCheck size={12} className={styles.sealIcon} />
                    <span>Ground Truth</span>
                  </div>

                  <div className={styles.dateBadge}>
                    <Clock size={11} />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {/* Question */}
                <div className={styles.qWrap}>
                  <span className={styles.qLabel}>Question Query</span>
                  <h3 className={styles.qText}>{item.question}</h3>
                </div>

                {/* Extracted Answer */}
                <div className={styles.ansWrap}>
                  <span className={styles.ansLabel}>Exact Extracted Span</span>
                  <div className={styles.ansBox}>
                    <span className={styles.ansText}>{item.answer}</span>
                  </div>
                </div>

                {/* Ground Truth Context Proof */}
                {item.fullContext && (
                  <div className={styles.evidenceBox}>
                    <span className={styles.evidenceLabel}>Contiguous Reference Snippet</span>
                    <p className={styles.evidenceSnippet}>
                      {item.contextSnippet || item.fullContext.slice(0, 200)}...
                    </p>
                  </div>
                )}

                {/* Precision Score Progress */}
                <div className={styles.scoreTrackWrap}>
                  <div className={styles.scoreTrack}>
                    <div
                      className={styles.scoreFill}
                      style={{ width: `${Math.min(100, scorePct)}%` }}
                    />
                  </div>
                </div>

                {/* Card Actions */}
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.openBtn}
                    onClick={() => onOpenInWorkspace(item.fullContext || item.contextSnippet, item.question)}
                  >
                    <span>Inspect in Workspace</span>
                    <ArrowUpRight size={13} />
                  </button>

                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => handleCopy(item.id, item.answer)}
                    title="Copy answer"
                  >
                    {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item.id)}
                    title="Remove from saved"
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
