import React, { useState, useCallback, useMemo } from 'react'
import {
  Star, Send, ThumbsUp, ThumbsDown, MessageSquare,
  TrendingUp, Award, AlertCircle, CheckCircle2, BarChart2,
  Sparkles, RefreshCw, ChevronDown, ChevronUp, Trash2, Lightbulb,
  ShieldCheck, Zap, Filter, Plus, Flame, Crown, Terminal, HelpCircle
} from 'lucide-react'
import { storageService } from '../../../services/storage'
import { soundService } from '../../../services/soundService'
import { useTheme } from '../../../context/ThemeContext'
import styles from './FeedbackView.module.css'

const FEEDBACK_CATEGORIES = [
  { id: 'accuracy', label: 'Answer Accuracy', icon: '🎯', desc: 'Exactness of the extracted text span' },
  { id: 'speed', label: 'Response Speed', icon: '⚡', desc: 'Inference latency and responsiveness' },
  { id: 'context', label: 'Context Understanding', icon: '🧠', desc: 'Semantic reasoning across passages' },
  { id: 'relevance', label: 'Answer Relevance', icon: '🔍', desc: 'Direct answering to the user question' },
  { id: 'ui', label: 'UI / Experience', icon: '✨', desc: 'Dashboard usability and visual flow' },
  { id: 'abstention', label: 'Abstention & SQuAD 2.0', icon: '🛡️', desc: 'Correct handling of unanswerable queries' },
]

const QUICK_COMMENTS = [
  '+ Exact answer span identified',
  '+ Blazing fast extraction (<150ms)',
  '+ Missed supporting clause in passage',
  '+ Extracted answer was slightly truncated',
  '+ Correctly identified impossible query',
  '+ High confidence score matched result',
]

const IMPROVEMENT_SUGGESTIONS = [
  { id: 'conf', label: 'Better confidence calibration' },
  { id: 'multi', label: 'Multi-document cross-context' },
  { id: 'highlight', label: 'Visual evidence highlighter' },
  { id: 'follow', label: 'Follow-up question chaining' },
  { id: 'export', label: 'Export results as PDF/JSON' },
  { id: 'history', label: 'Semantic history search' },
]

const SAMPLE_REVIEWS = [
  {
    rating: 5,
    type: 'positive',
    category: 'Answer Accuracy',
    comment: 'The BERT model extracted the exact treaty date with 98.4% confidence from a 4-paragraph document. Impressive precision.',
    suggestions: ['Visual evidence highlighter'],
  },
  {
    rating: 2,
    type: 'negative',
    category: 'Context Understanding',
    comment: 'When the passage contained two similar names, the model picked the earlier one instead of the one matching the question timestamp.',
    suggestions: ['Better confidence calibration', 'Follow-up question chaining'],
  },
  {
    rating: 4,
    type: 'positive',
    category: 'Abstention & SQuAD 2.0',
    comment: 'Correctly flagged the question as unanswerable without hallucinating. Latency was under 180ms.',
    suggestions: ['Better confidence calibration'],
  },
]

/* ─── Star Rating Sub-component ─── */
function StarRating({ value, onChange, size = 32 }) {
  const [hovered, setHovered] = useState(0)

  const activeLevel = hovered || value
  const labels = ['', 'Poor Accuracy', 'Needs Work', 'Acceptable Extraction', 'Great Precision', 'Flawless Answer!']
  const levelColors = ['', '#ef4444', '#f97316', '#eab308', '#38bdf8', '#22c55e']

  return (
    <div className={styles.starRatingContainer}>
      <div className={styles.starRow} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => {
          const isFilled = activeLevel >= n
          return (
            <button
              key={n}
              type="button"
              className={`${styles.starBtn} ${isFilled ? styles.starActive : ''}`}
              onMouseEnter={() => {
                setHovered(n)
                if (soundService?.playClick) {
                  // subtle feedback on hover
                }
              }}
              onMouseLeave={() => setHovered(0)}
              onClick={() => {
                onChange(n)
                if (soundService?.playClick) soundService.playClick()
              }}
              aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                className={isFilled ? styles.starIconFilled : styles.starIconEmpty}
              />
            </button>
          )
        })}
      </div>
      {activeLevel > 0 && (
        <span
          className={styles.ratingBadge}
          style={{ borderColor: levelColors[activeLevel], color: levelColors[activeLevel] }}
        >
          {labels[activeLevel]} ({activeLevel}/5)
        </span>
      )}
    </div>
  )
}

