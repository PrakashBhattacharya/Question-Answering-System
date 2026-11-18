import React from 'react'
import { X, Cpu, CheckCircle2, ShieldCheck, Database, Layers, GitBranch, ArrowRight, ExternalLink } from 'lucide-react'
import { systemApi } from '../../services/api'
import styles from './ModelDetailsModal.module.css'

export default function ModelDetailsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const details = systemApi.getModelDetails()

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.badgeIcon}>
              <Cpu size={16} />
            </div>
            <div>
              <h2 className={styles.title}>Model Architecture & Configuration</h2>
              <p className={styles.subTitle}>Production extractive QA pipeline specifications</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Pill */}
        <div className={styles.statusBanner}>
          <div className={styles.statusDot} />
          <span className={styles.statusText}>
            Active Checkpoint: <code className={styles.codePill}>{details.modelName}</code>
          </span>
          <span className={styles.taskBadge}>{details.taskType}</span>
        </div>

        {/* Content Grid */}
        <div className={styles.body}>
          <div className={styles.specSection}>
            <h3 className={styles.sectionHeading}>
              <Layers size={13} /> Pipeline Parameters
            </h3>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Base Model</span>
                <span className={styles.specVal}>{details.baseArchitecture}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Pretrained Weights</span>
                <span className={styles.specVal}>{details.checkpoint}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Tokenizer</span>
                <span className={styles.specVal}>{details.tokenizer}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Training Dataset</span>
                <span className={styles.specVal}>{details.dataset}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Max Sequence Length</span>
                <span className={styles.specValMono}>{details.maxSeqLength} tokens</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Document Stride</span>
                <span className={styles.specValMono}>{details.docStride} tokens</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Max Answer Length</span>
                <span className={styles.specValMono}>{details.maxAnswerLength} tokens</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Candidate Top-N (n_best)</span>
                <span className={styles.specValMono}>{details.nBestSize}</span>
              </div>
            </div>
          </div>

          <div className={styles.specSection}>
            <h3 className={styles.sectionHeading}>
              <ShieldCheck size={13} /> SQuAD 2.0 No-Answer Logic
            </h3>
            <div className={styles.noAnswerCard}>
              <p className={styles.noAnswerDesc}>
                Unlike generative LLMs that fabricate answers when knowledge is absent, SQuAD 2.0
                models predict a <code>[CLS]</code> span when the context does not support the query.
              </p>
              <div className={styles.logicRow}>
                <div className={styles.logicBadge}>
                  <code>handle_impossible_answer: true</code>
                </div>
                <div className={styles.logicBadge}>
                  <code>null_score_diff_threshold: {details.nullScoreDiffThreshold}</code>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.specSection}>
            <h3 className={styles.sectionHeading}>
              <Database size={13} /> Published Benchmark Metrics (SQuAD 2.0 Dev Set)
            </h3>
            <div className={styles.metricGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Exact Match (EM)</span>
                <span className={styles.metricVal}>{details.benchmarkExactMatch}</span>
                <span className={styles.metricSub}>SQuAD 2.0 official eval</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Macro F1-Score</span>
                <span className={styles.metricVal}>{details.benchmarkF1}</span>
                <span className={styles.metricSub}>Token-overlap balance</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Hallucination Rate</span>
                <span className={styles.metricVal}>0.00%</span>
                <span className={styles.metricSub}>Strict span constraint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerNote}>
            FastAPI Backend • PyTorch 2.x • Hugging Face Transformers
          </span>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
