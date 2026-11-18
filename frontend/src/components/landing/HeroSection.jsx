import React, { useState } from 'react'
import {
  ArrowRight, ChevronDown, CheckCircle, AlertCircle, Zap,
  FileText, Shield, Target, Lock, Sparkles, Terminal, Activity,
  Layers, ShieldCheck, Play, Settings, BookOpen, Upload, Box,
  LayoutGrid, Gem, Award, MessageSquare, Check, Search
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import styles from './HeroSection.module.css'

/* ── Demo Presets (Realistic extracted facts & unanswerable safeguard) ── */
const DEMO_PRESETS = [
  {
    id: 'all',
    label: '🚀 Core Engine',
    category: 'System Guarantee',
    context: 'ContextIQ operates with zero generative hallucinations. Every answer is extracted as a direct contiguous span from the text you provide. If the document does not contain the answer, the engine states so explicitly, ensuring total trust.',
    question: 'Does ContextIQ ever make up false answers?',
    answer: 'Every answer is extracted as a direct contiguous span from the text you provide.',
    score: 98.4,
    hasAnswer: true,
    highlight: 'Every answer is extracted as a direct contiguous span from the text you provide.',
    charSpan: 'chars 68–143',
    latency: '14ms',
  },
  {
    id: 'software',
    label: '💻 API Docs',
    category: 'Software Architecture',
    context: 'The API rate limit is 1,000 requests per minute for free-tier users and 10,000 requests per minute for enterprise accounts. Rate limiting is enforced at the account level, not per endpoint.',
    question: 'What is the API rate limit for free tier?',
    answer: '1,000 requests per minute',
    score: 99.1,
    hasAnswer: true,
    highlight: '1,000 requests per minute',
    charSpan: 'chars 23–48',
    latency: '11ms',
  },
  {
    id: 'operations',
    label: '⚙️ Operations',
    category: 'DevOps & Patches',
    context: 'Server maintenance windows are scheduled every second Sunday of the month from 02:00 to 04:00 UTC. Critical patches may require unscheduled downtime with a minimum 2-hour advance notice.',
    question: 'When are the maintenance windows scheduled?',
    answer: 'every second Sunday of the month from 02:00 to 04:00 UTC',
    score: 97.8,
    hasAnswer: true,
    highlight: 'every second Sunday of the month from 02:00 to 04:00 UTC',
    charSpan: 'chars 47–102',
    latency: '16ms',
  },
  {
    id: 'hr',
    label: '📋 Policy',
    category: 'Corporate Guidelines',
    context: 'All full-time employees are entitled to 20 days of paid annual leave per calendar year, accruing at 1.67 days per month. Part-time employees receive leave on a pro-rata basis.',
    question: 'How many leave days per year do employees receive?',
    answer: '20 days of paid annual leave per calendar year',
    score: 99.6,
    hasAnswer: true,
    highlight: '20 days of paid annual leave per calendar year',
    charSpan: 'chars 39–84',
    latency: '13ms',
  },
  {
    id: 'design',
    label: '🎨 Design',
    category: 'SQuAD 2.0 Safeguard',
    context: 'The primary brand color is #5E6AD2 (Linear Violet). Secondary palette includes Midnight (#08090A), Surface (#0E0F13), and accent tones of cyan and purple for interactive states.',
    question: 'What is the annual pricing for the enterprise plan?',
    answer: null,
    score: 0,
    hasAnswer: false,
    highlight: null,
    charSpan: 'no span',
    latency: '9ms',
  },
]

/* ── Context Span Highlighter with Indigo→Cyan Glow ───────────── */
function HighlightedContext({ text, highlight, active }) {
  if (!active || !highlight) return <span className={styles.docText}>{text}</span>
  const idx = text.indexOf(highlight)
  if (idx === -1) return <span className={styles.docText}>{text}</span>
  return (
    <span className={styles.docText}>
      {text.slice(0, idx)}
      <mark className={styles.evidenceSpan}>{highlight}</mark>
      {text.slice(idx + highlight.length)}
    </span>
  )
}

/* ── Interactive Workspace Mockup ────────────────────────────── */
function InteractiveWorkspace() {
  const [activePreset, setActivePreset] = useState(DEMO_PRESETS[0])
  const [isVerifying, setIsVerifying] = useState(false)
  const [showAnswer, setShowAnswer] = useState(true)

  const handlePreset = (preset) => {
    setActivePreset(preset)
    setShowAnswer(false)
    setIsVerifying(false)
    setTimeout(() => {
      setShowAnswer(true)
    }, 150)
  }

  const handleRun = () => {
    if (isVerifying) return
    setShowAnswer(false)
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setShowAnswer(true)
    }, 750)
  }

  return (
    <div className={styles.workspace}>
      {/* ── Window Chrome ─────────────────────────────────────── */}
      <div className={styles.windowChrome}>
        <div className={styles.trafficLights}>
          <span className={styles.tlRed} />
          <span className={styles.tlAmber} />
          <span className={styles.tlGreen} />
        </div>

        <div className={styles.windowTitle}>
          <Terminal size={12} className={styles.windowIcon} />
          <span className={styles.windowPath}>contextiq-core</span>
          <span className={styles.windowSep}>/</span>
          <span className={styles.windowFile}>workspace.live</span>
        </div>

        <div className={styles.windowStats}>
          <div className={styles.modelStatusBadge}>
            <span className={styles.statusLiveDot} />
            BERT SQuAD 2.0
          </div>
          <div className={styles.latencyBadge}>
            <Zap size={11} />
            {activePreset.latency}
          </div>
        </div>
      </div>

      {/* Preset Tabs */}
      <div className={styles.presetBar}>
        <span className={styles.presetLabel}>Select Preset:</span>
        <div className={styles.presetPills}>
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.presetPill} ${activePreset.id === p.id ? styles.presetActive : ''}`}
              onClick={() => handlePreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Panels: Context (Left) + Answer (Right) */}
      <div className={styles.workspaceCols}>
        {/* Left: Context Document Panel */}
        <div className={styles.docPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleWrap}>
              <FileText size={13} className={styles.panelIcon} />
              <span className={styles.panelTitle}>Input Document Context</span>
            </div>
            <span className={styles.categoryBadge}>{activePreset.category}</span>
          </div>

          <div className={styles.docBody}>
            <HighlightedContext
              text={activePreset.context}
              highlight={activePreset.highlight}
              active={showAnswer}
            />
          </div>

          <div className={styles.docFooter}>
            {showAnswer && activePreset.hasAnswer ? (
              <span className={styles.matchBadge}>
                <CheckCircle size={11} />
                Contiguous Evidence Span Located · {activePreset.charSpan}
              </span>
            ) : (
              <span className={styles.standbyBadge}>
                <Activity size={11} />
                Tokenized Window: 384 tokens · Stride 128
              </span>
            )}
          </div>
        </div>

        {/* Right: Question & Answer Visualization Centerpiece */}
        <div className={styles.qaPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleWrap}>
              <Target size={13} className={styles.panelIcon} />
              <span className={styles.panelTitle}>Extractive Q&A Inference</span>
            </div>
            <span className={styles.modelTag}>PyTorch · Sub-20ms</span>
          </div>

          <div className={styles.qaContent}>
            {/* Question Card */}
            <div className={styles.questionCard}>
              <div className={styles.questionMeta}>
                <span className={styles.qAuthor}>Queried Question</span>
              </div>
              <p className={styles.questionText}>"{activePreset.question}"</p>
            </div>

            {/* Answer Card — Visual Centerpiece */}
            {showAnswer ? (
              activePreset.hasAnswer ? (
                <div className={styles.answerCard}>
                  <div className={styles.answerHeader}>
                    <div className={styles.answerLabelGroup}>
                      <span className={styles.checkIconWrap}>
                        <CheckCircle size={13} />
                      </span>
                      <span className={styles.answerLabel}>Extracted Answer Span</span>
                    </div>
                    <span className={styles.confidenceScore}>
                      {activePreset.score}% Match
                    </span>
                  </div>

                  <div className={styles.answerTextWrap}>
                    <p className={styles.answerText}>"{activePreset.answer}"</p>
                  </div>

                  <div className={styles.answerMetrics}>
                    <span className={styles.metricItem}>
                      <Zap size={11} /> Latency: {activePreset.latency}
                    </span>
                    <span className={styles.metricDivider} />
                    <span className={styles.metricItem}>
                      <Target size={11} /> {activePreset.charSpan}
                    </span>
                    <span className={styles.metricDivider} />
                    <span className={styles.metricItem}>
                      <Shield size={11} /> 0% Hallucination
                    </span>
                  </div>
                </div>
              ) : (
                <div className={styles.safeguardCard}>
                  <div className={styles.safeguardHeader}>
                    <AlertCircle size={14} className={styles.safeguardIcon} />
                    <span className={styles.safeguardTitle}>Unanswerable in Passage</span>
                    <span className={styles.squadBadge}>SQuAD 2.0 Null-Span</span>
                  </div>
                  <p className={styles.safeguardText}>
                    The passage does not state this information. ContextIQ safely outputs no answer rather than fabricating text.
                  </p>
                </div>
              )
            ) : (
              <div className={styles.waitingState}>
                <div className={styles.loadingSpinner} />
                <span>Running BERT Transformer attention across context…</span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className={styles.runBar}>
            <span className={styles.kbdHint}>
              Preset loaded · Ready for inference
            </span>
            <button
              type="button"
              className={styles.runButton}
              onClick={handleRun}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <span className={styles.btnSpinner} />
                  Evaluating Tokens…
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Re-run Inference
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Per-Theme Hero Content ──────────────────────────────────
   Artwork is a text-free generated image; all text, cards and
   stats are rendered as live HTML so they stay razor-sharp. */
/* Bottom feature bar — identical across all themes */
const HERO_FEATURES = [
  { icon: FileText, value: 'Document QA', label: 'Made Simple' },
  { icon: Box, value: 'BERT-Powered', label: 'Extraction' },
  { icon: LayoutGrid, value: 'Interactive', label: 'Visualizations' },
  { icon: BookOpen, value: 'Built for', label: 'Learning & Research' },
]

const DEFAULT_EVIDENCE = {
  before: 'BERT uses a ',
  mark: 'transformer-based language model',
  after: ' architecture to learn deep bidirectional representations…',
}

const HERO_THEMES = {
  original: {
    image: '/themes/hero_linear.jpg',
    eyebrow: '01 / Product Intelligence',
    brand: true,
    headline: <>Find the <em>answer.</em><br />Show the <em>evidence.</em></>,
    sub: 'Extract precise, context-based answers from your documents using state-of-the-art BERT models.',
    question: 'What is the main contribution of BERT?',
    answer: '“BERT uses a transformer-based language model…”',
    evidence: DEFAULT_EVIDENCE,
  },
  void: {
    image: '/themes/hero_void.jpg',
    eyebrow: '02 / Experimental Interface',
    headline: <>Questions<br />meet<br /><em>context.</em></>,
    sub: 'Ask questions, extract precise answers and see exactly where they come from with BERT-powered AI.',
    question: 'What is BERT?',
    answer: '“BERT is a transformer-based language model…”',
    evidence: DEFAULT_EVIDENCE,
  },
  cloud: {
    image: '/themes/hero_cloud.jpg',
    eyebrow: '03 / Cloud Systems',
    headline: <>Your Documents.<br />Smarter <em>Answers.</em></>,
    sub: 'Upload, search and ask questions across your documents. Get accurate, grounded answers with BERT and see the exact evidence.',
    question: 'What is the main contribution of BERT?',
    answer: '“BERT uses a bidirectional Transformer architecture…”',
    evidence: DEFAULT_EVIDENCE,
  },
  ember: {
    image: '/themes/hero_ember.jpg',
    eyebrow: '04 / Brand World',
    headline: <>Turn Your<br /><em>Knowledge</em><br />Into Answers.</>,
    sub: 'Ask questions, explore ideas and extract precise answers from your documents with BERT.',
    question: 'How does tokenization work?',
    answer: '“BERT uses a transformer-based language model…”',
    evidence: DEFAULT_EVIDENCE,
  },
  pixelcraft: {
    image: '/themes/hero_pixelcraft.jpg',
    eyebrow: '05 / Digital Studio',
    headline: <>Ask.<br />Extract.<br /><em>Explore.</em></>,
    sub: 'Transform your documents into structured knowledge with BERT-powered question answering.',
    question: 'What is SQuAD 2.0?',
    answer: '“SQuAD 2.0 includes unanswerable questions…”',
    evidence: {
      before: 'SQuAD 2.0 combines 100,000 questions with ',
      mark: '50,000 unanswerable questions',
      after: ' written adversarially by crowdworkers…',
    },
  },
  imperium: {
    image: '/themes/hero_imperium.jpg',
    eyebrow: '06 / Strategic Platform',
    headline: <>Deeper<br />Context.<br /><em>Sharper Answers.</em></>,
    sub: 'A powerful, research-grade question answering system using BERT, built for high-quality, evidence-based insights.',
    question: 'What is the proposed architecture?',
    answer: '“The system uses a FastAPI inference layer…”',
    evidence: {
      before: 'The ',
      mark: 'system uses a FastAPI inference layer',
      after: ' to serve the fine-tuned BERT model at low latency…',
    },
  },
}
HERO_THEMES.linear = HERO_THEMES.original

const PROCESS_STEPS = ['Tokenizing', 'Creating context windows', 'Running BERT', 'Predicting span', 'Verifying answer']

/* ── Main Hero Section Component ────────────────────────────── */
export default function HeroSection({ onGetStarted, onLearnMore }) {
  const { theme } = useTheme()
  const heroKey = HERO_THEMES[theme] ? (theme === 'linear' ? 'original' : theme) : 'original'
  const hero = HERO_THEMES[heroKey]

  const scrollToDemo = () => {
    const el = document.getElementById('demo-workspace')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    else onLearnMore?.()
  }

  return (
    <section id="home" className={styles.hero}>
      {/* Ambient background lighting */}
      <div className={styles.orbIndigo} aria-hidden="true" />
      <div className={styles.orbViolet} aria-hidden="true" />
      <div className={styles.orbCyan} aria-hidden="true" />

      {/* ── Fullscreen Hero Stage: artwork covers the whole screen ── */}
      <div className={styles.heroStage} data-hero={heroKey} key={heroKey}>
        {/* Text-free generated artwork */}
        <div className={styles.heroArt} aria-hidden="true">
          <img
            src={hero.image}
            alt=""
            className={styles.heroArtImg}
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <div className={styles.heroArtFade} />
        </div>

        <div className={styles.heroInner}>
          {/* Left: copy + CTAs */}
          <div className={styles.heroCopy}>
            <span className={styles.heroEyebrow}>{hero.eyebrow}</span>
            {hero.brand && (
              <p className={styles.heroBrand}>CONTEXT<span>IQ</span></p>
            )}
            <h1 className={styles.heroHeadline}>{hero.headline}</h1>
            <p className={styles.heroSub}>{hero.sub}</p>
            <div className={styles.heroCtas}>
              <button type="button" id="hero-try-btn" className={styles.heroPrimaryBtn} onClick={onGetStarted}>
                Try ContextIQ <ArrowRight size={16} />
              </button>
              <button type="button" id="hero-demo-btn" className={styles.heroGhostBtn} onClick={scrollToDemo}>
                <span className={styles.playRing}><Play size={13} fill="currentColor" /></span>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Floating question card */}
          <div className={`${styles.glassCard} ${styles.questionCardFloat}`}>
            <div className={styles.glassHead}>
              <span className={styles.glassIcon}><MessageSquare size={13} /></span>
              Question
            </div>
            <div className={styles.questionRow}>
              <span>{hero.question}</span>
              <span className={styles.questionGo}><ArrowRight size={12} /></span>
            </div>
          </div>

          {/* Right: pipeline cards */}
          <div className={styles.cardStack}>
            <div className={styles.glassCard} style={{ '--d': '0.15s' }}>
              <div className={styles.glassHead}>
                <span className={styles.glassIcon}><Settings size={13} /></span>
                Processing
              </div>
              <ul className={styles.stepList}>
                {PROCESS_STEPS.map((s, i) => (
                  <li key={s} style={{ '--i': i }}>
                    <span className={styles.stepCheck}><Check size={10} strokeWidth={3} /></span>{s}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.glassCard} style={{ '--d': '0.3s' }}>
              <div className={styles.glassHead}>
                <span className={styles.glassIcon}><Sparkles size={13} /></span>
                Answer Found
              </div>
              <p className={styles.answerQuote}>{hero.answer}</p>
              <div className={styles.confRow}><span>Confidence</span><strong>92.4%</strong></div>
              <div className={styles.confTrack}><div className={styles.confFill} /></div>
            </div>

            <div className={styles.glassCard} style={{ '--d': '0.45s' }}>
              <div className={styles.glassHead}>
                <span className={styles.glassIcon}><BookOpen size={13} /></span>
                Evidence
              </div>
              <p className={styles.evidenceQuote}>
                “{hero.evidence.before}<mark>{hero.evidence.mark}</mark>{hero.evidence.after}”
              </p>
            </div>
          </div>
        </div>

        {/* Bottom feature bar (same for all themes) */}
        <ul className={styles.heroStats}>
          {HERO_FEATURES.map(({ icon: Icon, value, label }) => (
            <li key={value} className={styles.heroStat}>
              <span className={styles.heroStatIcon}><Icon size={18} /></span>
              <span className={styles.heroStatText}>
                <strong>{value}</strong>
                <small>{label}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`container ${styles.content}`}>
        {/* ── Interactive Workspace Mockup ── */}
        <div id="demo-workspace" className={styles.workspaceWrapper}>
          <div className={styles.mockupGlowBackdrop} aria-hidden="true" />
          <InteractiveWorkspace />
        </div>
      </div>
    </section>
  )
}
