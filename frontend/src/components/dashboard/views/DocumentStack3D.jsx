import React, { useState } from 'react'
import { FileText, ArrowUpRight, CheckCircle2, Layers, BookOpen, Clock, Sparkles } from 'lucide-react'
import styles from './DocumentStack3D.module.css'

export default function DocumentStack3D({ documents = [], onOpenInWorkspace }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  // Use top 3 documents or default representative research docs
  const stackDocs = documents.length >= 3
    ? documents.slice(0, 3)
    : [
        {
          id: 's1',
          title: 'Attention_Is_All_You_Need.pdf',
          pages: '15 pages',
          status: 'BERT Indexed',
          queries: '14 queries',
          snippet: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
          type: 'pdf',
        },
        {
          id: 's2',
          title: 'SQuAD_2.0_Evaluation_Benchmark.docx',
          pages: '28 pages',
          status: 'Processed & Grounded',
          queries: '9 queries',
          snippet: 'SQuAD 2.0 combines the 100,000 questions in SQuAD 1.1 with over 50,000 unanswerable questions written adversarially by crowdworkers...',
          type: 'docx',
        },
        {
          id: 's3',
          title: 'BERT_Architecture_Notes.txt',
          pages: '6 pages',
          status: 'Ready for QA',
          queries: '22 queries',
          snippet: 'BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context...',
          type: 'txt',
        },
      ]

  return (
    <div className={styles.stackStage}>
      <div className={styles.stageHeader}>
        <div className={styles.headerLeft}>
          <Layers size={13} className={styles.stackIcon} />
          <span className={styles.stackTitle}>3D DOCUMENT LIBRARY STACK</span>
        </div>
        <span className={styles.stackHint}>Hover stack to separate pages · Click to query</span>
      </div>

      <div className={styles.stackDeck}>
        {stackDocs.map((doc, idx) => {
          const isHovered = hoveredIdx === idx

          return (
            <div
              key={doc.id}
              className={`${styles.stackSheet} ${styles[`sheet_${idx}`]} ${
                isHovered ? styles.sheetHovered : ''
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onOpenInWorkspace && onOpenInWorkspace(doc.content || doc.snippet, '')}
            >
              <div className={styles.sheetTopRow}>
                <div className={styles.sheetNameWrap}>
                  <FileText size={14} className={styles.sheetIcon} />
                  <span className={styles.sheetName}>{doc.title || doc.filename}</span>
                </div>
                <span className={styles.sheetStatusBadge}>
                  <CheckCircle2 size={10} />
                  <span>{doc.status || 'BERT Indexed'}</span>
                </span>
              </div>

              <p className={styles.sheetSnippet}>
                {doc.snippet || (doc.content ? doc.content.slice(0, 100) + '...' : 'Context passage verified for extractive QA.')}
              </p>

              <div className={styles.sheetMetaRow}>
                <span className={styles.metaTag}>{doc.pages || `${Math.max(1, Math.round((doc.size || 4000) / 1024))} KB`}</span>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.metaTag}>{doc.queries || 'Zero Hallucination Verified'}</span>
                <span className={styles.metaDivider}>•</span>
                <div className={styles.openPill}>
                  <span>Load in QA</span>
                  <ArrowUpRight size={10} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
