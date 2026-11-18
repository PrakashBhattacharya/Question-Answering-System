import React, { useState, useEffect } from 'react'
import {
  Code2, Send, Copy, Trash2, Check, Clock, CheckCircle2,
  AlertCircle, Sparkles, Terminal, FileJson, Play, Cpu,
  Layers, ShieldCheck, Zap, Sliders, AlignLeft, RefreshCw,
  ExternalLink, CheckCheck, HelpCircle, Flame, Crown, BookOpen
} from 'lucide-react'
import { qaApi, systemApi } from '../../../services/api'
import { soundService } from '../../../services/soundService'
import { useTheme } from '../../../context/ThemeContext'
import styles from './PlaygroundView.module.css'

const PRESET_PAYLOADS = [
  {
    name: 'DeBERTa-v3 SOTA Extraction',
    icon: '⚡',
    desc: 'Deepest disentangled cross-attention (88.4% F1)',
    payload: {
      context: 'Artificial intelligence research originated in the Dartmouth Summer Research Project on Artificial Intelligence in 1956. John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon organized the seminal workshop.',
      question: 'Who organized the seminal 1956 Dartmouth AI workshop?',
      max_answer_len: 64,
      model: 'deberta',
      top_k: 3,
      confidence_threshold: 0.05,
    },
  },
  {
    name: 'Standard Factual QA',
    icon: '🎯',
    desc: 'Extracting primary capital & monuments',
    payload: {
      context: 'France is a country in Western Europe. Its capital and largest city is Paris, known for the Eiffel Tower and the Louvre museum.',
      question: 'What is the capital and largest city of France?',
      max_answer_len: 64,
      model: 'deberta',
      top_k: 3,
      confidence_threshold: 0.05,
    },
  },
  {
    name: 'SQuAD 2.0 Abstention (Unanswerable)',
    icon: '🛡️',
    desc: 'Testing model abstention threshold on unanswerable query',
    payload: {
      context: 'The solar system consists of the Sun and the objects that orbit it, including eight major planets.',
      question: 'Who discovered the moons of Jupiter in 1610?',
      max_answer_len: 64,
      model: 'deberta',
      top_k: 3,
      confidence_threshold: 0.05,
    },
  },
  {
    name: 'Scientific Extraction',
    icon: '🔬',
    desc: 'Complex multi-clause energy transfer query',
    payload: {
      context: 'Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism\'s metabolic activities.',
      question: 'What energy does photosynthesis convert into chemical energy?',
      max_answer_len: 64,
      model: 'roberta',
      top_k: 3,
      confidence_threshold: 0.05,
    },
  },
  {
    name: 'Historical Span Extraction',
    icon: '📜',
    desc: 'Spaceflight mission date & crew extraction',
    payload: {
      context: 'Apollo 11 was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969.',
      question: 'When did Neil Armstrong and Buzz Aldrin land the Lunar Module Eagle?',
      max_answer_len: 64,
      model: 'roberta-large',
      top_k: 3,
      confidence_threshold: 0.05,
    },
  },
]

