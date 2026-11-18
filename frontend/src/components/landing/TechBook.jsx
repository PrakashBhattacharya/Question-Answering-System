import React, { useState, useEffect, useRef } from 'react'
import {
  Brain,
  Flame,
  Package,
  Zap,
  Atom,
  Database,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Sparkles,
  Terminal,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'
import { soundService } from '../../services/soundService'
import { useTheme } from '../../context/ThemeContext'
import styles from './TechBook.module.css'

export const TECH_PAGES = [
  {
    id: 'bert',
    number: '01',
    folio: 'FOLIO I',
    chapter: 'TRANSFORMER CORE',
    name: 'BERT Checkpoint',
    role: 'Core Extractive Model',
    roleColor: 'indigo',
    icon: Brain,
    subtitle: 'Bidirectional Self-Attention',
    desc: 'Bidirectional Encoder Representations from Transformers. Uses deep bidirectional self-attention to identify precise start and end tokens directly within provided context.',
    quote: 'Direct token-level span extraction with zero generative hallucination risk.',
    specs: [
      { label: 'Attention Heads', value: '12 Multi-Head' },
      { label: 'Hidden Dimension', value: '768 Dimensions' },
      { label: 'Active Weights', value: '110M Parameters' },
      { label: 'Span Probability', value: 'Exact Start & End' }
    ],
    code: `P(start, end) = softmax(H · W_s) ⊗ softmax(H · W_e)`,
    tags: ['PyTorch Checkpoint', 'Bidirectional', 'Logits Layer']
  },
  {
    id: 'pytorch',
    number: '02',
    folio: 'FOLIO II',
    chapter: 'INFERENCE ENGINE',
    name: 'PyTorch',
    role: 'Inference Framework',
    roleColor: 'amber',
    icon: Flame,
    subtitle: 'Dynamic Computation Graph',
    desc: 'Low-latency tensor computation graphs executing token span logits with native GPU acceleration and optimized CPU multi-threading.',
    quote: 'Optimized memory graphs delivering sub-15ms forward pass latency.',
    specs: [
      { label: 'Runtime Engine', value: 'C++ LibTorch' },
      { label: 'Hardware Support', value: 'CUDA / ROCm / AVX' },
      { label: 'Inference SLA', value: '< 15ms Overhead' },
      { label: 'Execution Mode', value: 'torch.inference_mode()' }
    ],
    code: `with torch.inference_mode():\n  logits = bert_model(**inputs)`,
    tags: ['Native C++', 'Zero-Copy Tensors', 'JIT Compiled']
  },
  {
    id: 'transformers',
    number: '03',
    folio: 'FOLIO III',
    chapter: 'TOKENIZATION PIPELINE',
    name: 'Hugging Face Transformers',
    role: 'Model Hub & Tokenizer',
    roleColor: 'cyan',
    icon: Package,
    subtitle: 'WordPiece Subword Encoding',
    desc: 'Production-ready WordPiece tokenization with fast subword encoding, handling vocabulary token offsets and attention masking seamlessly.',
    quote: 'Direct character span mapping for real-time UI text highlighting.',
    specs: [
      { label: 'Tokenizer Core', value: 'Fast Rust Engine' },
      { label: 'Offset Tracking', value: 'Char-to-Token Exact' },
      { label: 'Context Window', value: '512 Subwords' },
      { label: 'Storage Format', value: 'SafeTensors Zero-Copy' }
    ],
    code: `tokenizer.encode_plus(q, ctx, return_offsets=True)`,
    tags: ['Subword Encoding', 'Offset Mapping', 'SafeTensors']
  },
  {
    id: 'fastapi',
    number: '04',
    folio: 'FOLIO IV',
    chapter: 'ASYNCHRONOUS BACKEND',
    name: 'FastAPI',
    role: 'Asynchronous Backend',
    roleColor: 'green',
    icon: Zap,
    subtitle: 'Async ASGI Pipeline',
    desc: 'High-throughput async Python REST API with automatic Pydantic validation, keeping inference overhead under 5ms per payload.',
    quote: 'Non-blocking event loop shielding machine learning inference pipelines.',
    specs: [
      { label: 'Server Gateway', value: 'Uvicorn ASGI + uvloop' },
      { label: 'Validation Core', value: 'Pydantic V2 (Rust)' },
      { label: 'Router Overhead', value: '< 2.5ms Dispatch' },
      { label: 'Worker Concurrency', value: 'Async Worker Pool' }
    ],
    code: `@app.post("/qa/predict")\nasync def infer(payload: QAQuery): ...`,
    tags: ['Uvicorn ASGI', 'Pydantic V2', 'REST Endpoints']
  },
  {
    id: 'react',
    number: '05',
    folio: 'FOLIO V',
    chapter: 'FRONTEND CLIENT',
    name: 'React 18 & Vite',
    role: 'Frontend Client',
    roleColor: 'blue',
    icon: Atom,
    subtitle: 'Concurrent UI Architecture',
    desc: 'Component-driven interactive dashboard with zero layout shifts, real-time evidence span highlights, and sub-millisecond local state updates.',
    quote: 'Buttery-smooth 60fps UI with instant keyboard and touch feedback.',
    specs: [
      { label: 'Bundler Engine', value: 'Vite 5 / ESBuild' },
      { label: 'Render Pipeline', value: 'Concurrent React 18' },
      { label: 'Layout Stability', value: '0.000 CLS Score' },
      { label: 'Telemetry Sync', value: 'Sub-millisecond' }
    ],
    code: `const [highlight, setHighlight] = useEvidenceSpan(logits)`,
    tags: ['Zero Layout Shift', 'Vite 5', 'State Machine']
  },
  {
    id: 'squad',
    number: '06',
    folio: 'FOLIO VI',
    chapter: 'EVALUATION & BENCHMARKS',
    name: 'SQuAD 2.0 Dataset',
    role: 'Evaluation & Benchmarks',
    roleColor: 'violet',
    icon: Database,
    subtitle: 'Empirical Verification',
    desc: 'Stanford Question Answering Dataset with over 150k questions including 50k negative examples, benchmarked for both exact match and unanswerable detection.',
    quote: 'Adversarial negative examples eliminate hallucinations when answers are absent.',
    specs: [
      { label: 'Curated Corpus', value: '150k+ Verified Pairs' },
      { label: 'Negative Controls', value: '50k Adversarial Samples' },
      { label: 'Target Accuracy', value: '88.5% Exact Match' },
      { label: 'Validation Protocol', value: 'Thresholded Rejection' }
    ],
    code: `em, f1 = evaluate_squad_v2(preds, ground_truths)`,
    tags: ['Stanford SQuAD', 'Negative Examples', 'Hallucination Gate']
  }
]

const THEME_EDITION_NAMES = {
  original: '◈ Quantum Cyber Codex',
  void: '✦ Monochrome Stealth Folio',
  cloud: '◉ Enterprise Porcelain Blueprint',
  ember: '◆ Tuscan Leather Vellum Grimoire',
  pixelcraft: '▣ Tactical Voxel Matrix Manual',
  imperium: '⚜ Imperial Sovereign Gilded Codex',
}

const getRoleColors = (theme, roleColor) => {
  const isLight = theme === 'cloud' || theme === 'ember'
  const isVoid = theme === 'void'
  const isImperium = theme === 'imperium'
  const isPixelcraft = theme === 'pixelcraft'

  if (isVoid) {
    return { bg: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', border: 'rgba(255, 255, 255, 0.25)' }
  }

  if (isImperium) {
    return { bg: 'rgba(212, 175, 55, 0.12)', color: '#f59e0b', border: 'rgba(212, 175, 55, 0.35)' }
  }

  if (isPixelcraft) {
    return { bg: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.35)' }
  }

  if (isLight) {
    const lightPalette = {
      indigo: { bg: 'rgba(99, 102, 241, 0.1)', color: '#4338ca', border: 'rgba(99, 102, 241, 0.35)' },
      amber:  { bg: 'rgba(217, 119, 6, 0.12)',  color: '#b45309', border: 'rgba(217, 119, 6, 0.35)' },
      cyan:   { bg: 'rgba(2, 132, 199, 0.1)',   color: '#0369a1', border: 'rgba(2, 132, 199, 0.35)' },
      green:  { bg: 'rgba(22, 163, 74, 0.1)',   color: '#15803d', border: 'rgba(22, 163, 74, 0.35)' },
      blue:   { bg: 'rgba(37, 99, 235, 0.1)',   color: '#1d4ed8', border: 'rgba(37, 99, 235, 0.35)' },
      violet: { bg: 'rgba(124, 58, 237, 0.1)',  color: '#6d28d9', border: 'rgba(124, 58, 237, 0.35)' },
    }
    return lightPalette[roleColor] || lightPalette.indigo
  }

  // Original / dark default
  const darkPalette = {
    indigo: { bg: 'rgba(99, 102, 241, 0.14)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.35)' },
    amber:  { bg: 'rgba(245, 158, 11, 0.14)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
    cyan:   { bg: 'rgba(34, 211, 238, 0.14)', color: '#22d3ee', border: 'rgba(34, 211, 238, 0.35)' },
    green:  { bg: 'rgba(34, 197, 94, 0.14)',  color: '#4ade80', border: 'rgba(34, 197, 94, 0.35)' },
    blue:   { bg: 'rgba(59, 130, 246, 0.14)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
    violet: { bg: 'rgba(139, 92, 246, 0.14)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.35)' },
  }
  return darkPalette[roleColor] || darkPalette.indigo
}

const TOTAL_SPREADS = 3 // 2 pages per spread = 6 pages

function PageFolio({ page, isLeft, onTurnNext, onTurnPrev, isFlipping, theme }) {
  if (!page) return null
  const Icon = page.icon
  const rc = getRoleColors(theme, page.roleColor)
  const editionTitle = THEME_EDITION_NAMES[theme] || THEME_EDITION_NAMES.original

  return (
    <div className={styles.pageInner}>
      {/* Top Folio Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageFolioText}>
          <Layers size={13} style={{ color: rc.color }} />
          <span>{page.folio} · {page.chapter}</span>
        </div>
        <div className={styles.pageNumeral}>
          PAGE {page.number} / 06
        </div>
      </div>

      {/* Tech Identity Header */}
      <div className={styles.identityBlock}>
        <div
          className={styles.techIconBox}
          style={{ background: rc.bg, borderColor: rc.border, color: rc.color }}
        >
          <Icon size={26} strokeWidth={1.8} />
        </div>
        <div className={styles.identityText}>
          <h3 className={styles.techName}>{page.name}</h3>
          <span className={styles.techRolePill} style={{ color: rc.color }}>
            {page.role}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className={styles.pageDesc}>{page.desc}</p>

      {/* Technical Specifications Matrix */}
      <div className={styles.specsGrid}>
        {page.specs.map((spec, i) => (
          <div key={i} className={styles.specItem}>
            <span className={styles.specLabel}>{spec.label}</span>
            <span className={styles.specValue}>{spec.value}</span>
          </div>
        ))}
      </div>

      {/* Mathematical / Pipeline Code Block */}
      <div className={styles.codeBlock}>
        <div className={styles.codeLabel}>
          <Terminal size={11} />
          <span>EXECUTION MANIFEST</span>
        </div>
        <div className={styles.codeSnippet}>{page.code}</div>
      </div>

      {/* Architectural Guarantee Quote */}
      <div className={styles.quoteBox}>
        "{page.quote}"
      </div>

      {/* Tags */}
      <div className={styles.tagsRow}>
        {page.tags.map((tag, i) => (
          <span key={i} className={styles.tagPill}>
            #{tag}
          </span>
        ))}
      </div>

      {/* Page Footer & Turn Prompts */}
      <div className={styles.pageFooter}>
        {isLeft ? (
          <div
            className={styles.turnBackHint}
            onClick={onTurnPrev}
            role="button"
            tabIndex={0}
            title="Turn back to previous page"
          >
            <ArrowLeft size={13} />
            <span>Previous Folio</span>
          </div>
        ) : (
          <div
            className={styles.turnPageHint}
            onClick={onTurnNext}
            role="button"
            tabIndex={0}
            title="Turn to next page"
          >
            <span>Next Folio</span>
            <ArrowRight size={13} />
          </div>
        )}
        <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{editionTitle}</span>
      </div>

      {/* Interactive Dog-Ear Corner Curl */}
      {!isFlipping && (
        isLeft ? (
          <div
            className={styles.dogEarLeft}
            onClick={onTurnPrev}
            title="Click corner to turn back"
          />
        ) : (
          <div
            className={styles.dogEarRight}
            onClick={onTurnNext}
            title="Click corner to turn page"
          />
        )
      )}
    </div>
  )
}

export default function TechBook({ onSelectTech }) {
  const { theme } = useTheme()
  const [currentSpread, setCurrentSpread] = useState(0)
  const [flipState, setFlipState] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [autoFlip, setAutoFlip] = useState(false)
  const [muted, setMuted] = useState(soundService.isMuted())
  const [isHovered, setIsHovered] = useState(false)
  const animTimeoutRef = useRef(null)

  // Listen to global sound toggle
  useEffect(() => {
    const handleSoundToggle = (e) => setMuted(e.detail.muted)
    window.addEventListener('contextiq_sound_toggled', handleSoundToggle)
    return () => window.removeEventListener('contextiq_sound_toggled', handleSoundToggle)
  }, [])

  // Auto-flip effect
  useEffect(() => {
    if (!autoFlip || isHovered || flipState !== null) return
    const timer = setInterval(() => {
      turnNext()
    }, 6500)
    return () => clearInterval(timer)
  }, [autoFlip, isHovered, flipState, currentSpread])

  // Keyboard navigation (Left / Right arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        turnNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        turnPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSpread, flipState])

  const turnNext = () => {
    if (flipState !== null) return
    const nextSpread = (currentSpread + 1) % TOTAL_SPREADS

    // Start page flip sound
    soundService.playPageTurn()

    // Setup flip state
    setFlipState({
      direction: 'next',
      fromSpread: currentSpread,
      toSpread: nextSpread
    })

    // Trigger animation next tick
    requestAnimationFrame(() => {
      setIsAnimating(true)
    })

    // Complete animation after 780ms
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    animTimeoutRef.current = setTimeout(() => {
      setCurrentSpread(nextSpread)
      setFlipState(null)
      setIsAnimating(false)
    }, 780)
  }

  const turnPrev = () => {
    if (flipState !== null) return
    const prevSpread = (currentSpread - 1 + TOTAL_SPREADS) % TOTAL_SPREADS

    soundService.playPageTurn()

    setFlipState({
      direction: 'prev',
      fromSpread: currentSpread,
      toSpread: prevSpread
    })

    requestAnimationFrame(() => {
      setIsAnimating(true)
    })

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    animTimeoutRef.current = setTimeout(() => {
      setCurrentSpread(prevSpread)
      setFlipState(null)
      setIsAnimating(false)
    }, 780)
  }

  const goToSpread = (targetSpread) => {
    if (targetSpread === currentSpread || flipState !== null) return

    soundService.playPageTurn()

    const direction = targetSpread > currentSpread ? 'next' : 'prev'
    setFlipState({
      direction,
      fromSpread: currentSpread,
      toSpread: targetSpread
    })

    requestAnimationFrame(() => {
      setIsAnimating(true)
    })

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    animTimeoutRef.current = setTimeout(() => {
      setCurrentSpread(targetSpread)
      setFlipState(null)
      setIsAnimating(false)
    }, 780)
  }

  const toggleSound = () => {
    const newMuted = soundService.toggleMute()
    setMuted(newMuted)
  }

  // Active pages calculation
  const leftPageIndex = currentSpread * 2
  const rightPageIndex = currentSpread * 2 + 1

  // Underneath pages during animation
  let staticLeftPage = TECH_PAGES[leftPageIndex]
  let staticRightPage = TECH_PAGES[rightPageIndex]
  let leafFrontPage = null
  let leafBackPage = null

  if (flipState) {
    if (flipState.direction === 'next') {
      leafFrontPage = TECH_PAGES[flipState.fromSpread * 2 + 1]
      leafBackPage = TECH_PAGES[flipState.toSpread * 2]
      staticLeftPage = TECH_PAGES[flipState.fromSpread * 2]
      staticRightPage = TECH_PAGES[flipState.toSpread * 2 + 1]
    } else {
      leafFrontPage = TECH_PAGES[flipState.fromSpread * 2]
      leafBackPage = TECH_PAGES[flipState.toSpread * 2 + 1]
      staticLeftPage = TECH_PAGES[flipState.toSpread * 2]
      staticRightPage = TECH_PAGES[flipState.fromSpread * 2 + 1]
    }
  }

  return (
    <div
      className={styles.bookSectionContainer}
      data-book-theme={theme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Controls Bar ── */}
      <div className={styles.controlsBar}>
        <div className={styles.controlsLeft}>
          <button
            type="button"
            className={styles.ctrlBtn}
            onClick={turnPrev}
            disabled={flipState !== null}
            aria-label="Turn page left"
          >
            <ChevronLeft size={16} />
            <span>Turn Left</span>
          </button>

          <button
            type="button"
            className={styles.ctrlBtn}
            onClick={turnNext}
            disabled={flipState !== null}
            aria-label="Turn page right"
          >
            <span>Turn Right</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Center: Folio Spread Indicator */}
        <div className={styles.controlsCenter}>
          <div className={styles.folioBadge}>
            <BookOpen size={13} />
            <span>Folio Spread</span>
            <span className={styles.spreadIndicator}>
              {currentSpread === 0 ? 'I (Pages 1–2)' : currentSpread === 1 ? 'II (Pages 3–4)' : 'III (Pages 5–6)'}
            </span>
          </div>

          <div className={styles.dotsWrap}>
            {[0, 1, 2].map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.dot} ${currentSpread === s ? styles.dotActive : ''}`}
                onClick={() => goToSpread(s)}
                aria-label={`Jump to Folio ${s + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right: Sound & Auto-Turn Controls */}
        <div className={styles.controlsRight}>
          <button
            type="button"
            className={`${styles.ctrlBtn} ${autoFlip ? styles.ctrlBtnActive : ''}`}
            onClick={() => setAutoFlip(!autoFlip)}
            title={autoFlip ? 'Pause auto-page turning' : 'Enable auto-page turning'}
          >
            {autoFlip ? <Pause size={13} /> : <Play size={13} />}
            <span>{autoFlip ? 'Auto-Flip ON' : 'Auto-Flip'}</span>
          </button>

          <button
            type="button"
            className={styles.ctrlBtn}
            onClick={toggleSound}
            title={muted ? 'Unmute paper flip audio' : 'Mute paper flip audio'}
            aria-label="Toggle book sound"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{muted ? 'Muted' : 'Audio ON'}</span>
          </button>
        </div>
      </div>

      {/* ── 3D BOOK CASING & PAGES ── */}
      <div className={styles.bookStage}>
        <div className={styles.bookHardcover}>
          {/* Stacked Page Edges (visual depth) */}
          <div className={styles.stackLeft} aria-hidden="true" />
          <div className={styles.stackRight} aria-hidden="true" />

          {/* Central Leather Spine & Bookmark Ribbon */}
          <div className={styles.spineCenter} aria-hidden="true" />
          <div className={styles.ribbon} aria-hidden="true" />

          {/* Main Open Spread Pages */}
          <div className={styles.spreadPages}>
            {/* STATIC LEFT PAGE */}
            <div className={styles.pageStaticLeft}>
              <PageFolio
                page={staticLeftPage}
                isLeft={true}
                onTurnPrev={turnPrev}
                onTurnNext={turnNext}
                isFlipping={flipState !== null}
                theme={theme}
              />
              <div className={styles.creaseLeft} aria-hidden="true" />
            </div>

            {/* STATIC RIGHT PAGE */}
            <div className={styles.pageStaticRight}>
              <PageFolio
                page={staticRightPage}
                isLeft={false}
                onTurnPrev={turnPrev}
                onTurnNext={turnNext}
                isFlipping={flipState !== null}
                theme={theme}
              />
              <div className={styles.creaseRight} aria-hidden="true" />
            </div>

            {/* 3D TURNING LEAF (when flip is active) */}
            {flipState && (
              <div
                className={`${styles.flippingLeaf} ${
                  flipState.direction === 'next'
                    ? `${styles.leafNext} ${isAnimating ? styles.leafNextTurning : ''}`
                    : `${styles.leafPrev} ${isAnimating ? styles.leafPrevTurning : ''}`
                }`}
              >
                {/* Front Face */}
                <div className={styles.leafFront}>
                  <PageFolio
                    page={leafFrontPage}
                    isLeft={flipState.direction === 'prev'}
                    onTurnPrev={turnPrev}
                    onTurnNext={turnNext}
                    isFlipping={true}
                    theme={theme}
                  />
                  <div className={styles.leafShadowOverlay} aria-hidden="true" />
                </div>

                {/* Back Face */}
                <div className={styles.leafBack}>
                  <PageFolio
                    page={leafBackPage}
                    isLeft={flipState.direction === 'next'}
                    onTurnPrev={turnPrev}
                    onTurnNext={turnNext}
                    isFlipping={true}
                    theme={theme}
                  />
                  <div className={styles.leafShadowOverlay} aria-hidden="true" />
                </div>
              </div>
            )}
          </div>

          {/* Protruding Thumb Index Tabs along Right Edge */}
          <div className={styles.thumbTabs} role="tablist" aria-label="Book Chapters">
            {TECH_PAGES.map((tech, idx) => {
              const spread = Math.floor(idx / 2)
              const isActive = spread === currentSpread
              const Icon = tech.icon
              return (
                <button
                  key={tech.id}
                  type="button"
                  className={`${styles.thumbTab} ${isActive ? styles.thumbTabActive : ''}`}
                  onClick={() => goToSpread(spread)}
                  aria-selected={isActive}
                  role="tab"
                  title={`${tech.name} (${tech.role})`}
                >
                  <Icon size={14} style={{ color: isActive ? '#fff' : 'inherit' }} />
                  <span className={styles.thumbTabTooltip}>
                    Ch. {idx + 1}: {tech.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
