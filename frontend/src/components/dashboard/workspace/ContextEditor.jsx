import React, { useRef, useState, useEffect } from 'react'
import {
  UploadCloud, Clipboard, Trash2, Maximize2, Minimize2,
  FileText, Sparkles, Check, Hash, Cpu, Loader2, Globe, X, Compass
} from 'lucide-react'
import { extractTextFromFile, SUPPORTED_ACCEPT_STRING } from '../../../services/documentExtractor'
import { urlApi } from '../../../services/api'
import styles from './ContextEditor.module.css'

export const EXAMPLE_CONTEXTS = [
  {
    id: 'spacex',
    title: 'SpaceX Starship',
    emoji: '🚀',
    category: 'Aerospace',
    context: `Starship is a fully reusable, super heavy-lift launch vehicle developed by SpaceX. Standing at 121 meters (397 feet) tall with both stages combined, it is the tallest and most powerful launch vehicle ever flown. The vehicle consists of the Super Heavy first-stage booster powered by 33 Raptor engines, and the Starship second-stage spacecraft powered by 6 Raptor engines (3 sea-level and 3 vacuum-optimized). Fueled by liquid methane and liquid oxygen (methalox), Starship is engineered to transport crew and cargo to Earth orbit, the Moon, Mars, and beyond.`,
    sampleQuestions: [
      'How tall is Starship with both stages combined?',
      'How many Raptor engines power the Super Heavy booster?',
      'What propellants fuel the Starship launch vehicle?',
    ],
  },
  {
    id: 'apollo11',
    title: 'Apollo 11',
    emoji: '🌕',
    category: 'History',
    context: `Apollo 11 was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC, and Armstrong became the first person to step onto the Moon's surface six hours and 39 minutes later, on July 21 at 02:56 UTC. Aldrin joined him 19 minutes later, and they spent about two and a quarter hours together exploring the site they had named Tranquility Base upon landing. Armstrong and Aldrin collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth as pilot Michael Collins flew the Command Module Columbia in lunar orbit. The mission effectively ended the Space Race and fulfilled a national goal proposed in 1961 by President John F. Kennedy.`,
    sampleQuestions: [
      'When was the first moon landing?',
      'Who was the commander of Apollo 11?',
      'How much lunar material did the astronauts collect?',
    ],
  },
  {
    id: 'quantum',
    title: 'Quantum Computing',
    emoji: '⚛',
    category: 'Physics',
    context: `Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers. While classical computers encode information into binary bits that can either be 0 or 1, quantum computers use quantum bits or qubits. Qubits exploit quantum superposition and entanglement, enabling them to evaluate multidimensional computational spaces simultaneously. Key applications include Shor's algorithm for prime factorization, Grover's algorithm for unstructured database search, and quantum molecular simulations for pharmaceutical drug discovery.`,
    sampleQuestions: [
      'What do quantum computers use instead of binary bits?',
      'What quantum mechanical properties do qubits exploit?',
      'Which algorithm is used for prime factorization in quantum computing?',
    ],
  },
  {
    id: 'squad2',
    title: 'SQuAD 2.0',
    emoji: '📄',
    category: 'Benchmark',
    context: `The Stanford Question Answering Dataset (SQuAD 2.0) combines the 100,000 questions in SQuAD 1.1 with over 50,000 unanswerable questions written adversarially by crowdworkers to look similar to answerable ones. To do well on SQuAD 2.0, systems must not only answer questions when possible, but also determine when no answer is supported by the paragraph and abstain from answering. ContextIQ utilizes deepset/roberta-base-squad2, fine-tuned specifically to recognize impossible answer scenarios by evaluating [CLS] token logits against a null-score threshold.`,
    sampleQuestions: [
      'How many unanswerable questions are included in SQuAD 2.0?',
      'What model does ContextIQ utilize?',
      'How does the model identify impossible answer scenarios?',
    ],
  },
]

