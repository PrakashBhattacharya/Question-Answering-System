import React, { useState, useEffect } from 'react'
import {
  Cpu, CheckCircle2, AlertCircle, ArrowUpRight, Shield, Layers,
  Zap, Activity, Terminal, Flame, Database, Binary, Sliders, ShieldCheck
} from 'lucide-react'
import { systemApi } from '../../../services/api'
import styles from './ModelStatusCard.module.css'

export default function ModelStatusCard({ onOpenDetails }) {
  const [isOperational, setIsOperational] = useState(true)
  const [checking, setChecking] = useState(false)
  // Set default active stage to Span Extraction Head (no auto-cycling animation)
  const [activeStage, setActiveStage] = useState(2)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      setChecking(true)
      try {
        const res = await systemApi.health()
        if (mounted) setIsOperational(res?.status === 'ok')
      } catch {
        if (mounted) setIsOperational(false)
      } finally {
        if (mounted) setChecking(false)
      }
    }
    check()
    const timer = setInterval(check, 30000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const pipelineStages = [
    {
      id: 'tok',
      step: '01',
      name: 'WordPiece Tokenizer',
      spec: 'bert-base-cased · 28.9k vocab',
      desc: '[CLS] Question [SEP] Context [SEP]',
      icon: Binary,
      color: '#38bdf8',
    },
    {
      id: 'stride',
      step: '02',
      name: 'Sliding Window Chunking',
      spec: '7,680 max context · 450 max answer',
      desc: '15x multi-chunk overlap window (stride 256)',
      icon: Sliders,
      color: '#818cf8',
    },
    {
      id: 'head',
      step: '03',
      name: 'Span Extraction Head',
      spec: 'Linear(768, 2) · Start & End',
      desc: 'Softmax joint logit probability',
      icon: Layers,
      color: '#a855f7',
    },
    {
      id: 'guard',
      step: '04',
      name: 'SQuAD 2.0 Null Guard',
      spec: 'handle_impossible_answer = True',
      desc: 'Rejects unanswerable context (τ = -1.84)',
      icon: ShieldCheck,
      color: '#34d399',
    },
  ]

  return (
    <div className={styles.card}>
      {/* Ambient background glow */}
      <div className={styles.cardGlow} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <div className={styles.iconBadge}>
            <Cpu size={16} className={styles.titleIcon} />
          </div>
          <div>
            <h3 className={styles.title}>Model Status</h3>
            <span className={styles.titleSub}>deepset/bert-base-cased-squad2</span>
          </div>
        </div>

        <div
          className={`${styles.statusPill} ${
            isOperational ? styles.statusOk : styles.statusOffline
          }`}
        >
          <span className={styles.pulseRing}>
            <span className={styles.dot} />
          </span>
          <span className={styles.statusText}>
            {checking ? 'Checking...' : isOperational ? 'Operational' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Active Project Inference Pipeline Widget */}
      <div className={styles.pipelineVisual}>
        <div className={styles.pipelineHeader}>
          <span className={styles.pipelineTitle}>
            <Activity size={13} className={styles.pipelineIcon} />
            HUGGING FACE QA PIPELINE
          </span>
          <span className={styles.pipelineTag}>FASTAPI ROUTE /qa/answer</span>
        </div>

        <div className={styles.pipelineStagesList}>
          {pipelineStages.map((stg, idx) => {
            const Icon = stg.icon
            const isCurrent = activeStage === idx

            return (
              <div
                key={stg.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveStage(idx)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveStage(idx) }}
                className={`${styles.stageRow} ${isCurrent ? styles.stageRowActive : ''}`}
                title={`Inspect stage ${stg.step}: ${stg.name}`}
              >
                <div className={styles.stageLeft}>
                  <div
                    className={styles.stageIconWrap}
                    style={{
                      color: stg.color,
                      borderColor: isCurrent ? stg.color : undefined,
                    }}
                  >
                    <Icon size={13} />
                  </div>
                  <div className={styles.stageInfo}>
                    <div className={styles.stageNameRow}>
                      <span className={styles.stageStep}>{stg.step}</span>
                      <span className={styles.stageName}>{stg.name}</span>
                    </div>
                    <span className={styles.stageSpec}>{stg.spec}</span>
                  </div>
                </div>

                <div className={styles.stageStatusPill}>
                  {isCurrent ? (
                    <span className={styles.liveIndicator}>
                      <span className={styles.livePulse} style={{ background: stg.color }} />
                      Active
                    </span>
                  ) : (
                    <span className={styles.standbyIndicator}>Ready</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Technical Specs Rows with Visual Badges */}
      <div className={styles.specsList}>
        <div className={styles.specRow}>
          <span className={styles.specLabel}>
            <span className={styles.specDot} />
            Model
          </span>
          <span className={styles.specPillBlue}>
            <code>deepset/bert-base-cased</code>
          </span>
        </div>

        <div className={styles.specRow}>
          <span className={styles.specLabel}>
            <span className={styles.specDot} />
            Framework
          </span>
          <span className={styles.specPillOrange}>
            <Flame size={12} className={styles.specIconOrange} />
            <span>PyTorch 2.1 JIT</span>
          </span>
        </div>

        <div className={styles.specRow}>
          <span className={styles.specLabel}>
            <span className={styles.specDot} />
            Tokenizer
          </span>
          <span className={styles.specPillYellow}>
            <span className={styles.hfGlyph}>🤗</span>
            <span>Fast WordPiece Cased</span>
          </span>
        </div>

        <div className={styles.specRow}>
          <span className={styles.specLabel}>
            <span className={styles.specDot} />
            Dataset
          </span>
          <span className={styles.specPillCyan}>
            <Database size={11} />
            <span>SQuAD 2.0 (Unanswerable)</span>
          </span>
        </div>

        <div className={styles.specRow}>
          <span className={styles.specLabel}>
            <span className={styles.specDot} />
            Inference
          </span>
          <span className={styles.specPillGreen}>
            <Zap size={11} />
            <span>FastAPI Async (~140ms)</span>
          </span>
        </div>
      </div>

      {/* View details button */}
      <button
        type="button"
        className={styles.detailsBtn}
        onClick={onOpenDetails}
      >
        <span>View Complete Architecture & Metrics</span>
        <ArrowUpRight size={14} className={styles.detailsArrow} />
      </button>
    </div>
  )
}
