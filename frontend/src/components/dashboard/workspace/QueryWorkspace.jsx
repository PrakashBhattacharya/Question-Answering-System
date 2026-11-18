import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles, Cpu, ShieldCheck, Zap, AlertCircle, Download, FileText, RotateCcw, Layers
} from 'lucide-react'
import ContextEditor, { EXAMPLE_CONTEXTS } from './ContextEditor'
import QuestionPanel from './QuestionPanel'
import InferenceSteps from './InferenceSteps'
import AnswerCard from './AnswerCard'
import EvidenceViewer from './EvidenceViewer'
import NoAnswerCard from './NoAnswerCard'
import QuickActionsCard from './QuickActionsCard'
import RecentQueries from './RecentQueries'
import SummarizeCard from './SummarizeCard'
import AnswerEngineHero from './AnswerEngineHero'
import VoidTelemetry from '../../ui/VoidTelemetry'
import { soundService } from '../../../services/soundService'
import { qaApi, summarizeApi } from '../../../services/api'
import { storageService } from '../../../services/storage'
import styles from './QueryWorkspace.module.css'

export default function QueryWorkspace({
  onSelectView,
  onOpenModelDetails,
  onAddToast,
  initialContext = '',
  initialQuestion = '',
}) {
  const [context, setContext] = useState(initialContext || EXAMPLE_CONTEXTS[1].context)
  const [question, setQuestion] = useState(initialQuestion || EXAMPLE_CONTEXTS[1].sampleQuestions[0])
  const [activeExampleId, setActiveExampleId] = useState(EXAMPLE_CONTEXTS[1].id)
  const [isEditorExpanded, setIsEditorExpanded] = useState(false)
  const [selectedModel, setSelectedModel] = useState('deberta')

  const [loading, setLoading] = useState(false)
  const [inferenceStage, setInferenceStage] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [queries, setQueries] = useState(() => storageService.getHistory())
  const [highlightRange, setHighlightRange] = useState(null)

  // Summarization state
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState(null)

  // When initialContext or initialQuestion changes from props
  useEffect(() => {
    if (initialContext) setContext(initialContext)
    if (initialQuestion) setQuestion(initialQuestion)
  }, [initialContext, initialQuestion])

  // Context-specific suggested questions
  const currentExample = EXAMPLE_CONTEXTS.find((ex) => ex.id === activeExampleId)
  const suggestedQuestions = currentExample ? currentExample.sampleQuestions : [
    'What are the key facts mentioned in this context?',
    'When did the described event take place?',
    'Who is the main subject in this passage?',
  ]

  const hasContext = Boolean(context && context.trim().length > 0)
  const hasAnswer = Boolean(result && result.has_answer && result.answer)
  const wordCount = context ? context.trim().split(/\s+/).filter(Boolean).length : 0

  const handleSelectExample = (ex) => {
    setContext(ex.context)
    setQuestion(ex.sampleQuestions[0] || '')
    setActiveExampleId(ex.id)
    setResult(null)
    setSummary(null)
    setError('')
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'Example Loaded',
        message: `Loaded "${ex.title}" into context editor.`,
      })
    }
  }

  const handleRunInference = async (e, overrideContext, overrideQuestion) => {
    if (e && e.preventDefault) e.preventDefault()
    const ctx = (overrideContext !== undefined ? overrideContext : context).trim()
    const q = (overrideQuestion !== undefined ? overrideQuestion : question).trim()

    if (!ctx) {
      setError('Please provide a document or text passage.')
      if (onAddToast) {
        onAddToast({
          type: 'error',
          title: 'Document Required',
          message: 'Please paste text or click a Quick Demo pill to get started.',
        })
      }
      return
    }
    if (!q) {
      setError('Please enter a question.')
      if (onAddToast) {
        onAddToast({
          type: 'error',
          title: 'Question Required',
          message: 'Please enter a natural-language question.',
        })
      }
      return
    }

    setError('')
    setResult(null)
    setLoading(true)
    setInferenceStage(0)
    soundService.playQuestionAsk()

    // Animated progression through inference sequence
    const stageInterval = setInterval(() => {
      setInferenceStage((prev) => (prev < 4 ? prev + 1 : prev))
    }, 280)

    try {
      const data = await qaApi.answer(ctx, q, 64, selectedModel, 3, 0.05)
      clearInterval(stageInterval)
      setInferenceStage(5)
      setResult(data)

      // Record to history
      storageService.addQuery({
        context: ctx.slice(0, 300) + (ctx.length > 300 ? '...' : ''),
        fullContext: ctx,
        question: q,
        answer: data.answer || '',
        score: data.score || 0,
        start: data.start || 0,
        end: data.end || 0,
        has_answer: data.has_answer,
        latencyMs: data.latencyMs,
        model: selectedModel,
      })
      setQueries(storageService.getHistory())

      const modelLabel =
        selectedModel === 'deberta'
          ? 'DeBERTa-v3'
          : selectedModel === 'roberta-large'
          ? 'RoBERTa-Large'
          : selectedModel === 'roberta'
          ? 'RoBERTa'
          : selectedModel === 'distilbert'
          ? 'DistilBERT'
          : 'BERT'

      if (data.has_answer) {
        soundService.playAnswerSuccess()
        if (onAddToast) {
          onAddToast({
            type: 'success',
            title: 'Answer Found',
            message: `${modelLabel} found the answer in ${data.latencyMs || 150}ms with ${(data.score * 100).toFixed(1)}% confidence.`,
          })
        }
      } else {
        if (onAddToast) {
          onAddToast({
            type: 'info',
            title: 'No Direct Answer',
            message: 'Your text does not contain a verified answer to this question.',
          })
        }
      }
    } catch (err) {
      clearInterval(stageInterval)
      const msg = err.message || 'Inference service unavailable. Please ensure the FastAPI server is running.'
      setError(msg)
      if (onAddToast) {
        onAddToast({
          type: 'error',
          title: 'Search Failed',
          message: msg,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // 1-Click Quick Demo Launcher
  const handleLaunchDemo = (id) => {
    const ex = EXAMPLE_CONTEXTS.find((e) => e.id === id)
    if (!ex) return
    setContext(ex.context)
    setQuestion(ex.sampleQuestions[0])
    setActiveExampleId(id)
    setResult(null)
    setSummary(null)
    handleRunInference(null, ex.context, ex.sampleQuestions[0])
  }

  const handleSummarize = async () => {
    if (!context.trim() || context.split(' ').length < 30) {
      if (onAddToast) {
        onAddToast({ type: 'error', title: 'Too Short', message: 'Need at least 30 words to summarize.' })
      }
      return
    }
    setSummaryLoading(true)
    setSummary(null)
    try {
      const data = await summarizeApi.summarize(context)
      setSummary(data)
      if (onAddToast) {
        onAddToast({
          type: 'success',
          title: 'Summary Generated',
          message: `Compressed ${data.original_length} → ${data.summary_length} words using BART.`,
        })
      }
    } catch (err) {
      if (onAddToast) {
        onAddToast({ type: 'error', title: 'Summarization Failed', message: err.message })
      }
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (!result) return
    const content = [
      `ContextIQ — Q&A Session Export`,
      `Generated: ${new Date().toLocaleString()}`,
      `Model: ${selectedModel.toUpperCase()}`,
      ``,
      `QUESTION`,
      question,
      ``,
      `ANSWER`,
      result.answer || 'No answer found.',
      ``,
      `CONFIDENCE`,
      `${Math.round((result.score || 0) * 100)}% (${result.score >= 0.7 ? 'High' : result.score >= 0.35 ? 'Medium' : 'Low'})`,
      ``,
      `CONTEXT`,
      context,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contextiq-session-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    if (onAddToast) {
      onAddToast({ type: 'success', title: 'Session Exported', message: 'Q&A session downloaded as text file.' })
    }
  }

  const handleCopyAnswer = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      if (onAddToast) {
        onAddToast({
          type: 'success',
          title: 'Copied to Clipboard',
          message: `"${text}" copied.`,
        })
      }
    })
  }

  const handleSaveAnswer = () => {
    if (!result || !result.has_answer) return
    storageService.saveAnswer({
      question,
      answer: result.answer,
      contextSnippet: context.slice(0, 300),
      fullContext: context,
      start: result.start,
      end: result.end,
      score: result.score,
    })
    if (onAddToast) {
      onAddToast({
        type: 'success',
        title: 'Answer Saved',
        message: 'Saved to your bookmarks collection.',
      })
    }
  }

  const isCurrentSaved = result && result.has_answer ? storageService.isSaved(question, result.answer) : false

  const handleLoadQuery = (q) => {
    if (q.fullContext) setContext(q.fullContext)
    else if (q.context) setContext(q.context)
    setQuestion(q.question)
    setResult(null)
    setSummary(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'Query Loaded',
        message: `Loaded "${q.question}" into workspace.`,
      })
    }
  }

  const handleDeleteQuery = (id) => {
    const updated = storageService.deleteQuery(id)
    setQueries(updated)
  }

  const handleClearHistory = () => {
    storageService.clearHistory()
    setQueries([])
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'History Cleared',
        message: 'Session queries have been reset.',
      })
    }
  }

  return (
    <div className={styles.workspace}>
      {/* Sleek Productivity Workspace Header */}
      <div className={styles.workspaceHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h1 className={styles.workspaceTitle}>Workspace</h1>
            <span className={styles.statusChip}>
              <span className={styles.statusDot} />
              Model Ready
            </span>
            <span className={styles.engineBadge}>BERT SQuAD 2.0</span>
          </div>
          <p className={styles.workspaceSubtitle}>
            Extract exact answer spans with zero generative hallucination.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => {
              setContext('')
              setQuestion('')
              setResult(null)
              setSummary(null)
              setActiveExampleId(null)
              if (onAddToast) {
                onAddToast({
                  type: 'info',
                  title: 'Workspace Reset',
                  message: 'Context and question fields cleared.',
                })
              }
            }}
            title="Reset Context and Question"
          >
            <RotateCcw size={13} />
            <span>Clear Session</span>
          </button>
        </div>
      </div>

      <VoidTelemetry model={selectedModel} />

      {/* Floating Model Telemetry HUD */}
      <div className={styles.modelHudBar}>
        <div className={styles.hudLeft}>
          <div className={styles.hudHeartbeat}>
            <span className={styles.hudPulseDot} />
            <span>BERT ENGINE ONLINE</span>
          </div>
          <span className={styles.hudDivider}>/</span>
          <span className={styles.hudTag}>Model: <code>BERT-Base SQuAD 2.0</code></span>
          <span className={styles.hudDivider}>·</span>
          <span className={styles.hudTag}>Extraction: <code>Verbatim Exact Match</code></span>
          <span className={styles.hudDivider}>·</span>
          <span className={styles.hudTag}>Speed: <code>Instant (~180ms)</code></span>
        </div>

        <button
          type="button"
          className={styles.hudInspectBtn}
          onClick={() => onSelectView('analytics')}
          title="Open Model Analytics & Telemetry"
        >
          <Layers size={13} />
          <span>Model Analytics</span>
        </button>
      </div>

      {/* ── Central Interactive 3D BERT / Answer Engine Centerpiece ── */}
      <AnswerEngineHero
        context={context}
        question={question}
        result={result}
        loading={loading}
        inferenceStage={inferenceStage}
      />

      {/* ── 3-Step Guided Workflow Header ────────────────────────── */}
      <div className={styles.workflowGuide}>
        <div className={`${styles.stepPill} ${hasContext ? styles.stepDone : styles.stepActive}`}>
          <span className={styles.stepNum}>{hasContext ? '✓' : '1'}</span>
          <div className={styles.stepTextGroup}>
            <span className={styles.stepTitle}>1. Add Your Document</span>
            <span className={styles.stepDesc}>
              {hasContext ? `${wordCount} words loaded` : 'Paste text or pick a Quick Demo'}
            </span>
          </div>
        </div>

        <div className={styles.stepConnector} />

        <div className={`${styles.stepPill} ${hasContext && !hasAnswer ? styles.stepActive : hasAnswer ? styles.stepDone : styles.stepIdle}`}>
          <span className={styles.stepNum}>{hasAnswer ? '✓' : '2'}</span>
          <div className={styles.stepTextGroup}>
            <span className={styles.stepTitle}>2. Ask Any Question</span>
            <span className={styles.stepDesc}>
              {question ? 'Question ready' : 'Type or pick a template'}
            </span>
          </div>
        </div>

        <div className={styles.stepConnector} />

        <div className={`${styles.stepPill} ${hasAnswer ? styles.stepActive : styles.stepIdle}`}>
          <span className={styles.stepNum}>3</span>
          <div className={styles.stepTextGroup}>
            <span className={styles.stepTitle}>3. Get Exact Answer</span>
            <span className={styles.stepDesc}>
              {hasAnswer ? `${Math.round((result.score || 0) * 100)}% match found` : 'Directly from your text'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual-Stage Studio: Left (Document Studio) + Right (Neural Inference & Answer Stage) */}
      <div className={styles.mainGrid}>
        {/* Left Column: Context Document Studio */}
        <div className={styles.leftCol}>
          {/* 01 Context Panel */}
          <ContextEditor
            context={context}
            onChangeContext={(newCtx) => {
              setContext(newCtx)
              setActiveExampleId(null)
              setSummary(null)
              setHighlightRange(null)
            }}
            onSelectExample={handleSelectExample}
            activeExampleId={activeExampleId}
            onAddToast={onAddToast}
            isExpanded={isEditorExpanded}
            onToggleExpand={() => setIsEditorExpanded(!isEditorExpanded)}
            highlightRange={highlightRange}
          />

          {/* Summarize Card — shown when context is loaded */}
          {context.trim().split(' ').length >= 30 && (
            <SummarizeCard
              onSummarize={handleSummarize}
              loading={summaryLoading}
              summary={summary}
            />
          )}
        </div>

        {/* Right Column: Neural Inference & Answer Spotlight Stage */}
        <div className={styles.rightCol}>
          {/* 02 Question Panel */}
          <QuestionPanel
            question={question}
            onChangeQuestion={setQuestion}
            onSubmit={handleRunInference}
            loading={loading}
            suggestedQuestions={suggestedQuestions}
            onSelectSuggestion={(q) => setQuestion(q)}
            model={selectedModel}
            onChangeModel={setSelectedModel}
          />

          {/* Error Message Box */}
          {error && (
            <div className={styles.errorBox} role="alert">
              <AlertCircle size={15} className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          {/* Inference Animation */}
          {loading && <InferenceSteps activeStage={inferenceStage} model={selectedModel} />}

          {/* Results: Spotlight Answer Card + Evidence Viewer OR No Answer State */}
          {result && !loading && (
            <div className={styles.resultsWrap}>
              {result.has_answer ? (
                <>
                  <AnswerCard
                    result={result}
                    context={context}
                    question={question}
                    onCopy={handleCopyAnswer}
                    onSave={handleSaveAnswer}
                    isSaved={isCurrentSaved}
                    onAskAgain={() => {
                      const input = document.getElementById('question-input')
                      input?.focus()
                      input?.select()
                    }}
                    onAddToast={onAddToast}
                    onLocateInContext={(start, end) => setHighlightRange({ start, end })}
                  />
                  <EvidenceViewer
                    context={context}
                    result={result}
                  />
                  {/* Export button */}
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={handleExportPDF}
                    title="Export Q&A session as text file"
                  >
                    <Download size={14} />
                    <span>Export Session</span>
                  </button>
                </>
              ) : (
                <NoAnswerCard
                  onAskAgain={() => {
                    const input = document.getElementById('question-input')
                    input?.focus()
                    input?.select()
                  }}
                />
              )}
            </div>
          )}

          {/* Standby State: When awaiting question inference */}
          {!result && !loading && (
            <div className={styles.standbyWrap}>
              <QuickActionsCard
                onNewQuery={() => {
                  setContext('')
                  setQuestion('')
                  setResult(null)
                  setSummary(null)
                  setActiveExampleId(null)
                  setHighlightRange(null)
                }}
                onSelectView={onSelectView}
                onTriggerUpload={() => {
                  document.getElementById('context-input')?.focus()
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Recent Queries */}
      <div className={styles.bottomSection}>
        <RecentQueries
          queries={queries}
          onLoadQuery={handleLoadQuery}
          onCopy={handleCopyAnswer}
          onDeleteQuery={handleDeleteQuery}
          onClearAll={handleClearHistory}
        />
      </div>
    </div>
  )
}
