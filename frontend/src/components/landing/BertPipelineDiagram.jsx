import React, { useState, useEffect } from 'react'
import { FileText, Cpu, Target, CheckCircle2, Binary, Sparkles, Layers } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import styles from './BertPipelineDiagram.module.css'

const NODES = [
  {
    id: 'context',
    step: '01',
    label: 'CONTEXT',
    sublabel: 'Raw Passage & Query',
    desc: 'Unstructured text + natural question encoded into UTF-8 stream',
    icon: FileText,
    badge: 'INPUT',
  },
  {
    id: 'tokenizer',
    step: '02',
    label: 'TOKENIZER',
    sublabel: 'BertTokenizerFast',
    desc: 'WordPiece vocabulary mapping, [CLS] & [SEP] boundary tokens',
    icon: Binary,
    badge: '7,680 TOKENS',
  },
  {
    id: 'bert',
    step: '03',
    label: 'BERT',
    sublabel: '12-Layer Transformer',
    desc: 'Bidirectional self-attention matrix & contextual representations',
    icon: Cpu,
    badge: '110M PARAMS',
  },
  {
    id: 'span',
    step: '04',
    label: 'START / END',
    sublabel: 'Logits Classification',
    desc: 'Linear span predictor scoring start and end probability distributions',
    icon: Target,
    badge: 'SQuAD 2.0',
  },
  {
    id: 'answer',
    step: '05',
    label: 'ANSWER',
    sublabel: 'Extracted Span',
    desc: '100% extractive proof slice or null-score unanswerable flag',
    icon: CheckCircle2,
    badge: 'EXACT MATCH',
  },
]

export default function BertPipelineDiagram({ className = '', compact = false }) {
  const { theme } = useTheme()
  const [activeNode, setActiveNode] = useState(2) // Default BERT selected
  const [pulseIndex, setPulseIndex] = useState(0)

  // Animated particle pulse through pipeline
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % NODES.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className={`${styles.diagramWrapper} ${styles[`theme_${theme}`]} ${compact ? styles.compact : ''} ${className}`}
      data-diagram-theme={theme}
      role="region"
      aria-label="BERT Extractive Pipeline Architecture Diagram"
    >
      <div className={styles.diagramHeader}>
        <div className={styles.diagramTitleRow}>
          <div className={styles.diagramIndicator} />
          <span className={styles.diagramTitle}>
            {theme === 'imperium' ? '⚜ IMPERIUM ROYAL INTELLIGENCE DIAGRAM' : theme === 'pixelcraft' ? '▣ BERT PIPELINE [BLOCK SEQUENCE]' : 'BERT Extractive QA Pipeline'}
          </span>
          <span className={styles.diagramTag}>
            {theme === 'imperium' ? 'ROYAL INTELLIGENCE ENGINE' : theme === 'void' ? 'ZERO-DISTRACTION' : theme === 'cloud' ? 'ENTERPRISE ARCHITECTURE' : theme === 'ember' ? 'EDITORIAL SCHEMATIC' : theme === 'pixelcraft' ? 'VOXEL ENGINE' : 'NEURAL FLOW'}
          </span>
        </div>
        <span className={styles.diagramSub}>
          {theme === 'imperium' ? 'Inspect internal royal tensor transformations and span prediction logits' : 'Click any processing node to inspect internal tensor transformations'}
        </span>
      </div>

      {/* Nodes and Connectors Grid */}
      <div className={styles.nodesContainer}>
        {NODES.map((node, index) => {
          const Icon = node.icon
          const isSelected = activeNode === index
          const isPulsing = pulseIndex === index
          const isLast = index === NODES.length - 1

          return (
            <React.Fragment key={node.id}>
              {/* Pipeline Node */}
              <div
                className={`${styles.nodeCard} ${isSelected ? styles.nodeCardSelected : ''} ${isPulsing ? styles.nodePulsing : ''}`}
                onClick={() => setActiveNode(index)}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveNode(index)
                  }
                }}
              >
                {/* Pixelcraft Corner Notches */}
                {theme === 'pixelcraft' && (
                  <>
                    <span className={styles.pixelCornerTL} />
                    <span className={styles.pixelCornerBR} />
                  </>
                )}

                {/* Imperium Corner Details */}
                {theme === 'imperium' && (
                  <>
                    <span className={styles.imperiumCornerTL} />
                    <span className={styles.imperiumCornerBR} />
                  </>
                )}

                <div className={styles.nodeTopRow}>
                  <span className={styles.nodeStep}>{node.step}</span>
                  <span className={styles.nodeBadge}>{node.badge}</span>
                </div>

                {/* Imperium Special BERT Core for Node 03 */}
                {theme === 'imperium' && node.id === 'bert' ? (
                  <div className={styles.imperiumCoreWrap}>
                    <div className={styles.imperiumCoreRing} />
                    <div className={styles.imperiumCoreDisc}>
                      <span className={styles.imperiumSeal}>⚜</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.nodeIconWrap}>
                    <Icon size={18} className={styles.nodeIcon} />
                  </div>
                )}

                <div className={styles.nodeBody}>
                  <h4 className={styles.nodeLabel}>{node.label}</h4>
                  <span className={styles.nodeSublabel}>{node.sublabel}</span>
                </div>

                {/* Voxel particles or glowing underline */}
                {theme === 'pixelcraft' ? (
                  <div className={styles.voxelUnderline}>
                    <span className={styles.voxelBlock} />
                    <span className={styles.voxelBlock} />
                    <span className={styles.voxelBlock} />
                  </div>
                ) : (
                  <div className={styles.nodeGlowBar} />
                )}
              </div>

              {/* Inter-node connector */}
              {!isLast && (
                <div
                  className={`${styles.connector} ${pulseIndex === index ? styles.connectorActive : ''}`}
                  aria-hidden="true"
                >
                  {theme === 'pixelcraft' ? (
                    <div className={styles.pixelLine}>
                      <span className={styles.pixelDot} />
                      <span className={styles.pixelTrack} />
                      <span className={styles.pixelArrow}>▶</span>
                    </div>
                  ) : theme === 'imperium' ? (
                    <div className={styles.imperiumLine}>
                      <span className={styles.imperiumTrack} />
                      <span className={styles.imperiumPoint} />
                      <span className={styles.imperiumArrow}>✦</span>
                    </div>
                  ) : (
                    <div className={styles.vectorLine}>
                      <span className={styles.pulseLaser} />
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.lineSvg}>
                        <path d="M4 12h14m-5-5l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Selected Node Deep-Dive Detail Drawer */}
      <div className={styles.nodeDetailDrawer}>
        <div className={styles.drawerLeft}>
          <div className={styles.drawerBadge}>
            STAGE {NODES[activeNode].step}: {NODES[activeNode].label}
          </div>
          <p className={styles.drawerDesc}>{NODES[activeNode].desc}</p>
        </div>
        <div className={styles.drawerRight}>
          <span className={styles.drawerStatusDot} />
          <span className={styles.drawerStatusText}>
            {theme === 'pixelcraft' ? 'BLOCK READY' : 'Operational • In-Memory'}
          </span>
        </div>
      </div>
    </div>
  )
}
