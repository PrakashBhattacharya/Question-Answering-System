import React from 'react'
import { Loader2, CheckCircle2, Cpu, Sparkles } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import ImperiumCorners from '../../ui/ImperiumCorners'
import styles from './InferenceSteps.module.css'

export const INFERENCE_STAGES = [
  { id: 'prep', label: 'Preparing context passage', desc: 'Validating text bounds & encoding' },
  { id: 'tok', label: 'Tokenizing with Fast Tokenizer', desc: 'Segment embeddings & [CLS]/[SEP] markers' },
  { id: 'bert', label: 'Transformer multi-head self-attention', desc: 'Feedforward transformer layer evaluation' },
  { id: 'span', label: 'Extracting start & end token logits', desc: 'Computing contiguous probability distributions' },
  { id: 'rank', label: 'SQuAD 2.0 null-score candidate ranking', desc: 'Comparing span likelihood against unanswerable threshold' },
]

const MODEL_LABELS = {
  bert: 'BERT',
  roberta: 'RoBERTa',
  distilbert: 'DistilBERT',
}

const ROMAN_STAGES = ['I', 'II', 'III', 'IV', 'V']

export default function InferenceSteps({ activeStage = 0, model = 'bert' }) {
  const { isImperium } = useTheme()
  const modelLabel = MODEL_LABELS[model] || 'BERT'
  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <ImperiumCorners />
      <div className={styles.headerRow}>
        <div className={styles.pulseDot} />
        <span className={styles.headerTitle}>
          {isImperium ? `⚜ ${modelLabel} Imperial Inference Sequence` : `${modelLabel} Inference Sequence in Progress`}
        </span>
        <span className={styles.engineBadge}>PyTorch • FastAPI</span>
      </div>

      <div className={styles.timeline}>
        {INFERENCE_STAGES.map((stage, idx) => {
          const isDone = idx < activeStage
          const isCurrent = idx === activeStage
          const isPending = idx > activeStage

          return (
            <div
              key={stage.id}
              className={`${styles.step} ${
                isDone ? styles.stepDone : isCurrent ? styles.stepCurrent : styles.stepPending
              }`}
            >
              <div className={styles.stepIndicator}>
                {isDone && <CheckCircle2 size={13} className={styles.checkIcon} />}
                {isCurrent && <Loader2 size={13} className={styles.spinIcon} />}
                {isPending && <span className={styles.dot} />}
              </div>

              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>
                  {isImperium ? `[${ROMAN_STAGES[idx]}] ${stage.label}` : stage.label}
                </div>
                <div className={styles.stepDesc}>{stage.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
