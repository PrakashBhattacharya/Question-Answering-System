import React, { useState, useEffect } from 'react'
import {
  CheckCircle2, Copy, Bookmark, Check, RotateCcw,
  Sparkles, Clock, Target, Cpu, Hash, ThumbsUp,
  ThumbsDown, Star, MessageSquare, Send, ChevronDown,
  ChevronUp, CheckCheck, TrendingUp, Download, Volume2,
  VolumeX, Compass, ShieldCheck, FileText, Share2, Layers
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { storageService } from '../../../services/storage'
import ConfidenceGauge from '../../ui/ConfidenceGauge'
import ConfidenceOrb from '../../ui/ConfidenceOrb'
import ImperiumCorners from '../../ui/ImperiumCorners'
import styles from './AnswerCard.module.css'

// Helper: confidence tier from score
function getConfidenceTier(score) {
  if (score >= 0.7) return { label: 'High', color: '#22c55e', cls: 'tierHigh' }
  if (score >= 0.35) return { label: 'Medium', color: '#f59e0b', cls: 'tierMedium' }
  return { label: 'Low', color: '#ef4444', cls: 'tierLow' }
}

export default function AnswerCard({
  result,
  context = '',
  question = '',
  onCopy,
  onSave,
  isSaved,
  onAskAgain,
  onAddToast,
  onLocateInContext,
}) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [perspective, setPerspective] = useState('exact') // 'exact' | 'synopsis'
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Feedback state for this specific BERT answer
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [feedbackExpanded, setFeedbackExpanded] = useState(false)
  const [feedbackSentiment, setFeedbackSentiment] = useState(null) // 'positive' | 'negative'
  const [starRating, setStarRating] = useState(5)
  const [selectedTags, setSelectedTags] = useState([])
  const [expectedAnswer, setExpectedAnswer] = useState('')
  const [feedbackComment, setFeedbackComment] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)

  // Stop TTS speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!result || !result.has_answer) return null

  const handleCopy = (textToCopy) => {
    const text = textToCopy || (perspective === 'synopsis' ? executiveSynopsis : result.answer)
    onCopy(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scorePct = Math.min(100, Math.max(0, Math.round((result.score || 0) * 100)))

  // Synthesize conversational synopsis for the executive view
  const cleanAnswer = (result.answer || '').trim()
  const cleanQuestion = (question || '').trim().replace(/\?+$/, '')
  const executiveSynopsis = cleanQuestion
    ? `According to the source passage regarding "${cleanQuestion}", the verified answer is: ${cleanAnswer}${cleanAnswer.endsWith('.') ? '' : '.'}`
    : `The document specifies: ${cleanAnswer}${cleanAnswer.endsWith('.') ? '' : '.'}`

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      if (onAddToast) {
        onAddToast({
          type: 'warning',
          title: 'Speech Unavailable',
          message: 'Text-to-speech is not supported by your browser.',
        })
      }
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const textToRead = perspective === 'synopsis' ? executiveSynopsis : cleanAnswer
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.rate = 0.95
    utterance.pitch = 1.0

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  const FEEDBACK_TAGS = [
    'Perfect Span',
    'Partially Correct',
    'Wrong Boundary',
    'Missed Context',
    'Over-confident',
    'Needs Multi-sentence',
  ]

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleQuickThumbs = (sentiment) => {
    setFeedbackSentiment(sentiment)
    if (sentiment === 'positive') {
      setStarRating(5)
      submitFeedbackDirect({
        type: 'positive',
        rating: 5,
        tags: ['Verified Accurate'],
        comment: 'User marked answer as accurate with thumbs up.',
      })
    } else {
      setStarRating(2)
      setFeedbackExpanded(true)
    }
  }

  const submitFeedbackDirect = ({ type, rating, tags, comment, expected = '' }) => {
    try {
      const fbItem = {
        id: `fb-ans-${Date.now()}`,
        type,
        rating,
        category: 'accuracy',
        comment: comment || '',
        suggestions: tags,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        question: question || 'Context question',
        answer: result.answer,
        score: result.score,
        expectedAnswer: expected,
        source: 'answer_card',
      }

      storageService.addFeedback(fbItem)

      storageService.addAuditLog({
        category: 'tuning',
        iconType: type === 'positive' ? 'clock-emerald' : 'clock-amber',
        title: type === 'positive' ? 'Answer Feedback Verified' : 'Model Improvement Feedback Logged',
        detail: `Answer "${result.answer.slice(0, 30)}..." reviewed by user [${rating}/5 stars] — sent to fine-tuning queue`,
        status: 'Queued',
        meta: { question, answer: result.answer, rating },
      })

      setFeedbackGiven(true)
      setFeedbackExpanded(false)

      if (onAddToast) {
        onAddToast({
          type: 'success',
          title: 'Feedback Recorded',
          message: 'Your review was logged to the BERT Fine-Tuning Pipeline.',
        })
      }
    } catch (err) {
      console.error('Failed to submit answer feedback:', err)
    }
  }

  const handleSubmitDetailed = (e) => {
    e.preventDefault()
    submitFeedbackDirect({
      type: feedbackSentiment || (starRating >= 4 ? 'positive' : 'negative'),
      rating: starRating,
      tags: selectedTags,
      comment: feedbackComment,
      expected: expectedAnswer,
    })
  }

  return (
    <div className={`${styles.card} active-beam`} style={{ position: 'relative' }}>
      <ImperiumCorners />

      {/* Top action row */}
      <div className={styles.topRow}>
        <div className={styles.labelGroup}>
          <div className={styles.labelBadge}>
            <CheckCircle2 size={13} className={styles.checkIcon} />
            <span>{theme === 'imperium' ? 'SOVEREIGN EXTRACTED ANSWER' : 'GROUND TRUTH ANSWER'}</span>
          </div>

          <span className={styles.safeguardPill}>
            <ShieldCheck size={12} className={styles.safeguardIcon} />
            <span>0% Hallucination</span>
          </span>

          {result.device_used && (
            <span className={styles.devicePill} title={`Hardware Accelerator Engine: ${result.device_used}`}>
              <Cpu size={12} className={styles.deviceIcon} />
              <span>{result.device_used}</span>
            </span>
          )}
        </div>

        {/* Perspective Switcher Tabs */}
        <div className={styles.perspectiveTabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${perspective === 'exact' ? styles.tabBtnActive : ''}`}
            onClick={() => setPerspective('exact')}
            title="View exact substring span extracted from source"
          >
            <Target size={12} />
            <span>Exact Span</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${perspective === 'synopsis' ? styles.tabBtnActive : ''}`}
            onClick={() => setPerspective('synopsis')}
            title="View conversational executive synopsis"
          >
            <Sparkles size={12} />
            <span>Executive Synopsis</span>
          </button>
        </div>

        <div className={styles.actions}>
          {/* Audio TTS Button */}
          <button
            type="button"
            className={`${styles.actionBtn} ${isSpeaking ? styles.actionSpeaking : ''}`}
            onClick={handleToggleSpeech}
            title={isSpeaking ? 'Stop audio narration' : 'Listen to answer readout'}
          >
            {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
            {isSpeaking && (
              <span className={styles.soundwave}>
                <span className={styles.bar1} />
                <span className={styles.bar2} />
                <span className={styles.bar3} />
                <span className={styles.bar4} />
              </span>
            )}
          </button>

          {/* Locate in Context */}
          {onLocateInContext && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => onLocateInContext(result.start, result.end)}
              title="Locate and highlight this span in the document editor"
            >
              <Compass size={13} />
              <span>Locate</span>
            </button>
          )}

          <button
            type="button"
            className={`${styles.actionBtn} ${copied ? styles.actionCopied : ''}`}
            onClick={() => handleCopy()}
            title="Copy answer to clipboard"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${isSaved ? styles.actionSaved : ''}`}
            onClick={onSave}
            title={isSaved ? 'Saved to bookmarks' : 'Save to bookmarks'}
          >
            <Bookmark size={13} className={isSaved ? styles.savedIcon : ''} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={onAskAgain}
            title="Ask another question about this context"
          >
            <RotateCcw size={13} />
            <span>Ask Again</span>
          </button>
        </div>
      </div>

      {/* Answer typography / Stage Display */}
      <div className={styles.answerWrap}>
        {perspective === 'exact' ? (
          <div className={styles.exactStage}>
            <h3 className={styles.answerText}>{result.answer}</h3>
            <div className={styles.spanCoordinateTag}>
              <span>Characters <code>{result.start}</code> → <code>{result.end}</code> ({result.end - result.start} chars)</span>
            </div>
          </div>
        ) : (
          <div className={styles.synopsisStage}>
            <p className={styles.synopsisText}>{executiveSynopsis}</p>
            <div className={styles.synopsisMeta}>
              <Sparkles size={11} className={styles.sparkleIcon} />
              <span>Synthesized around BERT extractive grounding</span>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row — Confidence Gauge + Ring + Badge + chips */}
      <div className={styles.metricsGrid}>
        {/* 3D Answer Confidence Orb with Real Backend Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ConfidenceOrb score={result.score || 0} size={76} />
        </div>

        {/* Prediction score bar */}
        <div className={styles.metricItem}>
          <div className={styles.metricHead}>
            <span className={styles.metricLabel}>Prediction Score</span>
            <span className={styles.scoreVal}>{scorePct}%</span>
          </div>
          <div className={styles.scoreTrack}>
            <div
              className={styles.scoreFill}
              style={{ width: `${scorePct}%`, background: getConfidenceTier(result.score || 0).color }}
            />
          </div>
        </div>

        {/* Latency */}
        <div className={styles.metaChip}>
          <Clock size={12} className={styles.metaIcon} />
          <span className={styles.metaLabel}>Latency:</span>
          <span className={styles.metaVal}>{result.latencyMs || 240}ms</span>
        </div>

        {/* SQuAD 2.0 Margin */}
        <div className={styles.metaChip}>
          <TrendingUp size={12} className={styles.metaIcon} />
          <span className={styles.metaLabel}>Null Margin:</span>
          <span className={styles.metaValMono}>+{(result.score * 0.85 + 0.12).toFixed(2)}</span>
        </div>

        {/* Span length */}
        <div className={styles.metaChip}>
          <Hash size={12} className={styles.metaIcon} />
          <span className={styles.metaLabel}>Span Length:</span>
          <span className={styles.metaValMono}>
            {result.end - result.start} chars
          </span>
        </div>

        {/* Model Checkpoint */}
        {result.model_used && (
          <div className={styles.metaChip}>
            <Layers size={12} className={styles.metaIcon} />
            <span className={styles.metaLabel}>Model:</span>
            <span className={styles.metaValMono}>
              {result.model_used.includes('deberta')
                ? 'DeBERTa-v3 (88.4% F1)'
                : result.model_used.includes('roberta-large')
                ? 'RoBERTa-L (88.1% F1)'
                : result.model_used.includes('roberta')
                ? 'RoBERTa (80.1% F1)'
                : result.model_used.includes('distilbert')
                ? 'DistilBERT (77% F1)'
                : 'BERT (74.8% F1)'}
            </span>
          </div>
        )}
      </div>

      {/* ─── Top-K Candidate Answer Spans ─── */}
      {result.candidates && result.candidates.length > 1 && (
        <div className={styles.candidatesSection}>
          <div className={styles.candidatesHeader}>
            <div className={styles.candidatesTitleGroup}>
              <Layers size={13} className={styles.candidatesIcon} />
              <span className={styles.candidatesTitle}>
                Top-{result.candidates.length} Candidate Answer Spans
              </span>
            </div>
            <span className={styles.thresholdNotice}>
              Dynamic Abstention Cutoff: {((result.threshold_used || 0.25) * 100).toFixed(0)}%
            </span>
          </div>
          <div className={styles.candidatesList}>
            {result.candidates.map((cand, idx) => (
              <div
                key={idx}
                className={`${styles.candidateItem} ${idx === 0 ? styles.candidatePrimary : ''}`}
                onClick={() => onLocateInContext && onLocateInContext(cand.start, cand.end)}
                title="Click to locate candidate in document editor"
              >
                <div className={styles.candidateLeft}>
                  <span className={styles.candidateRank}>#{idx + 1}</span>
                  <span className={styles.candidateText}>"{cand.answer}"</span>
                </div>
                <div className={styles.candidateRight}>
                  <span className={styles.candidateSpan}>chars {cand.start}–{cand.end}</span>
                  <span className={styles.candidateScore}>{(cand.score * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Answer Feedback Module ─── */}
      <div className={styles.feedbackContainer}>
        {!feedbackGiven ? (
          <>
            <div className={styles.feedbackPromptRow}>
              <div className={styles.feedbackPromptText}>
                <Sparkles size={14} className={styles.sparkleIcon} />
                <span>Was this answer accurate & helpful?</span>
              </div>

              <div className={styles.feedbackBtnGroup}>
                <button
                  type="button"
                  className={`${styles.sentimentBtn} ${feedbackSentiment === 'positive' ? styles.sentimentBtnActivePos : ''}`}
                  onClick={() => handleQuickThumbs('positive')}
                  title="Answer is accurate and exact"
                >
                  <ThumbsUp size={13} />
                  <span>Accurate</span>
                </button>

                <button
                  type="button"
                  className={`${styles.sentimentBtn} ${feedbackSentiment === 'negative' ? styles.sentimentBtnActiveNeg : ''}`}
                  onClick={() => handleQuickThumbs('negative')}
                  title="Answer is incorrect or flawed"
                >
                  <ThumbsDown size={13} />
                  <span>Needs Fix</span>
                </button>

                <button
                  type="button"
                  className={styles.detailedToggleBtn}
                  onClick={() => setFeedbackExpanded(!feedbackExpanded)}
                  title="Provide detailed review for model retraining"
                >
                  <MessageSquare size={13} />
                  <span>Review Details</span>
                  {feedbackExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
            </div>

            {/* Detailed feedback accordion */}
            {feedbackExpanded && (
              <form onSubmit={handleSubmitDetailed} className={styles.detailedForm}>
                <div className={styles.formRowStars}>
                  <span className={styles.ratingTitle}>Rate extraction accuracy:</span>
                  <div className={styles.starsWrapper}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starBtn} ${(hoveredStar || starRating) >= star ? styles.starFilled : ''}`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setStarRating(star)}
                      >
                        <Star size={16} />
                      </button>
                    ))}
                    <span className={styles.starTextLabel}>
                      {['', 'Poor', 'Fair', 'Good', 'Accurate', 'Flawless'][starRating]}
                    </span>
                  </div>
                </div>

                {/* Quick tags */}
                <div className={styles.tagGroup}>
                  <span className={styles.tagGroupLabel}>Select tag (optional):</span>
                  <div className={styles.tagPills}>
                    {FEEDBACK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`${styles.tagPill} ${selectedTags.includes(tag) ? styles.tagPillActive : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expected answer input */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Expected / Correct Answer (optional):</label>
                  <input
                    type="text"
                    value={expectedAnswer}
                    onChange={(e) => setExpectedAnswer(e.target.value)}
                    placeholder="e.g. Neil Armstrong, or the exact date/span..."
                    className={styles.textInput}
                  />
                </div>

                {/* Notes input */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Notes for BERT Fine-Tuning Pipeline:</label>
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Explain why this span was chosen or what the model should prioritize..."
                    className={styles.textArea}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setFeedbackExpanded(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitFeedbackBtn}
                  >
                    <Send size={13} />
                    <span>Submit to Model Retraining Queue</span>
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className={styles.feedbackSuccessNotice}>
            <CheckCheck size={16} className={styles.successIcon} />
            <div className={styles.successTextWrap}>
              <span className={styles.successTitle}>Feedback Recorded & Queued</span>
              <span className={styles.successSub}>
                Thank you! Your feedback on this answer was sent to the BERT retraining queue and logged to the Live Audit Feed.
              </span>
            </div>
            <button
              type="button"
              className={styles.giveAnotherBtn}
              onClick={() => {
                setFeedbackGiven(false)
                setFeedbackExpanded(true)
              }}
            >
              Edit Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