export default function ContextEditor({
  context,
  onChangeContext,
  onSelectExample,
  activeExampleId,
  onAddToast,
  isExpanded,
  onToggleExpand,
  highlightRange,
}) {
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const [extracting, setExtracting] = useState(false)
  const [extractMsg, setExtractMsg] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)

  useEffect(() => {
    if (
      highlightRange &&
      typeof highlightRange.start === 'number' &&
      typeof highlightRange.end === 'number' &&
      textareaRef.current
    ) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(highlightRange.start, highlightRange.end)
      // Scroll to selection
      const textBefore = (context || '').slice(0, highlightRange.start)
      const lineCount = (textBefore.match(/\n/g) || []).length
      const lineHeight = 22
      textareaRef.current.scrollTop = Math.max(0, lineCount * lineHeight - 50)
    }
  }, [highlightRange, context])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExtracting(true)
    setExtractMsg(`Reading ${file.name}…`)

    try {
      const result = await extractTextFromFile(file, (p) => {
        setExtractMsg(p.message || 'Processing…')
      })

      onChangeContext(result.text)
      if (onAddToast) {
        const typeLabel = result.type === 'image' ? 'Image OCR' : result.type.toUpperCase()
        onAddToast({
          type: 'success',
          title: `${typeLabel} Extracted`,
          message: `Loaded ${result.characterCount.toLocaleString()} chars from "${result.filename}"`,
        })
      }
    } catch (err) {
      if (onAddToast) {
        onAddToast({
          type: 'error',
          title: 'Extraction Failed',
          message: err.message || 'Could not extract text from the file.',
        })
      }
    } finally {
      setExtracting(false)
      setExtractMsg('')
      e.target.value = ''
    }
  }

  const handleFetchUrl = async () => {
    if (!urlValue.trim()) return
    setFetchingUrl(true)
    try {
      const result = await urlApi.fetch(urlValue.trim())
      onChangeContext(result.text)
      setShowUrlInput(false)
      setUrlValue('')
      if (onAddToast) {
        onAddToast({
          type: 'success',
          title: 'URL Fetched',
          message: `Loaded ${result.word_count.toLocaleString()} words from "${result.title || urlValue}"`,
        })
      }
    } catch (err) {
      if (onAddToast) {
        onAddToast({
          type: 'error',
          title: 'URL Fetch Failed',
          message: err.message || 'Could not fetch content from this URL.',
        })
      }
    } finally {
      setFetchingUrl(false)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        onChangeContext(text)
        if (onAddToast) {
          onAddToast({
            type: 'info',
            title: 'Pasted from Clipboard',
            message: `Added ${text.length.toLocaleString()} characters to context.`,
          })
        }
      }
    } catch {
      if (onAddToast) {
        onAddToast({
          type: 'error',
          title: 'Clipboard Permission Denied',
          message: 'Please paste directly into the textarea using Ctrl + V.',
        })
      }
    }
  }

  const handleClear = () => {
    onChangeContext('')
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'Context Cleared',
        message: 'Editor reset to blank state.',
      })
    }
  }

  // Calculate approximate token count (~4 characters per subword token)
  const approxTokens = Math.round(context.length / 4)
  const maxTokens = 7680 // 15x expanded capacity (512 * 15 = 7,680 tokens, ~30,720 chars)
  const tokenPercentage = Math.min(Math.round((approxTokens / maxTokens) * 100), 100)

  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}>
      {/* Hidden file input supporting PDF, PNG/images, Word, and text */}
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_ACCEPT_STRING}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Panel header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.stepBadge}>01</span>
          <div>
            <h2 className={styles.title}>CONTEXT PASSAGE</h2>
            <p className={styles.description}>
              Source document for extractive QA. Answers are strictly bounded within this text.
            </p>
          </div>
        </div>

        <div className={styles.headerControls}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={extracting}
            title="Upload document or image (.pdf, .png, .jpg, .docx, .txt)"
          >
            {extracting ? (
              <>
                <Loader2 size={13} className={styles.spinIcon} />
                <span>Extracting…</span>
              </>
            ) : (
              <>
                <UploadCloud size={13} />
                <span>Upload</span>
              </>
            )}
          </button>

          <button
            type="button"
            className={`${styles.toolBtn} ${showUrlInput ? styles.toolBtnActive : ''}`}
            onClick={() => setShowUrlInput(!showUrlInput)}
            title="Fetch context from a public URL"
          >
            <Globe size={13} />
            <span>URL</span>
          </button>

          <button
            type="button"
            className={styles.toolBtn}
            onClick={handlePaste}
            title="Paste text from clipboard"
          >
            <Clipboard size={13} />
            <span>Paste</span>
          </button>
          {context && (
            <button
              type="button"
              className={styles.toolBtnClear}
              onClick={handleClear}
              title="Clear context editor"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
          <button
            type="button"
            className={styles.toolBtnIcon}
            onClick={onToggleExpand}
            title={isExpanded ? 'Collapse editor' : 'Expand editor'}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* URL Fetch Input Bar */}
      {showUrlInput && (
        <div className={styles.urlBar}>
          <Globe size={14} className={styles.urlBarIcon} />
          <input
            type="url"
            className={styles.urlInput}
            placeholder="https://en.wikipedia.org/wiki/Apollo_11"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFetchUrl()
              if (e.key === 'Escape') { setShowUrlInput(false); setUrlValue('') }
            }}
            autoFocus
            disabled={fetchingUrl}
          />
          <button
            type="button"
            className={styles.urlFetchBtn}
            onClick={handleFetchUrl}
            disabled={fetchingUrl || !urlValue.trim()}
          >
            {fetchingUrl ? <Loader2 size={13} className={styles.spinIcon} /> : <span>Fetch</span>}
          </button>
          <button
            type="button"
            className={styles.urlCancelBtn}
            onClick={() => { setShowUrlInput(false); setUrlValue('') }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Live Extraction Status Banner */}
      {extracting && (
        <div className={styles.extractBanner}>
          <Loader2 size={14} className={styles.spinIcon} />
          <span>{extractMsg || 'Extracting content from document…'}</span>
        </div>
      )}

      {/* Editor Body */}
      <div className={styles.editorWrap}>
        <textarea
          ref={textareaRef}
          id="context-input"
          className={styles.textarea}
          placeholder="Paste your context passage here, upload a document, fetch from a URL, or select one of the pre-loaded examples below..."
          value={context}
          onChange={(e) => onChangeContext(e.target.value)}
          rows={isExpanded ? 16 : 8}
          aria-label="Context passage for question answering"
          spellCheck="false"
        />
      </div>

      {/* Visual Context Capacity & Meta Bar */}
      <div className={styles.metaRow}>
        <div className={styles.formatPill}>
          <FileText size={12} className={styles.metaPillIcon} />
          <span>Plain Text Passage</span>
          <span className={styles.metaTag}>UTF-8</span>
        </div>

        <div className={styles.capacityVisual}>
          <div className={styles.capacityText}>
            <span className={styles.capacityLabel}>BERT WINDOW:</span>
            <span className={styles.capacityVal}>
              <code>~{approxTokens.toLocaleString()}</code> / {maxTokens.toLocaleString()} tokens ({tokenPercentage}%)
            </span>
          </div>
          <div className={styles.capacityTrack}>
            <div
              className={`${styles.capacityFill} ${
                tokenPercentage > 90 ? styles.capacityFillWarn : ''
              }`}
              style={{ width: `${tokenPercentage}%` }}
            />
          </div>
        </div>

        <div className={styles.statsWrap}>
          <span className={styles.statItem}>
            <code>{context.length.toLocaleString()}</code> chars
          </span>
        </div>
      </div>

      {/* Example selector chips */}
      <div className={styles.examplesBar}>
        <div className={styles.examplesLabelWrap}>
          <Sparkles size={13} className={styles.sparkleIcon} />
          <span className={styles.examplesLabel}>Verified Presets:</span>
        </div>
        <div className={styles.examplePills}>
          {EXAMPLE_CONTEXTS.map((ex) => {
            const isSelected = activeExampleId === ex.id

            return (
              <button
                key={ex.id}
                type="button"
                className={`${styles.exampleChip} ${isSelected ? styles.exampleChipActive : ''}`}
                onClick={() => onSelectExample(ex)}
              >
                <span className={styles.emoji}>{ex.emoji}</span>
                <span className={styles.chipTitle}>{ex.title}</span>
                <span className={styles.chipCategory}>{ex.category}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
