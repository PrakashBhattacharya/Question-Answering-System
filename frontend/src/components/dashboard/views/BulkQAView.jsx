import React, { useState } from 'react'
import {
  ListChecks, Plus, Trash2, Send, Download, Loader2,
  CheckCircle2, AlertCircle, Sparkles, FileText, X,
  Layers, Clock, ShieldCheck, Zap, Crown, Terminal,
  Flame, FileSpreadsheet, Cpu, Play, BarChart2
} from 'lucide-react'
import { qaApi } from '../../../services/api'
import { soundService } from '../../../services/soundService'
import { useTheme } from '../../../context/ThemeContext'
import ConfidenceGauge from '../../ui/ConfidenceGauge'
import ImperiumCorners from '../../ui/ImperiumCorners'
import styles from './BulkQAView.module.css'

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX']

const SAMPLE_BATCH_CONTEXT =
  'The Renaissance was a fervent period of European cultural, artistic, political and economic rebirth following the Middle Ages. Generally described as taking place from the 14th century to the 17th century, the Renaissance promoted the rediscovery of classical philosophy, literature and art. Some of the greatest thinkers, authors, statesmen, scientists and artists in human history thrived during this era, while global exploration opened up new lands and cultures to European commerce. Leonardo da Vinci was born in 1452 and is widely considered one of the greatest painters of all time, famous for the Mona Lisa and The Last Supper.'

const SAMPLE_BATCH_QUESTIONS = [
  'When did the Renaissance take place?',
  'When was Leonardo da Vinci born?',
  'What famous artworks did Leonardo da Vinci paint?',
  'Who discovered the Pacific Ocean in 1513?', // unanswerable in context!
]

