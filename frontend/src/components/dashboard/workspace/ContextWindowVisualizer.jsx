import React, { useState, useMemo } from 'react'
import { Database, CheckCircle2, ChevronRight, Eye, Zap, Layers } from 'lucide-react'
import styles from './ContextWindowVisualizer.module.css'

export default function ContextWindowVisualizer({ context = '', result = null }) {
  const [selectedWindowIdx, setSelectedWindowIdx] = useState(null)

  // Chunk text into realistic 384-token sliding context windows
  const windows = useMemo(() => {
    if (!context || !context.trim()) return []

    const words = context.trim().split(/\s+/)
    const chunkSize = 55 // ~70-80 tokens per visual window
    const stride = 35    // overlapping stride

    const chunks = []
    let currentStartWord = 0
    let windowId = 1

    while (currentStartWord < words.length) {
      const currentEndWord = Math.min(words.length, currentStartWord + chunkSize)
      const windowWords = words.slice(currentStartWord, currentEndWord)
      const windowText = windowWords.join(' ')

      // Calculate approximate char range in original context
      const approxCharStart = words.slice(0, currentStartWord).join(' ').length
      const approxCharEnd = approxCharStart + windowText.length

      // Check if result span falls within this window
      const hasAnswerSpan = Boolean(
        result &&
        result.has_answer &&
        result.start >= approxCharStart &&
        result.end <= approxCharEnd + 50
      )

      chunks.push({
        id: windowId,
        label: `WINDOW ${String(windowId).padStart(2, '0')}`,
        text: windowText,
        startWord: currentStartWord,
        endWord: currentEndWord,
        charStart: approxCharStart,
        charEnd: approxCharEnd,
        hasAnswerSpan,
      })

      windowId++
      if (currentEndWord >= words.length) break
      currentStartWord += stride
    }

    return chunks
  }, [context, result])

  if (windows.length === 0) return null

  // Active winning window
  const winningWindow = windows.find((w) => w.hasAnswerSpan) || windows[0]
  const activeWindow = selectedWindowIdx !== null ? windows[selectedWindowIdx] : winningWindow

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <Database size={13} className={styles.headerIcon} />
          </div>
          <div className={styles.titleStack}>
            <span className={styles.headerTitle}>CONTEXT WINDOW VISUALIZER</span>
            <span className={styles.headerSub}>Sliding Document Stride (512 Max Tokens)</span>
          </div>
        </div>

        <div className={styles.windowsBadge}>
          <Layers size={12} />
          <span>{windows.length} Sliding {windows.length === 1 ? 'Window' : 'Windows'}</span>
        </div>
      </div>

      <div className={styles.bodyGrid}>
        {/* Left: Vertical Window Selector Stream */}
        <div className={styles.windowList}>
          {windows.map((win, idx) => {
            const isSelected = activeWindow?.id === win.id
            const isWinning = win.hasAnswerSpan

            return (
              <button
                key={win.id}
                type="button"
                className={`${styles.windowPill} ${
                  isWinning ? styles.windowWinning : ''
                } ${isSelected ? styles.windowSelected : ''}`}
                onClick={() => setSelectedWindowIdx(idx)}
              >
                <div className={styles.pillLeft}>
                  <span className={styles.windowIdText}>{win.label}</span>
                  {isWinning && (
                    <span className={styles.bestMatchTag}>Best Span Match</span>
                  )}
                </div>
                <ChevronRight size={12} className={styles.pillArrow} />
              </button>
            )
          })}
        </div>

        {/* Right: Selected Window Inspector */}
        <div className={styles.windowDetailBox}>
          <div className={styles.detailHeader}>
            <div className={styles.detailTitleGroup}>
              <span className={styles.detailLabel}>{activeWindow.label} INSPECTION</span>
              <span className={styles.detailRange}>
                Words: [{activeWindow.startWord} : {activeWindow.endWord}]
              </span>
            </div>

            {activeWindow.hasAnswerSpan && result && (
              <div className={styles.tokenPointersTag}>
                <span className={styles.pointerTagLabel}>Start Token:</span>
                <code>~{Math.round(result.start / 4)}</code>
                <span className={styles.pointerDivider}>→</span>
                <span className={styles.pointerTagLabel}>End Token:</span>
                <code>~{Math.round(result.end / 4)}</code>
              </div>
            )}
          </div>

          <p className={styles.detailSnippet}>
            {activeWindow.text}
          </p>

          {activeWindow.hasAnswerSpan && result && (
            <div className={styles.resolvedWindowBanner}>
              <CheckCircle2 size={13} className={styles.bannerIconGreen} />
              <span>Optimal BERT Extraction Window · Probability Argmax Selected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