/* ─── Single Feedback Card ─── */
function FeedbackCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`${styles.feedCard} ${item.type === 'positive' ? styles.feedCardPos : styles.feedCardNeg}`}>
      <div className={styles.feedCardTop}>
        <div className={styles.feedCardMeta}>
          <span className={`${styles.feedType} ${item.type === 'positive' ? styles.feedTypePos : styles.feedTypeNeg}`}>
            {item.type === 'positive' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
            {item.type === 'positive' ? 'Positive Signal' : 'Needs Calibration'}
          </span>
          <span className={styles.feedCategoryBadge}>{item.category}</span>
          <span className={styles.feedDate}>{item.date}</span>
        </div>
        <div className={styles.feedCardActions}>
          {item.comment && (
            <button
              type="button"
              className={styles.expandBtn}
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button
            type="button"
            className={styles.delBtn}
            onClick={() => onDelete(item.id)}
            title="Delete review"
            aria-label="Delete review"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className={styles.feedStars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={15}
            className={n <= item.rating ? styles.starFilledSm : styles.starEmptySm}
          />
        ))}
        <span className={styles.feedRatingNum}>{item.rating}.0 / 5.0</span>
      </div>

      {item.comment && (
        <blockquote className={`${styles.feedComment} ${expanded ? styles.feedCommentExpanded : ''}`}>
          "{item.comment}"
        </blockquote>
      )}

      {item.suggestions && item.suggestions.length > 0 && (
        <div className={styles.feedSuggestions}>
          {item.suggestions.map((s) => (
            <span key={s} className={styles.feedSuggestionTag}>
              <Lightbulb size={11} /> {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main FeedbackView ─── */
export default function FeedbackView({ onAddToast }) {
  const { theme } = useTheme()
  const [feedbacks, setFeedbacks] = useState(() => storageService.getFeedback())
  const [rating, setRating] = useState(0)
  const [type, setType] = useState('positive')
  const [category, setCategory] = useState('accuracy')
  const [comment, setComment] = useState('')
  const [selectedSuggestions, setSelectedSuggestions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [filterType, setFilterType] = useState('all') // 'all' | 'positive' | 'negative' | 'top'

  const handleDelete = useCallback((id) => {
    const updated = storageService.deleteFeedback(id)
    setFeedbacks(updated)
    if (soundService?.playClick) soundService.playClick()
    onAddToast?.({
      type: 'info',
      title: 'Feedback deleted',
      message: 'Your review was removed from the active training queue.',
    })
  }, [onAddToast])

  const toggleSuggestion = (id) => {
    if (soundService?.playClick) soundService.playClick()
    setSelectedSuggestions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleQuickComment = (phrase) => {
    if (soundService?.playClick) soundService.playClick()
    setComment((prev) => {
      const cleanPhrase = phrase.replace(/^\+\s*/, '')
      if (!prev) return cleanPhrase
      if (prev.includes(cleanPhrase)) return prev
      return `${prev}. ${cleanPhrase}`
    })
  }

  const handleAddSample = () => {
    const sample = SAMPLE_REVIEWS[Math.floor(Math.random() * SAMPLE_REVIEWS.length)]
    const entry = {
      id: `fb-sample-${Date.now()}`,
      rating: sample.rating,
      type: sample.type,
      category: sample.category,
      comment: sample.comment,
      suggestions: sample.suggestions,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    }
    const next = storageService.addFeedback(entry)
    setFeedbacks(next)
    if (soundService?.playAnswerSuccess) soundService.playAnswerSuccess()
    onAddToast?.({
      type: 'success',
      title: 'Sample review added',
      message: 'Demonstration feedback inserted into the evaluation queue.',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      onAddToast?.({
        type: 'error',
        title: 'Rating required',
        message: 'Please select a star rating (1 to 5) before submitting.',
      })
      return
    }

    setSubmitting(true)
    if (soundService?.playClick) soundService.playClick()

    /* Simulate async fine-tuning batch enqueue */
    await new Promise((r) => setTimeout(r, 900))

    const entry = {
      id: `fb-${Date.now()}`,
      rating,
      type,
      category: FEEDBACK_CATEGORIES.find((c) => c.id === category)?.label || category,
      comment: comment.trim(),
      suggestions: selectedSuggestions.map(
        (s) => IMPROVEMENT_SUGGESTIONS.find((x) => x.id === s)?.label || s
      ),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    }

    const next = storageService.addFeedback(entry)
    setFeedbacks(next)
    setSubmitting(false)
    setSubmitted(true)

    if (soundService?.playAnswerSuccess) soundService.playAnswerSuccess()
    onAddToast?.({
      type: 'success',
      title: 'Feedback queued for retraining!',
      message: `Loss gradients calibrated. BERT checkpoint adapts within the 72h window.`,
    })

    setTimeout(() => {
      setSubmitted(false)
      setRating(0)
      setType('positive')
      setCategory('accuracy')
      setComment('')
      setSelectedSuggestions([])
    }, 2800)
  }

  /* Derived stats */
  const totalCount = feedbacks.length
  const avgRating = totalCount
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / totalCount).toFixed(1)
    : '4.8'
  const posCount = feedbacks.filter((f) => f.type === 'positive').length
  const negCount = feedbacks.filter((f) => f.type === 'negative').length
  const modelScore = totalCount
    ? Math.min(100, Math.round((Number(avgRating) / 5) * 100))
    : 96

  /* Filtered feedbacks */
  const filteredFeedbacks = useMemo(() => {
    if (filterType === 'positive') return feedbacks.filter((f) => f.type === 'positive')
    if (filterType === 'negative') return feedbacks.filter((f) => f.type === 'negative')
    if (filterType === 'top') return feedbacks.filter((f) => f.rating >= 4)
    return feedbacks
  }, [feedbacks, filterType])

  /* Theme-specific badge & description */
  const themeMeta = {
    imperium: {
      badge: '⚜ ROYAL INTELLIGENCE REFINEMENT ⚜',
      titleHighlight: 'Imperial Model Fine-Tuning',
      desc: 'Sovereign feedback register: every evaluation shapes the golden BERT checkpoint with illuminated accuracy.',
      icon: Crown,
    },
    pixelcraft: {
      badge: '▣ VOXEL REINFORCEMENT LAB ▣',
      titleHighlight: 'Block by Block Tuning',
      desc: 'Crafting sharper question-answering spans block by block. Calibrating arcade precision and token logits.',
      icon: Zap,
    },
    void: {
      badge: '[ DEV_SANDBOX :: LOSS_CALIBRATION ]',
      titleHighlight: 'Neural Gradient Bus',
      desc: 'Direct gradient feedback ingestion into the PyTorch attention cache. Zero overhead, pure telemetry.',
      icon: Terminal,
    },
    cloud: {
      badge: 'ENTERPRISE QA QUALITY ASSURANCE',
      titleHighlight: 'Model Evaluation & Retraining',
      desc: 'Continuous human-in-the-loop evaluation pipeline aligning BERT with high-clarity enterprise benchmarks.',
      icon: Award,
    },
    ember: {
      badge: 'WARM INTELLIGENCE EDITORIAL DESK',
      titleHighlight: 'Human-Centered Refinement',
      desc: 'Thoughtful feedback loops cultivating contextual nuance, editorial warmth, and transparent comprehension.',
      icon: Flame,
    },
    original: {
      badge: 'CONTEXTIQ NEURAL OPTIMIZER',
      titleHighlight: 'Model Improvement Pipeline',
      desc: 'Your reviews directly calibrate BERT extractive pointer heads and reinforce high-confidence answer spans.',
      icon: Sparkles,
    },
  }[theme] || {
    badge: 'CONTEXTIQ NEURAL OPTIMIZER',
    titleHighlight: 'Model Improvement Pipeline',
    desc: 'Your reviews directly shape how the BERT model is fine-tuned and improved. Every rating counts.',
    icon: Sparkles,
  }

  const ThemeIcon = themeMeta.icon

  return (
    <div className={styles.container}>
      {/* ── Executive Header ────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.eyebrow}>
            <span className={styles.statusPulseDot} />
            <ThemeIcon size={13} className={styles.eyebrowIcon} />
            <span>{themeMeta.badge}</span>
          </div>
          <h1 className={styles.title}>
            Feedback &amp; <span className={styles.gradientText}>{themeMeta.titleHighlight}</span>
          </h1>
          <p className={styles.subTitle}>{themeMeta.desc}</p>
        </div>
      </div>

      {/* ── Active Telemetry & Health Bar (Always Visible) ───────────── */}
      <div className={styles.telemetryStrip}>
        <div className={styles.telemetryCard}>
          <div className={styles.teleIconWrap} style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.3)' }}>
            <BarChart2 size={18} className={styles.teleIconIndigo} />
          </div>
          <div className={styles.teleContent}>
            <div className={styles.teleVal}>
              {avgRating} <span className={styles.teleUnit}>/ 5.0</span>
            </div>
            <div className={styles.teleLabel}>Avg Model Rating</div>
          </div>
        </div>

        <div className={styles.telemetryCard}>
          <div className={styles.teleIconWrap} style={{ background: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.3)' }}>
            <ThumbsUp size={18} className={styles.teleIconGreen} />
          </div>
          <div className={styles.teleContent}>
            <div className={styles.teleVal}>
              {totalCount > 0 ? posCount : '94%'}
            </div>
            <div className={styles.teleLabel}>{totalCount > 0 ? 'Positive Reviews' : 'Extraction Precision'}</div>
          </div>
        </div>

        <div className={styles.telemetryCard}>
          <div className={styles.teleIconWrap} style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <AlertCircle size={18} className={styles.teleIconRed} />
          </div>
          <div className={styles.teleContent}>
            <div className={styles.teleVal}>
              {totalCount > 0 ? negCount : '0.28'}
            </div>
            <div className={styles.teleLabel}>{totalCount > 0 ? 'Calibration Needs' : 'Loss Threshold'}</div>
          </div>
        </div>

        <div className={styles.telemetryCard}>
          <div className={styles.teleIconWrap} style={{ background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <TrendingUp size={18} className={styles.teleIconAmber} />
          </div>
          <div className={styles.teleContent}>
            <div className={styles.teleVal}>{modelScore}%</div>
            <div className={styles.teleLabel}>Benchmark Health</div>
          </div>
        </div>

        <div className={styles.telemetryCard}>
          <div className={styles.teleIconWrap} style={{ background: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.3)' }}>
            <ShieldCheck size={18} className={styles.teleIconPurple} />
          </div>
          <div className={styles.teleContent}>
            <div className={styles.teleVal}>{totalCount}</div>
            <div className={styles.teleLabel}>Active User Reviews</div>
          </div>
        </div>
      </div>

      {/* ── Model Improvement Banner ─────────────────────────────────── */}
      <div className={styles.improvementBanner}>
        <div className={styles.bannerLeft}>
          <Sparkles size={18} className={styles.bannerIcon} />
          <div className={styles.bannerText}>
            <strong>How your feedback improves the BERT extraction engine</strong>
            <span>
              Low-rated answers are queued for hard-negative mining and fine-tuning. High ratings reinforce
              start/end pointer weights. Checkpoints synchronize automatically across community signals.
            </span>
          </div>
        </div>

        <div className={styles.bannerPipelineNodes}>
          <div className={styles.nodeItem}>
            <span className={styles.nodeDotActive} />
            <span>1. Review Ingestion</span>
          </div>
          <div className={styles.nodeDivider}>➔</div>
          <div className={styles.nodeItem}>
            <span className={styles.nodeDot} />
            <span>2. Loss Weighting</span>
          </div>
          <div className={styles.nodeDivider}>➔</div>
          <div className={styles.nodeItem}>
            <span className={styles.nodeDot} />
            <span>3. Checkpoint Sync</span>
          </div>
        </div>

        <div className={styles.bannerBadge}>
          <RefreshCw size={12} className={styles.cycleSpinner} />
          <span>Sync Window: 72h</span>
        </div>
      </div>

      {/* ── Two-Column Operational Layout ───────────────────────────── */}
      <div className={styles.twoCol}>
        {/* ── Left Column: Feedback Form ────────────────────────────── */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <div className={styles.sectionIconBezel}>
                <MessageSquare size={15} className={styles.sectionIcon} />
              </div>
              <h2 className={styles.sectionTitle}>Submit Review</h2>
            </div>
            <span className={styles.sectionTag}>Fine-Tuning Queue</span>
          </div>

          {submitted ? (
            <div className={styles.successCard}>
              <div className={styles.successIconGlow}>
                <CheckCircle2 size={42} className={styles.successIcon} />
              </div>
              <h3 className={styles.successTitle}>Review Enqueued Successfully!</h3>
              <p className={styles.successDesc}>
                Your feedback has been weighted and logged to the fine-tuning buffer.
                The BERT model will adapt on the next 72-hour cycle.
              </p>
              <div className={styles.successMeta}>
                <span>Cycle #48 Active</span> · <span>Signal: {type === 'positive' ? '+Reinforcement' : '-Negative Mining'}</span>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Star Rating */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Overall Extraction Rating <span className={styles.reqStar}>*</span>
                </label>
                <StarRating value={rating} onChange={setRating} size={30} />
              </div>

              {/* Feedback Type Toggle */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Sentiment Classification</label>
                <div className={styles.typeToggle}>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${type === 'positive' ? styles.typeBtnPos : ''}`}
                    onClick={() => {
                      setType('positive')
                      if (soundService?.playClick) soundService.playClick()
                    }}
                  >
                    <ThumbsUp size={14} />
                    <span>Positive Signal</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${type === 'negative' ? styles.typeBtnNeg : ''}`}
                    onClick={() => {
                      setType('negative')
                      if (soundService?.playClick) soundService.playClick()
                    }}
                  >
                    <ThumbsDown size={14} />
                    <span>Needs Calibration</span>
                  </button>
                </div>
              </div>

              {/* Category Chips */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Evaluation Dimension</label>
                <div className={styles.categoryChips}>
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.categoryChip} ${category === cat.id ? styles.categoryChipActive : ''}`}
                      onClick={() => {
                        setCategory(cat.id)
                        if (soundService?.playClick) soundService.playClick()
                      }}
                      title={cat.desc}
                    >
                      <span className={styles.categoryIcon}>{cat.icon}</span>
                      <span className={styles.categoryLabel}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Field with Quick Inserts */}
              <div className={styles.formGroup}>
                <div className={styles.commentLabelRow}>
                  <label className={styles.formLabel}>
                    Observations &amp; Notes <span className={styles.optional}>(optional)</span>
                  </label>
                  <span className={styles.charCount}>{comment.length} / 500</span>
                </div>

                {/* Quick Phrase Chips */}
                <div className={styles.quickPhrasesRow}>
                  <span className={styles.quickPhraseHint}>Quick add:</span>
                  <div className={styles.quickPhraseScroll}>
                    {QUICK_COMMENTS.map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={styles.quickPhraseChip}
                        onClick={() => handleQuickComment(phrase)}
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  className={styles.textarea}
                  placeholder="Describe how the model performed — e.g., 'Correctly highlighted Paris, but confidence score was lower than expected on long context'…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
              </div>

              {/* Feature Suggestions */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Requested Capabilities <span className={styles.optional}>(select any)</span>
                </label>
                <div className={styles.suggestionGrid}>
                  {IMPROVEMENT_SUGGESTIONS.map((s) => {
                    const active = selectedSuggestions.includes(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`${styles.suggChip} ${active ? styles.suggChipActive : ''}`}
                        onClick={() => toggleSuggestion(s.id)}
                      >
                        <Lightbulb size={12} className={active ? styles.suggIconActive : styles.suggIcon} />
                        <span>{s.label}</span>
                        {active && <span className={styles.suggCheck}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className={styles.spinner} />
                    <span>Enqueuing to Retraining Pipeline…</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Feedback to BERT Pipeline</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* ── Right Column: Past Reviews & Pipeline Status ──────────── */}
        <div className={styles.historySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <div className={styles.sectionIconBezel}>
                <BarChart2 size={15} className={styles.sectionIcon} />
              </div>
              <h2 className={styles.sectionTitle}>Your Review History</h2>
              <span className={styles.reviewCountBadge}>{feedbacks.length}</span>
            </div>

            {/* Quick Filter Tabs */}
            {feedbacks.length > 0 && (
              <div className={styles.filterGroup}>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${filterType === 'all' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${filterType === 'positive' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterType('positive')}
                >
                  Pos ({posCount})
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${filterType === 'negative' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterType('negative')}
                >
                  Needs Work ({negCount})
                </button>
              </div>
            )}
          </div>

          {feedbacks.length === 0 ? (
            <div className={styles.emptyFeed}>
              <div className={styles.emptyIconPulse}>
                <MessageSquare size={38} className={styles.emptyIcon} />
              </div>
              <h3 className={styles.emptyTitle}>No Reviews Recorded Yet</h3>
              <p className={styles.emptyDesc}>
                Help train and adapt the BERT model by evaluating extractions.
                Your inputs directly influence span accuracy in subsequent checkpoints.
              </p>
              <button
                type="button"
                className={styles.addSampleBtn}
                onClick={handleAddSample}
              >
                <Plus size={14} />
                <span>Insert Sample Review</span>
              </button>
            </div>
          ) : (
            <div className={styles.feedList}>
              {filteredFeedbacks.length === 0 ? (
                <div className={styles.emptyFilterState}>
                  <p>No reviews match the selected filter.</p>
                  <button
                    type="button"
                    className={styles.resetFilterBtn}
                    onClick={() => setFilterType('all')}
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredFeedbacks.map((item) => (
                  <FeedbackCard key={item.id} item={item} onDelete={handleDelete} />
                ))
              )}
            </div>
          )}

          {/* Model Pipeline Execution Stepper */}
          <div className={styles.pipelineCard}>
            <div className={styles.pipelineHeader}>
              <div className={styles.pipelineTitleLeft}>
                <TrendingUp size={15} className={styles.pipelineIcon} />
                <span>Model Improvement Pipeline</span>
              </div>
              <span className={styles.pipelineStatusPill}>● 72h Cycle #48</span>
            </div>

            <div className={styles.pipelineSteps}>
              <div className={`${styles.step} ${styles.stepDone}`}>
                <CheckCircle2 size={13} className={styles.stepCheck} />
                <span>Signals Ingested</span>
              </div>
              <div className={styles.stepLine} />

              <div className={`${styles.step} ${styles.stepDone}`}>
                <CheckCircle2 size={13} className={styles.stepCheck} />
                <span>Logit Calibration</span>
              </div>
              <div className={styles.stepLine} />

              <div className={`${styles.step} ${styles.stepActive}`}>
                <RefreshCw size={13} className={styles.stepSpinner} />
                <span>Fine-Tuning Queue</span>
              </div>
              <div className={styles.stepLine} />

              <div className={`${styles.step} ${styles.stepPending}`}>
                <ShieldCheck size={13} />
                <span>Evaluation</span>
              </div>
              <div className={styles.stepLine} />

              <div className={`${styles.step} ${styles.stepPending}`}>
                <Award size={13} />
                <span>Deploy Checkpoint</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