export default function BulkQAView({ onAddToast }) {
  const { theme, isImperium, isVoid, isCloud, isEmber, isPixelcraft } = useTheme()
  const [context, setContext] = useState(SAMPLE_BATCH_CONTEXT)
  const [questions, setQuestions] = useState(SAMPLE_BATCH_QUESTIONS)
  const [model, setModel] = useState('bert')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const addQuestion = () => {
    setQuestions((prev) => [...prev, ''])
    if (soundService?.playClick) soundService.playClick()
  }

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
    if (soundService?.playClick) soundService.playClick()
  }

  const updateQuestion = (idx, val) =>
    setQuestions((prev) => prev.map((q, i) => (i === idx ? val : q)))

  const handleClearContext = () => {
    setContext('')
    if (soundService?.playClick) soundService.playClick()
  }

  const handleLoadSample = () => {
    setContext(SAMPLE_BATCH_CONTEXT)
    setQuestions([...SAMPLE_BATCH_QUESTIONS])
    setResults(null)
    setError('')
    if (soundService?.playAnswerSuccess) soundService.playAnswerSuccess()
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'Sample Batch Loaded',
        message: 'Renaissance historical context and 4 multi-aspect queries ready.',
      })
    }
  }

  const handleRunBulk = async () => {
    if (!context.trim()) {
      if (onAddToast) onAddToast({ type: 'error', title: 'Context Required', message: 'Paste a context passage first.' })
      return
    }
    const validQuestions = questions.filter((q) => q.trim())
    if (validQuestions.length === 0) {
      if (onAddToast) onAddToast({ type: 'error', title: 'Questions Required', message: 'Add at least one question.' })
      return
    }
    setLoading(true)
    setResults(null)
    setError('')
    if (soundService?.playClick) soundService.playClick()

    try {
      const data = await qaApi.bulk(context, validQuestions.map((q) => ({ question: q })), model)
      setResults(data)
      if (soundService?.playAnswerSuccess) soundService.playAnswerSuccess()
      if (onAddToast) {
        onAddToast({
          type: 'success',
          title: 'Batch Inference Complete',
          message: `${data.answered} of ${data.total} queries answered in ${data.latencyMs}ms.`,
        })
      }
    } catch (err) {
      setError(err.message)
      if (onAddToast) onAddToast({ type: 'error', title: 'Bulk Q&A Failed', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!results) return
    const header = 'Question,Answer,Confidence,Has Answer'
    const rows = results.results.map((r) =>
      `"${r.question.replace(/"/g, '""')}","${(r.answer || '').replace(/"/g, '""')}",${Math.round(r.score * 100)}%,${r.has_answer}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-qa-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    if (soundService?.playClick) soundService.playClick()
    if (onAddToast) onAddToast({ type: 'success', title: 'CSV Exported', message: 'Batch results saved as CSV spreadsheet.' })
  }

  const handleExportJSON = () => {
    if (!results) return
    const jsonStr = JSON.stringify(results, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-qa-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    if (soundService?.playClick) soundService.playClick()
    if (onAddToast) onAddToast({ type: 'success', title: 'JSON Exported', message: 'Batch results saved as JSON payload.' })
  }

  const MODEL_OPTIONS = [
    { key: 'bert', label: 'BERT Base', f1: '74.8% F1' },
    { key: 'roberta', label: 'RoBERTa Base', f1: '80.1% F1' },
    { key: 'distilbert', label: 'DistilBERT', f1: '77.0% F1' },
  ]

  // Theme-tailored labels & badges
  const themeMeta = {
    imperium: {
      badge: '⚜ ROYAL BATCH COMPILATION & PARALLEL REASONING ⚜',
      titleHighlight: 'Imperial Batch Mode',
      sub: 'Evaluate an array of inquiries simultaneously against illuminated manuscript context.',
      icon: Crown,
      runBtn: 'Initiate Royal Batch Inference',
      addBtn: '+ Add Manuscript Query',
    },
    pixelcraft: {
      badge: '▣ 8-BIT VOXEL BATCH PROCESSING ▣',
      titleHighlight: 'Block Batch Mode',
      sub: 'Batch evaluate multiple query vectors through parallel attention matrix blocks.',
      icon: Zap,
      runBtn: 'EXECUTE_BATCH_MATRIX',
      addBtn: '+ ADD_QUERY_BLOCK',
    },
    void: {
      badge: '[ SYSTEM :: BATCH_EVAL_IO // PYTORCH_PARALLEL ]',
      titleHighlight: 'Batch Console',
      sub: 'Direct matrix evaluation across vectorized questions. High-throughput zero-overhead extraction.',
      icon: Terminal,
      runBtn: 'EXECUTE BATCH INFERENCE',
      addBtn: '+ INSERT_QUERY',
    },
    cloud: {
      badge: 'ENTERPRISE PARALLEL QA PROCESSOR',
      titleHighlight: 'Bulk Q&A Suite',
      sub: 'Execute multiple questions concurrently against reference documents with CSV & JSON exports.',
      icon: ShieldCheck,
      runBtn: 'Run Enterprise Batch QA',
      addBtn: '+ Add Question',
    },
    ember: {
      badge: 'WARM INTELLIGENCE EDITORIAL COMPILER',
      titleHighlight: 'Batch Reading Desk',
      sub: 'Formulate an inquisitive study guide: ask multiple thoughtful questions across the passage.',
      icon: Flame,
      runBtn: 'Run Reading Batch',
      addBtn: '+ Add Reading Query',
    },
    original: {
      badge: 'PARALLEL INFERENCE ENGINE · BATCH MATRIX',
      titleHighlight: 'Bulk Q&A Mode',
      sub: 'Run multiple questions against one context in a single batch. Export results as CSV or JSON.',
      icon: ListChecks,
      runBtn: 'Run Batch Inference',
      addBtn: '+ Add Question',
    },
  }[theme] || {
    badge: 'PARALLEL INFERENCE ENGINE · BATCH MATRIX',
    titleHighlight: 'Bulk Q&A Mode',
    sub: 'Run multiple questions against one context in a single batch. Export results as CSV or JSON.',
    icon: ListChecks,
    runBtn: 'Run Batch Inference',
    addBtn: '+ Add Question',
  }

  const ThemeIcon = themeMeta.icon

  const formatQNum = (idx) => {
    if (isImperium) return ROMAN_NUMERALS[idx] || (idx + 1)
    if (isPixelcraft) return `[#${idx + 1}]`
    if (isVoid) return `0${idx + 1}`
    if (isEmber) return `§${idx + 1}`
    return `${idx + 1}`
  }

  const activeQuestionsCount = questions.filter((q) => q.trim()).length
  const contextWords = context.split(/\s+/).filter(Boolean).length

  return (
    <div className={styles.container}>
      {/* ── Executive Header ────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <div className={styles.eyebrow}>
              <span className={styles.statusPulseDot} />
              <ThemeIcon size={13} className={styles.eyebrowIcon} />
              <span>{themeMeta.badge}</span>
            </div>
            <h1 className={styles.title}>
              Bulk Q&amp;A <span className={styles.gradientText}>{themeMeta.titleHighlight}</span>
            </h1>
            <p className={styles.subTitle}>{themeMeta.sub}</p>
          </div>

          <div className={styles.headerBtnGroup}>
            <button
              type="button"
              className={styles.sampleBatchBtn}
              onClick={handleLoadSample}
            >
              <Sparkles size={14} />
              <span>Load Sample Batch</span>
            </button>
          </div>
        </div>

        {/* ── Telemetry Quickstrip ──────────────────────────────── */}
        <div className={styles.batchTelemetryStrip}>
          <div className={styles.telemetryItem}>
            <ListChecks size={14} className={styles.telemetryIcon} />
            <span className={styles.telemetryLabel}>Active Questions:</span>
            <span className={styles.telemetryValue}>{activeQuestionsCount}</span>
          </div>
          <div className={styles.telemetryDivider}>•</div>
          <div className={styles.telemetryItem}>
            <FileText size={14} className={styles.telemetryIcon} />
            <span className={styles.telemetryLabel}>Passage Volume:</span>
            <span className={styles.telemetryValue}>{contextWords} words</span>
          </div>
          <div className={styles.telemetryDivider}>•</div>
          <div className={styles.telemetryItem}>
            <Cpu size={14} className={styles.telemetryIcon} />
            <span className={styles.telemetryLabel}>Model Checkpoint:</span>
            <span className={styles.telemetryValue}>
              {MODEL_OPTIONS.find((m) => m.key === model)?.label}
            </span>
          </div>
          <div className={styles.telemetryDivider}>•</div>
          <div className={styles.telemetryItem}>
            <ShieldCheck size={14} className={styles.telemetryIconGreen} />
            <span className={styles.telemetryLabel}>Vector Engine:</span>
            <span className={styles.telemetryValueGreen}>PyTorch Parallel Batching</span>
          </div>
        </div>
      </div>

      {/* ── Dual-Column Layout ──────────────────────────────────── */}
      <div className={styles.grid}>
        {/* ── Left Column: Context Passage + Questions ────────────── */}
        <div className={styles.leftCol}>
          {/* Context Card */}
          <div className={styles.card}>
            <ImperiumCorners />
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <div className={styles.cardIconWrap}><FileText size={14} /></div>
                <h2 className={styles.cardTitle}>Context Passage</h2>
              </div>
              <div className={styles.cardHeaderRight}>
                {context && (
                  <button
                    type="button"
                    className={styles.miniClearBtn}
                    onClick={handleClearContext}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              className={styles.contextArea}
              placeholder="Paste your document or reference passage here to query against…"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={8}
            />

            <div className={styles.contextMeta}>
              <span>{context.length.toLocaleString()} characters</span>
              <span>•</span>
              <span>{contextWords.toLocaleString()} words</span>
            </div>
          </div>

          {/* Questions Matrix Card */}
          <div className={styles.card}>
            <ImperiumCorners />
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <div className={styles.cardIconWrap}><ListChecks size={14} /></div>
                <h2 className={styles.cardTitle}>Questions Matrix</h2>
              </div>
              <span className={styles.cardHeaderBadge}>
                {activeQuestionsCount} of {questions.length} Ready
              </span>
            </div>

            <div className={styles.questionList}>
              {questions.map((q, idx) => (
                <div key={idx} className={styles.questionRow}>
                  <span className={styles.qNum}>{formatQNum(idx)}</span>
                  <input
                    type="text"
                    className={styles.qInput}
                    placeholder={`Enter question #${idx + 1}…`}
                    value={q}
                    onChange={(e) => updateQuestion(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addQuestion()
                    }}
                  />
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeQuestion(idx)}
                      title="Remove question"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.addBtn}
                onClick={addQuestion}
              >
                <Plus size={14} />
                <span>{themeMeta.addBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Execution Configuration & Results ──────── */}
        <div className={styles.rightCol}>
          {/* Execution Configuration Card */}
          <div className={styles.card}>
            <ImperiumCorners />
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <div className={styles.cardIconWrap}><Sparkles size={14} /></div>
                <h2 className={styles.cardTitle}>Batch Execution Configuration</h2>
              </div>
            </div>

            <div className={styles.controlsBody}>
              <div className={styles.modelRow}>
                <span className={styles.modelLabel}>QA Neural Checkpoint:</span>
                <div className={styles.modelPills}>
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={`${styles.modelPill} ${model === m.key ? styles.modelPillActive : ''}`}
                      onClick={() => {
                        setModel(m.key)
                        if (soundService?.playClick) soundService.playClick()
                      }}
                    >
                      <span className={styles.modelPillName}>{m.label}</span>
                      <span className={styles.f1}>{m.f1}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={styles.runBtn}
                onClick={handleRunBulk}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className={styles.spin} />
                    <span>Evaluating Questions Batch…</span>
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    <span>{themeMeta.runBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Matrix Card */}
          {results && (
            <div className={styles.card}>
              <ImperiumCorners />
              <div className={styles.resultsHeader}>
                <div className={styles.cardHeaderLeft}>
                  <div className={styles.cardIconWrapGreen}>
                    <CheckCircle2 size={14} className={styles.successIcon} />
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>
                      Inference Results ({results.answered}/{results.total} answered)
                    </h2>
                    <span className={styles.latencySub}>Completed in {results.latencyMs}ms</span>
                  </div>
                </div>

                <div className={styles.exportBtnGroup}>
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={handleExportCSV}
                    title="Export as CSV spreadsheet"
                  >
                    <Download size={12} />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={handleExportJSON}
                    title="Export as JSON payload"
                  >
                    <Download size={12} />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              <div className={styles.resultsList}>
                {results.results.map((r, idx) => (
                  <div
                    key={idx}
                    className={`${styles.resultItem} ${r.has_answer ? styles.resultAnswered : styles.resultUnanswered}`}
                  >
                    <div className={styles.resultQ}>
                      <span className={styles.resultQNum}>
                        {formatQNum(idx)}
                      </span>
                      <span className={styles.resultQText}>{r.question}</span>
                    </div>

                    {r.has_answer ? (
                      <div className={styles.resultAnswer}>
                        <div className={styles.answerTextWrap}>
                          <span className={styles.answerTag}>Answer:</span>
                          <span className={styles.answerText}>{r.answer}</span>
                        </div>
                        <div className={styles.scoreGaugeWrap}>
                          <ConfidenceGauge score={r.score} />
                          <span className={styles.scoreNumber}>{Math.round(r.score * 100)}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.noAnswer}>
                        <AlertCircle size={13} className={styles.noAnswerIcon} />
                        <span>No supported answer in passage (Model abstained)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorCard}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Empty State when no results yet */}
          {!results && !loading && !error && (
            <div className={styles.emptyResultsCard}>
              <div className={styles.emptyIconPulse}>
                <Layers size={32} className={styles.emptyIcon} />
              </div>
              <h3 className={styles.emptyTitle}>Batch Pipeline Standing By</h3>
              <p className={styles.emptyDesc}>
                Enter your questions on the left and click "Execute Batch Inference".
                The PyTorch engine runs all queries concurrently against the passage.
              </p>
              <button
                type="button"
                className={styles.quickRunBtn}
                onClick={handleRunBulk}
              >
                <Play size={13} />
                <span>Execute Batch with Sample Questions</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
