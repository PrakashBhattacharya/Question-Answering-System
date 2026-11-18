import React from 'react'
import {
  Brain, ShieldCheck, AlertTriangle, Highlighter,
  Layers, Zap, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import MotionVideoPlayer from '../ui/MotionVideoPlayer'
import styles from './FeaturesSection.module.css'

export default function FeaturesSection() {
  const titleRef = useScrollReveal({ threshold: 0.15 })

  return (
    <section id="features" className={styles.section}>
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.topDivider} aria-hidden="true" />

      <div className="container">
        {/* Section Header */}
        <div ref={titleRef} className={styles.header}>
          <span className="section-eyebrow">
            <Sparkles size={11} />
            Engine Architecture
          </span>
          <h2 className="section-heading">
            Engineered for precision.<br />
            <span className="gradient-text">Zero generative hallucinations.</span>
          </h2>
          <p className="section-subheading">
            ContextIQ pairs Hugging Face BERT with SQuAD 2.0 negative-sampling to extract exact,
            verifiable answers from your documents without hallucinating a single word.
          </p>
        </div>

        {/* Bento Grid: 1 Large Spotlight Card + 2 Medium Cards + 2 Compact Cards */}
        <div className={styles.bentoGrid}>

          {/* ── CARD 1: Large Spotlight (Extractive QA vs Generative) ── */}
          <div className={`${styles.card} ${styles.cardLarge}`}>
            <div className={styles.specularLine} aria-hidden="true" />
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrap} ${styles.iconIndigo}`}>
                <Brain size={20} />
              </div>
              <div className={styles.badgeWrap}>
                <span className={styles.badgeSuccess}>Zero Hallucination Guarantee</span>
              </div>
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Direct Extractive Span Architecture</h3>
              <p className={styles.cardDesc}>
                Traditional generative LLMs invent plausibly sounding sentences when uncertain. ContextIQ uses BERT's
                bidirectional cross-attention to predict start and end token indices directly within your document.
                Every single word in the answer existed in your original text.
              </p>
            </div>

            {/* Visual Element: Model Token Track & Logit Inspection */}
            <div className={styles.visualLarge}>
              <div className={styles.tokenVisualHeader}>
                <div className={styles.visualHeaderLeft}>
                  <span className={styles.visualMetaLabel}>BERT Token Sequence & Span Logits</span>
                  <span className={styles.visualSubLabel}>Bidirectional Cross-Attention Matrix</span>
                </div>
                <div className={styles.visualTagsGroup}>
                  <span className={styles.visualTagSpecial}>12-Layer Transformer</span>
                  <span className={styles.visualTag}>SQuAD 2.0 Span Head</span>
                </div>
              </div>

              {/* Unified Interactive Token Track */}
              <div className={styles.tokenTrackWrapper}>
                <div className={styles.tokenTrack}>
                  {/* Token [CLS] */}
                  <div className={`${styles.tokenCell} ${styles.tokenCellSpecial}`}>
                    <span className={styles.tokenStr}>[CLS]</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '12%' }} /></div>
                    <span className={styles.tokenIndex}>t₀</span>
                  </div>

                  {/* Query Tokens */}
                  <div className={styles.tokenCell}>
                    <span className={styles.tokenStr}>When</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '8%' }} /></div>
                    <span className={styles.tokenIndex}>t₁</span>
                  </div>
                  <div className={styles.tokenCell}>
                    <span className={styles.tokenStr}>was</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '6%' }} /></div>
                    <span className={styles.tokenIndex}>t₂</span>
                  </div>
                  <div className={styles.tokenCell}>
                    <span className={styles.tokenStr}>Apollo</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '14%' }} /></div>
                    <span className={styles.tokenIndex}>t₃</span>
                  </div>

                  {/* Separator */}
                  <div className={`${styles.tokenCell} ${styles.tokenCellSpecial}`}>
                    <span className={styles.tokenStr}>[SEP]</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '10%' }} /></div>
                    <span className={styles.tokenIndex}>t₄</span>
                  </div>

                  {/* Context Tokens */}
                  <div className={styles.tokenCell}>
                    <span className={styles.tokenStr}>Apollo</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '15%' }} /></div>
                    <span className={styles.tokenIndex}>t₅</span>
                  </div>
                  <div className={styles.tokenCell}>
                    <span className={styles.tokenStr}>11</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '18%' }} /></div>
                    <span className={styles.tokenIndex}>t₆</span>
                  </div>
                  <div className={styles.tokenCell}>
                    <span className={styles.tokenStr}>landed</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '22%' }} /></div>
                    <span className={styles.tokenIndex}>t₇</span>
                  </div>
                  <div className={styles.tokenCell}>
                    <span className={styles.tokenStr}>on</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '16%' }} /></div>
                    <span className={styles.tokenIndex}>t₈</span>
                  </div>

                  {/* TARGET EXTRACTED SPAN CAPSULE (July 20, 1969) */}
                  <div className={styles.extractedSpanGroup}>
                    <div className={styles.spanIndicatorBadge}>
                      <span className={styles.spanBadgeDot} />
                      <span>Extracted Target Span</span>
                    </div>

                    <div className={styles.spanTokensRow}>
                      <div className={`${styles.tokenCell} ${styles.tokenCellStart}`}>
                        <span className={styles.tokenStrHighlight}>July</span>
                        <div className={styles.logitBarTrack}><div className={`${styles.logitBar} ${styles.logitBarPeak}`} style={{ height: '98%' }} /></div>
                        <span className={styles.tokenLogitValue}>P=0.98</span>
                      </div>

                      <div className={`${styles.tokenCell} ${styles.tokenCellMid}`}>
                        <span className={styles.tokenStrHighlight}>20,</span>
                        <div className={styles.logitBarTrack}><div className={`${styles.logitBar} ${styles.logitBarMid}`} style={{ height: '75%' }} /></div>
                        <span className={styles.tokenLogitValue}>span</span>
                      </div>

                      <div className={`${styles.tokenCell} ${styles.tokenCellEnd}`}>
                        <span className={styles.tokenStrHighlight}>1969</span>
                        <div className={styles.logitBarTrack}><div className={`${styles.logitBar} ${styles.logitBarPeak}`} style={{ height: '99%' }} /></div>
                        <span className={styles.tokenLogitValue}>P=0.99</span>
                      </div>
                    </div>
                  </div>

                  {/* Ending [SEP] */}
                  <div className={`${styles.tokenCell} ${styles.tokenCellSpecial}`}>
                    <span className={styles.tokenStr}>[SEP]</span>
                    <div className={styles.logitBarTrack}><div className={styles.logitBar} style={{ height: '10%' }} /></div>
                    <span className={styles.tokenIndex}>t₁₂</span>
                  </div>
                </div>
              </div>

              <div className={styles.visualLargeFooter}>
                <div className={styles.extractedProof}>
                  <CheckCircle2 size={13} className={styles.greenCheck} />
                  <span>Exact contiguous slice verified: <strong>"July 20, 1969"</strong></span>
                  <span className={styles.spanCoordBadge}>[t₉ : t₁₁]</span>
                </div>
                <div className={styles.telemetryGroup}>
                  <span className={styles.lossMetric}>τ null: -1.84</span>
                  <span className={styles.lossMetricSuccess}>Loss: 0.002 (EM=1)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Medium Card (No-Answer Detection) ── */}
          <div className={`${styles.card} ${styles.cardMedium}`}>
            <div className={styles.specularLine} aria-hidden="true" />
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrap} ${styles.iconAmber}`}>
                <AlertTriangle size={18} />
              </div>
              <span className={styles.tagMono}>τ = -1.24 null threshold</span>
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>SQuAD 2.0 No-Answer Safeguard</h3>
              <p className={styles.cardDesc}>
                Trained on unanswerable questions to recognize when the context does not supply sufficient evidence.
                ContextIQ rejects unverified inquiries instead of speculating.
              </p>
            </div>

            {/* Visual Element: 3.6s SQuAD 2.0 Safeguard Video */}
            <div className={styles.visualGate}>
              <MotionVideoPlayer
                concept="safeguard"
                src="/animations/squad-safeguard.webm?v=clear1"
                title="SQuAD 2.0 Null-Span Gate & Safe Reject"
                tag="3.6s Safeguard Loop"
                aspectRatio="16/10"
              />
              <div className={styles.gateDecision} style={{ marginTop: '0.85rem' }}>
                <div className={styles.gateStatusReject}>
                  <span className={styles.statusDotAmber} />
                  <span>Answer Unmentioned in Document</span>
                </div>
                <span className={styles.gateBadge}>Safe Reject</span>
              </div>
            </div>
          </div>

          {/* ── CARD 3: Medium Card (Evidence Highlighting) ── */}
          <div className={`${styles.card} ${styles.cardMedium}`}>
            <div className={styles.specularLine} aria-hidden="true" />
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrap} ${styles.iconCyan}`}>
                <Highlighter size={18} />
              </div>
              <span className={styles.tagMono}>[char_start : char_end]</span>
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Instant Evidence Highlighting</h3>
              <p className={styles.cardDesc}>
                Receive exact character-level coordinate offsets for every answer. Reviewers can trace answers back
                to their exact source location in under one second.
              </p>
            </div>

            {/* Visual Element: 3.6s Real-Time Scanning & Evidence Extraction Video */}
            <div className={styles.visualHighlight}>
              <MotionVideoPlayer
                concept="evidence"
                src="/animations/evidence-extraction.webm?v=clear1"
                title="Context Scanning & Exact Span Isolation"
                tag="3.6s Evidence Loop"
                aspectRatio="16/10"
              />
              <div className={styles.highlightMeta} style={{ marginTop: '0.85rem' }}>
                <span>Span Coords: [31 : 62]</span>
                <span className={styles.confidencePill}>Source Grounded</span>
              </div>
            </div>
          </div>

          {/* ── CARD 4: Compact Card (Long-Context Sliding Window) ── */}
          <div className={`${styles.card} ${styles.cardCompact}`}>
            <div className={styles.specularLine} aria-hidden="true" />
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrap} ${styles.iconViolet}`}>
                <Layers size={18} />
              </div>
              <span className={styles.tagMono}>384 tok / 128 stride</span>
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Sliding Window Processing</h3>
              <p className={styles.cardDesc}>
                Processes extensive research papers, contracts, and notes through sliding attention windows with
                128-token overlap, ensuring no sentence boundaries are severed.
              </p>
            </div>

            {/* Visual Element: Sliding Window Overlap Diagram */}
            <div className={styles.visualWindows}>
              <div className={styles.windowBar1}>Window 0 (0-384)</div>
              <div className={styles.windowOverlap}>Overlap (128)</div>
              <div className={styles.windowBar2}>Window 1 (256-640)</div>
            </div>
          </div>

          {/* ── CARD 5: Compact Card (Sub-50ms FastAPI Engine) ── */}
          <div className={`${styles.card} ${styles.cardCompact}`}>
            <div className={styles.specularLine} aria-hidden="true" />
            <div className={styles.cardHeader}>
              <div className={`${styles.iconWrap} ${styles.iconEmerald}`}>
                <Zap size={18} />
              </div>
              <span className={styles.tagMono}>FastAPI + PyTorch</span>
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Sub-50ms Inference Engine</h3>
              <p className={styles.cardDesc}>
                Asynchronous Python backend with optimized PyTorch runtime delivering immediate span logits with minimal
                compute overhead and zero remote vendor latency.
              </p>
            </div>

            {/* Visual Element: Speed Meter */}
            <div className={styles.visualSpeed}>
              <div className={styles.speedMetricRow}>
                <span className={styles.speedLabel}>Avg. Execution Latency</span>
                <span className={styles.speedValue}>18ms</span>
              </div>
              <div className={styles.speedProgressBar}>
                <div className={styles.speedProgressFill} style={{ width: '88%' }} />
              </div>
              <span className={styles.speedFootnote}>10x faster than traditional generative LLM streaming</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
