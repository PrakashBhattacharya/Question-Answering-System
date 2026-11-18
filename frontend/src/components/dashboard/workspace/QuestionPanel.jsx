import React, { useState, useRef } from 'react'
import {
  HelpCircle, ArrowRight, Loader2, Sparkles, CornerDownLeft, Mic, MicOff,
  Terminal, Command, Cpu, Compass, BookOpen, Layers
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import styles from './QuestionPanel.module.css'

const QUESTION_TEMPLATES = [
  { type: 'DEFINITION', query: 'What is the primary definition and role of the subject?' },
  { type: 'COMPARISON', query: 'How does this compare to standard baseline approaches?' },
  { type: 'CAUSE / EFFECT', query: 'Why did the reported outcome occur under these conditions?' },
  { type: 'FACT / METRIC', query: 'What exact numerical score or threshold was achieved?' },
]

export default function QuestionPanel({
  question,
  onChangeQuestion,
  onSubmit,
  loading,
  suggestedQuestions = [],
  onSelectSuggestion,
  model = 'bert',
  onChangeModel,
  contextLength = 0,
}) {
  const { theme } = useTheme()
  const isImperium = theme === 'imperium'
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const MODEL_OPTIONS = [
    { key: 'deberta',       label: 'DeBERTa-v3', badge: '88.4% F1 · SOTA' },
    { key: 'roberta-large', label: 'RoBERTa-L',  badge: '88.1% F1' },
    { key: 'roberta',       label: 'RoBERTa',    badge: '80.1% F1' },
    { key: 'bert',          label: 'BERT',       badge: '74.8% F1' },
    { key: 'distilbert',    label: 'DistilBERT', badge: '77.0% F1' },
  ]

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onChangeQuestion(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  return (
    <div className={styles.container}>
      {/* ── Console Header ────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.consolePromptBadge}>
            <Terminal size={13} className={styles.promptIcon} />
            <span className={styles.promptText}>ASK CONTEXTIQ</span>
          </div>
          <span className={styles.modeTag}>MODE: EXTRACTIVE QA</span>
        </div>

        {/* Model Selector */}
        {onChangeModel && (
          <div className={styles.modelSelector}>
            {MODEL_OPTIONS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`${styles.modelBtn} ${model === m.key ? styles.modelBtnActive : ''}`}
                onClick={() => onChangeModel(m.key)}
                title={`Use ${m.label} checkpoint (${m.badge})`}
                disabled={loading}
              >
                <span>{m.label}</span>
                <span className={styles.modelBadge}>{m.badge}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Question Templates (shown when empty or suggestions available) ── */}
      {!question && (
        <div className={styles.templateCardsRow}>
          {QUESTION_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.templateCard}
              onClick={() => onChangeQuestion(tmpl.query)}
              disabled={loading}
            >
              <span className={styles.templateType}>{tmpl.type}</span>
              <span className={styles.templateText}>{tmpl.query}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Command Console Box ───────────────────────────────── */}
      <div className={styles.inputCard}>
        <div className={styles.inputWrap}>
          <textarea
            id="question-input"
            rows={2}
            className={styles.input}
            placeholder={isImperium ? 'Inquire the royal intelligence model...' : 'What is the main contribution or answer from this context?'}
            value={question}
            onChange={(e) => onChangeQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="off"
            spellCheck="false"
          />

          <button
            type="button"
            className={`${styles.voiceBtn} ${isListening ? styles.voiceBtnActive : ''}`}
            onClick={handleVoiceInput}
            title={isListening ? 'Stop voice input' : 'Start voice input (Speech-to-Text)'}
            disabled={loading}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            {isListening && <span className={styles.voicePulse} />}
          </button>
        </div>

        {/* Suggested chips */}
        {suggestedQuestions.length > 0 && (
          <div className={styles.suggestionsWrap}>
            <span className={styles.suggestionsLabel}>Context Prompts:</span>
            <div className={styles.suggestionChips}>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.suggestionChip}
                  onClick={() => onSelectSuggestion(q)}
                  disabled={loading}
                >
                  <Sparkles size={11} className={styles.sparkleIcon} />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Console Telemetry Footer */}
        <div className={styles.actionBar}>
          <div className={styles.consoleMetaStrip}>
            <span className={styles.metaChip}>
              Chars: <code>{question.length}</code>
            </span>
            <span className={styles.metaDivider}>•</span>
            <span className={styles.metaChip}>
              Context: <code>{contextLength > 0 ? `${contextLength} chars` : 'Loaded'}</code>
            </span>
            <span className={styles.metaDivider}>•</span>
            <div className={styles.keyHint}>
              <Command size={10} />
              <span>/ Ctrl + ↵ to Execute</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={onSubmit}
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={15} className={styles.spinner} />
                <span>Running Inference...</span>
              </>
            ) : (
              <>
                <span>Run Analysis</span>
                <ArrowRight size={14} className={styles.btnArrow} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
