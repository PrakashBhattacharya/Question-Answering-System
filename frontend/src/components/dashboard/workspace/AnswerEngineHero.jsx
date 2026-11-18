import React, { useState, useEffect } from 'react'
import {
  Sparkles, Layers, Cpu, ShieldCheck, ArrowDown, ArrowRight,
  Database, FileText, CheckCircle2, Zap, Orbit, Compass, Sliders
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import styles from './AnswerEngineHero.module.css'

export default function AnswerEngineHero({
  context = '',
  question = '',
  result = null,
  loading = false,
  inferenceStage = 0,
}) {
  const { theme } = useTheme()
  const [activeStep, setActiveStep] = useState(0)

  const hasResult = Boolean(result && result.has_answer && result.answer)
  const themeClass = styles[`engineTheme_${theme}`] || styles.engineTheme_original

  // Dynamic step progression during inference
  useEffect(() => {
    if (loading) {
      setActiveStep(inferenceStage || 2)
    } else if (hasResult) {
      setActiveStep(6) // Fully completed
    } else {
      setActiveStep(0)
    }
  }, [loading, inferenceStage, hasResult])

  // Context snippet length
  const wordCount = context ? context.trim().split(/\s+/).length : 0
  const tokenEst = Math.round(wordCount * 1.3)
  const slidingWindows = Math.max(1, Math.ceil(tokenEst / 384))

  return (
    <div className={`${styles.engineContainer} ${themeClass}`}>
      {/* ── Engine Atmospheric Backdrop & Particles ─────────────── */}
      <div className={styles.ambientAura} aria-hidden="true" />
      <div className={styles.particleField} aria-hidden="true">
        <span className={styles.tokenParticle1} />
        <span className={styles.tokenParticle2} />
        <span className={styles.tokenParticle3} />
        <span className={styles.tokenParticle4} />
      </div>

      {/* ── Header HUD ─────────────────────────────────────────── */}
      <div className={styles.engineHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.coreIndicator}>
            <span className={styles.corePulseDot} />
            <span className={styles.corePulseRing} />
          </div>
          <div>
            <span className={styles.engineEyebrow}>THE ANSWER ENGINE</span>
            <h3 className={styles.engineTitle}>Fast & Accurate Answers From Your Document</h3>
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL LIVE PIPELINE CARD ───────────────────────── */}
      <div className={styles.horizontalPipeline}>
        <div className={styles.pipelineRail}>
          {/* STEP 1: INPUT */}
          <div className={`${styles.pipeNode} ${activeStep >= 0 ? styles.pipeNodeDone : ''}`}>
            <div className={styles.pipeIconWrap}><FileText size={14} /></div>
            <span className={styles.pipeTitle}>DOCUMENT</span>
            <span className={styles.pipeSub}>Your Text</span>
          </div>

          <div className={`${styles.pipeLink} ${activeStep >= 1 ? styles.pipeLinkActive : ''}`} />

          {/* STEP 2: TOKENIZE */}
          <div className={`${styles.pipeNode} ${activeStep >= 1 ? styles.pipeNodeDone : ''}`}>
            <div className={styles.pipeIconWrap}><Layers size={14} /></div>
            <span className={styles.pipeTitle}>WORDS</span>
            <span className={styles.pipeSub}>Read Words</span>
          </div>

          <div className={`${styles.pipeLink} ${activeStep >= 2 ? styles.pipeLinkActive : ''}`} />

          {/* STEP 3: WINDOWS */}
          <div className={`${styles.pipeNode} ${activeStep >= 2 ? styles.pipeNodeDone : ''}`}>
            <div className={styles.pipeIconWrap}><Database size={14} /></div>
            <span className={styles.pipeTitle}>SECTIONS</span>
            <span className={styles.pipeSub}>{slidingWindows} Part{slidingWindows > 1 ? 's' : ''}</span>
          </div>

          <div className={`${styles.pipeLink} ${activeStep >= 3 ? styles.pipeLinkActive : ''}`} />

          {/* STEP 4: BERT CORE */}
          <div className={`${styles.pipeNode} ${styles.pipeNodeBert} ${activeStep >= 3 ? styles.pipeNodeActiveBert : ''}`}>
            <div className={styles.pipeIconWrapBert}><Cpu size={16} /></div>
            <span className={styles.pipeTitleBert}>AI CORE</span>
            <span className={styles.pipeSubBert}>Understand</span>
          </div>

          <div className={`${styles.pipeLink} ${activeStep >= 4 ? styles.pipeLinkActive : ''}`} />

          {/* STEP 5: SPAN */}
          <div className={`${styles.pipeNode} ${activeStep >= 4 ? styles.pipeNodeDone : ''}`}>
            <div className={styles.pipeIconWrap}><Orbit size={14} /></div>
            <span className={styles.pipeTitle}>LOCATE</span>
            <span className={styles.pipeSub}>Find Answer</span>
          </div>

          <div className={`${styles.pipeLink} ${activeStep >= 5 ? styles.pipeLinkActive : ''}`} />

          {/* STEP 6: VERIFY */}
          <div className={`${styles.pipeNode} ${activeStep >= 5 ? styles.pipeNodeDone : ''}`}>
            <div className={styles.pipeIconWrap}><ShieldCheck size={14} /></div>
            <span className={styles.pipeTitle}>CHECK</span>
            <span className={styles.pipeSub}>Verify Match</span>
          </div>

          <div className={`${styles.pipeLink} ${activeStep >= 6 ? styles.pipeLinkActive : ''}`} />

          {/* STEP 7: ANSWER */}
          <div className={`${styles.pipeNode} ${hasResult ? styles.pipeNodeAnswer : ''}`}>
            <div className={styles.pipeIconWrapAnswer}><Sparkles size={14} /></div>
            <span className={styles.pipeTitle}>ANSWER</span>
            <span className={styles.pipeSub}>{hasResult ? 'Ready' : 'Waiting'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