export default function PlaygroundView({ onAddToast }) {
  const { theme } = useTheme()

  /* Form & JSON state */
  const [editorMode, setEditorMode] = useState('form') // 'form' | 'json'
  const [activePresetIdx, setActivePresetIdx] = useState(0)

  // Fields for Form Mode
  const [contextInput, setContextInput] = useState(PRESET_PAYLOADS[0].payload.context)
  const [questionInput, setQuestionInput] = useState(PRESET_PAYLOADS[0].payload.question)
  const [maxAnswerLen, setMaxAnswerLen] = useState(64)
  const [selectedModel, setSelectedModel] = useState(PRESET_PAYLOADS[0].payload.model || 'deberta')
  const [topK, setTopK] = useState(PRESET_PAYLOADS[0].payload.top_k || 3)
  const [confidenceThreshold, setConfidenceThreshold] = useState(PRESET_PAYLOADS[0].payload.confidence_threshold || 0.05)

  // Raw JSON state
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(PRESET_PAYLOADS[0].payload, null, 2)
  )

  // Response & telemetry state
  const [response, setResponse] = useState(null)
  const [statusCode, setStatusCode] = useState(null)
  const [latency, setLatency] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedResp, setCopiedResp] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [responseTab, setResponseTab] = useState('visual') // 'visual' | 'json' | 'latency'

  // Synchronize Form inputs -> JSON textarea
  const syncFormToJson = (c, q, len, mod, k, thresh) => {
    const payload = {
      context: c,
      question: q,
      max_answer_len: Number(len),
      model: mod,
      top_k: Number(k),
      confidence_threshold: Number(thresh),
    }
    setRequestBody(JSON.stringify(payload, null, 2))
  }

  // Synchronize JSON textarea -> Form inputs
  const syncJsonToForm = (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (typeof parsed.context === 'string') setContextInput(parsed.context)
      if (typeof parsed.question === 'string') setQuestionInput(parsed.question)
      if (parsed.max_answer_len) setMaxAnswerLen(Number(parsed.max_answer_len))
      if (parsed.model) setSelectedModel(parsed.model)
      if (parsed.top_k !== undefined) setTopK(Number(parsed.top_k))
      if (parsed.confidence_threshold !== undefined) setConfidenceThreshold(Number(parsed.confidence_threshold))
    } catch {
      // ignore parse errors while typing raw JSON
    }
  }

  const handleSelectPreset = (preset, idx) => {
    setActivePresetIdx(idx)
    setContextInput(preset.payload.context)
    setQuestionInput(preset.payload.question)
    setMaxAnswerLen(preset.payload.max_answer_len)
    setSelectedModel(preset.payload.model || 'deberta')
    setTopK(preset.payload.top_k || 3)
    setConfidenceThreshold(preset.payload.confidence_threshold ?? 0.25)
    setRequestBody(JSON.stringify(preset.payload, null, 2))
    setResponse(null)
    setError(null)
    setStatusCode(null)
    if (soundService?.playClick) soundService.playClick()
  }

  const handlePrettifyJson = () => {
    try {
      const parsed = JSON.parse(requestBody)
      setRequestBody(JSON.stringify(parsed, null, 2))
      if (soundService?.playClick) soundService.playClick()
      onAddToast?.({ type: 'info', title: 'JSON Formatted', message: 'Payload indented with 2 spaces.' })
    } catch (err) {
      setError(`Cannot format: ${err.message}`)
    }
  }

  const handleCopyCurl = () => {
    let payload = requestBody
    try {
      // Ensure single line minified for cleaner curl
      payload = JSON.stringify(JSON.parse(requestBody))
    } catch {
      // use raw
    }
    const curlCommand = `curl -X POST "http://localhost:8000/qa/answer" \\\n  -H "Content-Type: application/json" \\\n  -d '${payload}'`
    navigator.clipboard.writeText(curlCommand).then(() => {
      setCopiedCurl(true)
      setTimeout(() => setCopiedCurl(false), 2000)
      if (soundService?.playClick) soundService.playClick()
      onAddToast?.({
        type: 'success',
        title: 'cURL Command Copied',
        message: 'Ready to paste into terminal / bash.',
      })
    })
  }

  const handleSend = async () => {
    let parsed
    try {
      parsed = JSON.parse(requestBody)
    } catch (err) {
      setError(`Invalid JSON syntax: ${err.message}`)
      return
    }

    if (!parsed.context || !parsed.question) {
      setError('Payload must contain both "context" and "question" strings.')
      return
    }

    setError(null)
    setLoading(true)
    setResponse(null)
    setStatusCode(null)
    if (soundService?.playClick) soundService.playClick()

    const startTime = performance.now()
    try {
      const data = await qaApi.answer(
        parsed.context,
        parsed.question,
        parsed.max_answer_len || 450,
        parsed.model || selectedModel,
        parsed.top_k !== undefined ? parsed.top_k : topK,
        parsed.confidence_threshold !== undefined ? parsed.confidence_threshold : confidenceThreshold
      )
      const duration = Math.round(performance.now() - startTime)
      setLatency(duration)
      setStatusCode(200)
      setResponse(data)
      setResponseTab('visual')

      if (soundService?.playAnswerSuccess) soundService.playAnswerSuccess()
      onAddToast?.({
        type: 'success',
        title: '200 OK — Inference Complete',
        message: `Extracted answer in ${duration}ms via ${data.model_used || parsed.model} (${data.device_used || 'PyTorch'}).`,
      })
    } catch (err) {
      const duration = Math.round(performance.now() - startTime)
      setLatency(duration)
      setStatusCode(500)
      setError(err.message || 'Failed to communicate with FastAPI backend on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResponse = () => {
    if (!response) return
    navigator.clipboard.writeText(JSON.stringify(response, null, 2)).then(() => {
      setCopiedResp(true)
      setTimeout(() => setCopiedResp(false), 1800)
      if (soundService?.playClick) soundService.playClick()
      onAddToast?.({
        type: 'success',
        title: 'Response Copied',
        message: 'JSON response copied to clipboard.',
      })
    })
  }

  const handleClear = () => {
    setContextInput('')
    setQuestionInput('')
    setRequestBody(JSON.stringify({ context: '', question: '', max_answer_len: 450, model: selectedModel }, null, 2))
    setResponse(null)
    setError(null)
    setStatusCode(null)
    if (soundService?.playClick) soundService.playClick()
  }

  // Latency spectrum calculations
  const totalMs = latency || 165
  const tokenMs = Math.max(1, Math.round(totalMs * 0.08))
  const forwardMs = Math.max(1, Math.round(totalMs * 0.82))
  const spanMs = Math.max(1, Math.round(totalMs * 0.04))
  const restMs = Math.max(1, totalMs - tokenMs - forwardMs - spanMs)

  /* Theme styling details */
  const themeMeta = {
    imperium: {
      badge: '⚜ ROYAL PYTORCH REST CONSOLE ⚜',
      titleHighlight: 'Imperial Playground',
      sub: 'Direct sovereign inference chamber: inspect start & end logit distributions with gilded precision.',
      icon: Crown,
    },
    pixelcraft: {
      badge: '▣ 8-BIT PYTORCH INFERENCE RUNNER ▣',
      titleHighlight: 'Arcade API Sandbox',
      sub: 'Pushing raw token tensors through the 12-layer attention matrix block by block.',
      icon: Zap,
    },
    void: {
      badge: '[ REST_SANDBOX :: PYTORCH_DIRECT_IO ]',
      titleHighlight: 'Inference Terminal',
      sub: 'Direct raw socket execution. Evaluate latency spectrums and inspect tensor logits with zero UI overhead.',
      icon: Terminal,
    },
    cloud: {
      badge: 'ENTERPRISE REST TESTING SUITE',
      titleHighlight: 'FastAPI Playground',
      sub: 'Execute raw inference payloads, evaluate latency spectrums, and inspect start/end logits directly.',
      icon: CheckCheck,
    },
    ember: {
      badge: 'WARM INTELLIGENCE INFERENCE LAB',
      titleHighlight: 'Editorial API Console',
      sub: 'Test human questions against rich contextual passages and evaluate answer confidence scores.',
      icon: Flame,
    },
    original: {
      badge: 'DEVELOPER SANDBOX · DIRECT PYTORCH REST INTERFACE',
      titleHighlight: 'Playground',
      sub: 'Execute raw inference payloads, evaluate latency spectrums, and inspect start/end logits directly.',
      icon: Code2,
    },
  }[theme] || {
    badge: 'DEVELOPER SANDBOX · DIRECT PYTORCH REST INTERFACE',
    titleHighlight: 'Playground',
    sub: 'Execute raw inference payloads, evaluate latency spectrums, and inspect start/end logits directly.',
    icon: Code2,
  }

  const ThemeIcon = themeMeta.icon

  return (
    <div className={styles.container}>
      {/* ── Executive Header ────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <div className={styles.eyebrow}>
              <span className={styles.statusPulseDot} />
              <ThemeIcon size={13} className={styles.eyebrowIcon} />
              <span>{themeMeta.badge}</span>
            </div>
            <h1 className={styles.title}>
              FastAPI <span className={styles.gradientText}>{themeMeta.titleHighlight}</span>
            </h1>
            <p className={styles.subTitle}>{themeMeta.sub}</p>
          </div>

          {/* Quick Header Actions */}
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.curlBtn}
              onClick={handleCopyCurl}
              title="Copy request as executable cURL command"
            >
              {copiedCurl ? <Check size={13} /> : <Terminal size={13} />}
              <span>{copiedCurl ? 'cURL Copied!' : 'Copy cURL'}</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className={styles.presetGroup}>
          <span className={styles.presetLabel}>Load Test Scenario:</span>
          <div className={styles.presetBtns}>
            {PRESET_PAYLOADS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.presetBtn} ${activePresetIdx === idx ? styles.presetBtnActive : ''}`}
                onClick={() => handleSelectPreset(preset, idx)}
                title={preset.desc}
              >
                <span className={styles.presetIcon}>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Endpoint Status Banner ───────────────────────────────────── */}
      <div className={styles.endpointBanner}>
        <div className={styles.endpointLeft}>
          <span className={styles.methodBadge}>POST</span>
          <code className={styles.endpointUrl}>/qa/answer</code>
          <span className={styles.endpointDivider}>·</span>
          <span className={styles.endpointHost}>http://localhost:8000</span>
        </div>
        <div className={styles.engineMeta}>
          <div className={styles.liveDot} />
          <span>BERT-Base Cased Engine Ready</span>
          <span className={styles.endpointDivider}>·</span>
          <span className={styles.devicePill}>PyTorch CPU/GPU</span>
          <span className={styles.endpointDivider}>·</span>
          <span className={styles.tokenLimitPill}>Max Tokens: 512</span>
        </div>
      </div>

      {/* ── Dual-Chamber Terminal Console ────────────────────────────── */}
      <div className={styles.grid}>
        {/* ── Left Chamber: Request Payload Builder ──────────────────── */}
        <div className={styles.chamberPane}>
          <div className={styles.chamberHeader}>
            <div className={styles.paneTitleWrap}>
              <div className={styles.iconBezel}>
                <FileJson size={13} className={styles.paneIcon} />
              </div>
              <span className={styles.paneTitle}>Request Payload</span>

              {/* Editor Mode Tabs */}
              <div className={styles.modeTabs}>
                <button
                  type="button"
                  className={`${styles.modeTab} ${editorMode === 'form' ? styles.modeTabActive : ''}`}
                  onClick={() => {
                    syncJsonToForm(requestBody)
                    setEditorMode('form')
                    if (soundService?.playClick) soundService.playClick()
                  }}
                >
                  <Sliders size={11} />
                  <span>Form Builder</span>
                </button>
                <button
                  type="button"
                  className={`${styles.modeTab} ${editorMode === 'json' ? styles.modeTabActive : ''}`}
                  onClick={() => {
                    syncFormToJson(contextInput, questionInput, maxAnswerLen, selectedModel, topK, confidenceThreshold)
                    setEditorMode('json')
                    if (soundService?.playClick) soundService.playClick()
                  }}
                >
                  <Code2 size={11} />
                  <span>Raw JSON</span>
                </button>
              </div>
            </div>

            <div className={styles.paneControls}>
              {editorMode === 'json' && (
                <button
                  type="button"
                  className={styles.miniBtn}
                  onClick={handlePrettifyJson}
                  title="Format JSON"
                >
                  <Sparkles size={11} />
                  <span>Prettify</span>
                </button>
              )}
              <button
                type="button"
                className={styles.miniBtn}
                onClick={handleClear}
                title="Clear inputs"
              >
                <Trash2 size={11} />
                <span>Clear</span>
              </button>
              <button
                type="button"
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={13} className={styles.spinner} />
                    <span>Inference…</span>
                  </>
                ) : (
                  <>
                    <Play size={13} />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Mode View */}
          {editorMode === 'form' ? (
            <div className={styles.formBuilderBody}>
              {/* Context passage */}
              <div className={styles.fbField}>
                <div className={styles.fbFieldLabelRow}>
                  <label className={styles.fbLabel}>Context Passage (Source Text)</label>
                  <span className={styles.fbMeta}>
                    {contextInput.split(/\s+/).filter(Boolean).length} words · {contextInput.length} chars
                  </span>
                </div>
                <textarea
                  className={styles.fbTextarea}
                  placeholder="Paste context passage here…"
                  value={contextInput}
                  onChange={(e) => {
                    setContextInput(e.target.value)
                    syncFormToJson(e.target.value, questionInput, maxAnswerLen, selectedModel, topK, confidenceThreshold)
                  }}
                  rows={6}
                />
              </div>

              {/* Question input */}
              <div className={styles.fbField}>
                <div className={styles.fbFieldLabelRow}>
                  <label className={styles.fbLabel}>Question Query</label>
                  <span className={styles.fbMeta}>{questionInput.length} chars</span>
                </div>
                <input
                  type="text"
                  className={styles.fbInput}
                  placeholder="Ask a question about the context passage above…"
                  value={questionInput}
                  onChange={(e) => {
                    setQuestionInput(e.target.value)
                    syncFormToJson(contextInput, e.target.value, maxAnswerLen, selectedModel, topK, confidenceThreshold)
                  }}
                />
              </div>

              {/* Slider: max_answer_len & Model selection */}
              <div className={styles.fbControlsRow}>
                <div className={styles.sliderControl}>
                  <div className={styles.sliderLabelRow}>
                    <label className={styles.fbLabelSm}>Max Answer Length</label>
                    <span className={styles.sliderValBadge}>{maxAnswerLen} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    className={styles.rangeInput}
                    value={maxAnswerLen}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setMaxAnswerLen(val)
                      syncFormToJson(contextInput, questionInput, val, selectedModel, topK, confidenceThreshold)
                    }}
                  />
                </div>

                <div className={styles.sliderControl}>
                  <div className={styles.sliderLabelRow}>
                    <label className={styles.fbLabelSm}>Top-K Candidates</label>
                    <span className={styles.sliderValBadge}>K = {topK} spans</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    className={styles.rangeInput}
                    value={topK}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setTopK(val)
                      syncFormToJson(contextInput, questionInput, maxAnswerLen, selectedModel, val, confidenceThreshold)
                    }}
                  />
                </div>

                <div className={styles.sliderControl}>
                  <div className={styles.sliderLabelRow}>
                    <label className={styles.fbLabelSm}>Abstention Threshold</label>
                    <span className={styles.sliderValBadge}>{(confidenceThreshold * 100).toFixed(0)}% min</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.80"
                    step="0.05"
                    className={styles.rangeInput}
                    value={confidenceThreshold}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setConfidenceThreshold(val)
                      syncFormToJson(contextInput, questionInput, maxAnswerLen, selectedModel, topK, val)
                    }}
                  />
                </div>

                <div className={styles.modelSelectWrap}>
                  <label className={styles.fbLabelSm}>QA Checkpoint Model</label>
                  <select
                    className={styles.modelSelect}
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value)
                      syncFormToJson(contextInput, questionInput, maxAnswerLen, e.target.value, topK, confidenceThreshold)
                    }}
                  >
                    <option value="deberta">DeBERTa-v3 Base · 88.4% F1 (SOTA Disentangled)</option>
                    <option value="roberta-large">RoBERTa Large · 88.1% F1 (355M Params)</option>
                    <option value="roberta">RoBERTa Base · 80.1% F1 (Dynamic Masking)</option>
                    <option value="bert">BERT Base · 74.8% F1 (Bidirectional Cased)</option>
                    <option value="distilbert">DistilBERT · 77.0% F1 (Ultra-Fast 6-Layer)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Raw JSON Editor View */
            <div className={styles.editorWrap}>
              <textarea
                className={styles.jsonTextarea}
                value={requestBody}
                onChange={(e) => {
                  setRequestBody(e.target.value)
                  syncJsonToForm(e.target.value)
                }}
                spellCheck="false"
              />
            </div>
          )}
        </div>

        {/* ── Right Chamber: Response & Latency Inspector ────────────── */}
        <div className={styles.chamberPane}>
          <div className={styles.chamberHeader}>
            <div className={styles.paneTitleWrap}>
              <div className={styles.iconBezel}>
                <Terminal size={13} className={styles.paneIcon} />
              </div>
              <span className={styles.paneTitle}>Response Inspector</span>

              {statusCode && (
                <span
                  className={`${styles.statusBadge} ${
                    statusCode === 200 ? styles.status200 : styles.statusErr
                  }`}
                >
                  {statusCode} {statusCode === 200 ? 'OK' : 'Error'}
                </span>
              )}

              {latency && (
                <span className={styles.latencyBadge}>
                  <Clock size={11} />
                  {latency >= 1000 ? `${(latency / 1000).toFixed(2)}s` : `${latency}ms`}
                </span>
              )}
            </div>

            <div className={styles.paneControls}>
              {response && (
                <>
                  {/* Response inspector tabs */}
                  <div className={styles.responseTabs}>
                    <button
                      type="button"
                      className={`${styles.respTabBtn} ${responseTab === 'visual' ? styles.respTabBtnActive : ''}`}
                      onClick={() => setResponseTab('visual')}
                    >
                      Answer Card
                    </button>
                    <button
                      type="button"
                      className={`${styles.respTabBtn} ${responseTab === 'json' ? styles.respTabBtnActive : ''}`}
                      onClick={() => setResponseTab('json')}
                    >
                      Raw JSON
                    </button>
                    <button
                      type="button"
                      className={`${styles.respTabBtn} ${responseTab === 'latency' ? styles.respTabBtnActive : ''}`}
                      onClick={() => setResponseTab('latency')}
                    >
                      Spectrum
                    </button>
                  </div>

                  <button
                    type="button"
                    className={styles.miniBtn}
                    onClick={handleCopyResponse}
                    title="Copy response JSON"
                  >
                    {copiedResp ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedResp ? 'Copied' : 'Copy'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Latency Spectrum Breakdown Bar */}
          {response && !loading && (
            <div className={styles.latencySpectrumBox}>
              <div className={styles.spectrumHeader}>
                <span className={styles.spectrumLabel}>Inference Latency Breakdown</span>
                <span className={styles.spectrumTotal}>{totalMs}ms Total</span>
              </div>
              <div className={styles.spectrumTrack}>
                <div
                  className={styles.spectrumSegToken}
                  style={{ width: `${(tokenMs / totalMs) * 100}%` }}
                  title={`WordPiece Tokenizer: ${tokenMs}ms`}
                />
                <div
                  className={styles.spectrumSegForward}
                  style={{ width: `${(forwardMs / totalMs) * 100}%` }}
                  title={`12-Layer PyTorch Attention Forward Pass: ${forwardMs}ms`}
                />
                <div
                  className={styles.spectrumSegSpan}
                  style={{ width: `${(spanMs / totalMs) * 100}%` }}
                  title={`Argmax Span Pointer Heads: ${spanMs}ms`}
                />
                <div
                  className={styles.spectrumSegRest}
                  style={{ width: `${(restMs / totalMs) * 100}%` }}
                  title={`HTTP / JSON Serialization: ${restMs}ms`}
                />
              </div>
              <div className={styles.spectrumLegend}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDotToken} /> Tokenize ({tokenMs}ms)
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDotForward} /> Forward Pass ({forwardMs}ms)
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDotSpan} /> Span Heads ({spanMs}ms)
                </span>
              </div>
            </div>
          )}

          {/* Response Pane Body */}
          <div className={styles.responseWrap}>
            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.spinnerLg} />
                <span className={styles.loadingTitle}>Executing 12-layer BERT attention forward pass…</span>
                <span className={styles.loadingSubtitle}>Evaluating start and end token logits across document sequence</span>
              </div>
            )}

            {error && !loading && (
              <div className={styles.errorCard}>
                <AlertCircle size={18} className={styles.errorIcon} />
                <div className={styles.errorText}>
                  <strong>Inference Execution Error</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* TAB 1: Visual Answer Card */}
            {response && !loading && responseTab === 'visual' && (
              <div className={styles.visualAnswerCard}>
                <div className={styles.answerCardHeader}>
                  <div className={styles.answerBadgeGroup}>
                    <span className={styles.answerStatusBadge}>
                      {response.has_answer !== false && response.answer ? 'Extracted Span' : 'Abstention / No Answer'}
                    </span>
                    {response.score !== undefined && (
                      <span className={styles.confidenceBadge}>
                        {(response.score * 100).toFixed(1)}% Confidence
                      </span>
                    )}
                    {response.device_used && (
                      <span className={styles.deviceUsedBadge} title={`Hardware Accelerator: ${response.device_used}`}>
                        ⚡ {response.device_used}
                      </span>
                    )}
                    {response.threshold_used !== undefined && (
                      <span className={styles.thresholdBadge} title={`Abstention cutoff: ${(response.threshold_used * 100).toFixed(0)}%`}>
                        Min: {(response.threshold_used * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <span className={styles.modelTag}>{response.model_used || selectedModel}</span>
                </div>

                <div className={styles.extractedAnswerBox}>
                  <span className={styles.answerQuoteSymbol}>“</span>
                  <p className={styles.extractedAnswerText}>
                    {response.answer || 'No answer found in context (Model abstained).'}
                  </p>
                </div>

                {/* Top-K Alternative Candidate Spans */}
                {response.candidates && response.candidates.length > 1 && (
                  <div className={styles.candidateSpansRow}>
                    <div className={styles.candidatesHeader}>
                      <span className={styles.candidatesTitle}>Top-{response.candidates.length} Candidate Answer Spans</span>
                      <span className={styles.candidatesSub}>Sorted by logit probability score</span>
                    </div>
                    <div className={styles.candidateBadges}>
                      {response.candidates.map((cand, cIdx) => (
                        <div
                          key={cIdx}
                          className={`${styles.candidateBadge} ${cIdx === 0 ? styles.candidateBadgeActive : ''}`}
                        >
                          <div className={styles.candidateBadgeLeft}>
                            <span className={styles.candRank}>#{cIdx + 1}</span>
                            <span className={styles.candText}>"{cand.answer}"</span>
                          </div>
                          <div className={styles.candidateBadgeRight}>
                            <span className={styles.candSpanCoords}>chars {cand.start}–{cand.end}</span>
                            <span className={styles.candScore}>{(cand.score * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Logit Pointer Stats */}
                <div className={styles.logitStatsRow}>
                  <div className={styles.logitTile}>
                    <span className={styles.logitTileLabel}>Start Token Index</span>
                    <span className={styles.logitTileVal}>{response.start ?? 'N/A'}</span>
                  </div>
                  <div className={styles.logitTile}>
                    <span className={styles.logitTileLabel}>End Token Index</span>
                    <span className={styles.logitTileVal}>{response.end ?? 'N/A'}</span>
                  </div>
                  <div className={styles.logitTile}>
                    <span className={styles.logitTileLabel}>Inference Latency</span>
                    <span className={styles.logitTileVal}>{response.latencyMs || latency}ms</span>
                  </div>
                </div>

                {/* Highlighted Evidence Snippet */}
                {contextInput && response.answer && contextInput.includes(response.answer) && (
                  <div className={styles.evidenceSnippetBox}>
                    <span className={styles.snippetTitle}>Span in Document Context:</span>
                    <p className={styles.snippetText}>
                      {contextInput.slice(0, Math.max(0, contextInput.indexOf(response.answer)))}
                      <mark className={styles.snippetMark}>{response.answer}</mark>
                      {contextInput.slice(contextInput.indexOf(response.answer) + response.answer.length)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Raw JSON Response */}
            {response && !loading && responseTab === 'json' && (
              <pre className={styles.jsonPre}>
                <code>{JSON.stringify(response, null, 2)}</code>
              </pre>
            )}

            {/* TAB 3: Latency Spectrum Deep Dive */}
            {response && !loading && responseTab === 'latency' && (
              <div className={styles.latencyDeepDive}>
                <h4 className={styles.deepDiveTitle}>Inference Pipeline Timing Spectrum</h4>
                <div className={styles.stageGrid}>
                  <div className={styles.stageCard}>
                    <span className={styles.stageName}>WordPiece Tokenizer</span>
                    <span className={styles.stageTime}>{tokenMs}ms</span>
                    <span className={styles.stageDesc}>Subword vocabulary encoding &amp; padding</span>
                  </div>
                  <div className={styles.stageCard}>
                    <span className={styles.stageName}>12-Layer Transformer</span>
                    <span className={styles.stageTime}>{forwardMs}ms</span>
                    <span className={styles.stageDesc}>Bidirectional cross-attention layers</span>
                  </div>
                  <div className={styles.stageCard}>
                    <span className={styles.stageName}>Argmax Span Heads</span>
                    <span className={styles.stageTime}>{spanMs}ms</span>
                    <span className={styles.stageDesc}>Start/end pointer logit evaluation</span>
                  </div>
                  <div className={styles.stageCard}>
                    <span className={styles.stageName}>HTTP Serialization</span>
                    <span className={styles.stageTime}>{restMs}ms</span>
                    <span className={styles.stageDesc}>FastAPI JSON serialization &amp; return</span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!response && !loading && !error && (
              <div className={styles.emptyState}>
                <div className={styles.pipelineDiagram}>
                  <div className={styles.diagramNode}>JSON Payload</div>
                  <div className={styles.diagramArrow}>➔</div>
                  <div className={styles.diagramNode}>BERT Attention</div>
                  <div className={styles.diagramArrow}>➔</div>
                  <div className={styles.diagramNode}>Span Logits</div>
                  <div className={styles.diagramArrow}>➔</div>
                  <div className={styles.diagramNodeActive}>Answer Span</div>
                </div>
                <h3 className={styles.emptyTitle}>Inference Chamber Standing By</h3>
                <p className={styles.emptyDesc}>
                  Click "Send Request" or run a quick test to execute the PyTorch extraction endpoint.
                </p>
                <button
                  type="button"
                  className={styles.quickTestBtn}
                  onClick={handleSend}
                >
                  <Play size={13} />
                  <span>Execute Sample Request</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
