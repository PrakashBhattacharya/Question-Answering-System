import React, { useState } from 'react'
import {
  Sparkles, CheckCircle2, AlertTriangle, Send,
  Plus, AtSign, Paperclip, Search, ArrowRight,
  MoreHorizontal, MessageSquare, ShieldCheck, Zap
} from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import MotionVideoPlayer from '../ui/MotionVideoPlayer'
import styles from './ProductPreview.module.css'

export default function ProductPreview() {
  const titleRef = useScrollReveal({ threshold: 0.15 })
  const [inputValue, setInputValue] = useState('@ContextIQ see the answer in this document...')
  const [activeTab, setActiveTab] = useState('all')

  return (
    <section id="workspace-preview" className={styles.section}>
      <div className={styles.topLine} aria-hidden="true" />

      <div className="container">
        {/* ── Header in Linear style ───────────────────────────── */}
        <div ref={titleRef} className={styles.header}>
          <span className="section-eyebrow">
            <Sparkles size={11} />
            Living Workspace
          </span>
          <h2 className={styles.headline}>
            <span className={styles.headlineWhite}>A new species of answer engine.</span>{' '}
            <span className={styles.headlineGray}>
              Purpose-built for modern teams with document intelligence at its core.
              Ask questions, verify evidence, and keep your findings organized.
            </span>
          </h2>
        </div>

        {/* ── Full-width Linear Board + Floating Thread (Screenshot 4) ── */}
        <div className={styles.boardCanvas}>
          <div className={styles.canvasAtmosphere} aria-hidden="true" />

          {/* Background Kanban / Document Board */}
          <div className={styles.boardGrid}>
            {/* Column 1: To Review */}
            <div className={styles.boardCol}>
              <div className={styles.colTitleRow}>
                <span className={styles.colStatusDot} style={{ background: '#94a3b8' }} />
                <span className={styles.colTitle}>To Review</span>
                <span className={styles.colCount}>14</span>
                <MoreHorizontal size={13} className={styles.colMore} />
              </div>

              <div className={styles.cardList}>
                <div className={styles.issueCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.issueId}>DOC-926</span>
                    <span className={styles.avatarMini} style={{ background: '#ec4899' }}>L</span>
                  </div>
                  <div className={styles.issueTitle}>Clinical Trial Findings Summary</div>
                  <div className={styles.issueTags}>
                    <span className={`${styles.tag} ${styles.tagRed}`}>Medical</span>
                    <span className={`${styles.tag} ${styles.tagGray}`}>12 pages</span>
                  </div>
                </div>

                <div className={styles.issueCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.issueId}>DOC-2088</span>
                    <span className={styles.avatarMini} style={{ background: '#3b82f6' }}>D</span>
                  </div>
                  <div className={styles.issueTitle}>Vendor Master Services Agreement</div>
                  <div className={styles.issueTags}>
                    <span className={`${styles.tag} ${styles.tagBlue}`}>Legal</span>
                    <span className={`${styles.tag} ${styles.tagGray}`}>Section 4.2</span>
                  </div>
                </div>

                <div className={styles.issueCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.issueId}>DOC-924</span>
                    <span className={styles.avatarMini} style={{ background: '#8b5cf6' }}>A</span>
                  </div>
                  <div className={styles.issueTitle}>Q3 Shareholder Earnings Letter</div>
                  <div className={styles.issueTags}>
                    <span className={`${styles.tag} ${styles.tagPurple}`}>Finance</span>
                    <span className={`${styles.tag} ${styles.tagGreen}`}>Audited</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress / Analyzing */}
            <div className={styles.boardCol}>
              <div className={styles.colTitleRow}>
                <span className={styles.colStatusDot} style={{ background: '#f59e0b' }} />
                <span className={styles.colTitle}>In Progress</span>
                <span className={styles.colCount}>3</span>
                <MoreHorizontal size={13} className={styles.colMore} />
              </div>

              <div className={styles.cardList}>
                <div className={`${styles.issueCard} ${styles.issueCardActive}`}>
                  <div className={styles.cardTop}>
                    <span className={styles.issueId}>DOC-1487</span>
                    <span className={styles.avatarMini} style={{ background: '#5e6ad2' }}>IQ</span>
                  </div>
                  <div className={styles.issueTitle}>Apollo 11 Flight Telemetry Report</div>
                  <div className={styles.issueTags}>
                    <span className={`${styles.tag} ${styles.tagIndigo}`}>Analyzing text</span>
                    <span className={`${styles.tag} ${styles.tagCyan}`}>⚡ Real-Time BERT</span>
                  </div>
                </div>

                <div className={styles.issueCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.issueId}>MKT-1028</span>
                    <span className={styles.avatarMini} style={{ background: '#10b981' }}>M</span>
                  </div>
                  <div className={styles.issueTitle}>Customer Privacy Security Audit</div>
                  <div className={styles.issueTags}>
                    <span className={`${styles.tag} ${styles.tagBlue}`}>Compliance</span>
                  </div>
                </div>

                <div className={styles.issueCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.issueId}>ENG-2197</span>
                    <span className={styles.avatarMini} style={{ background: '#f97316' }}>R</span>
                  </div>
                  <div className={styles.issueTitle}>Server Latency SLA Thresholds</div>
                  <div className={styles.issueTags}>
                    <span className={`${styles.tag} ${styles.tagGreen}`}>Infrastructure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Verified Answers */}
            <div className={styles.boardCol}>
              <div className={styles.colTitleRow}>
                <span className={styles.colStatusDot} style={{ background: '#4ade80' }} />
                <span className={styles.colTitle}>Verified Answers</span>
                <span className={styles.colCount}>89</span>
                <MoreHorizontal size={13} className={styles.colMore} />
              </div>

              <div className={styles.cardList}>
                <div className={styles.issueCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.issueId}>DOC-2074</span>
                    <span className={styles.avatarMini} style={{ background: '#4ade80' }}>✓</span>
                  </div>
                  <div className={styles.issueTitle}>GDPR Data Retention Statutory Limits</div>
                  <div className={styles.issueTags}>
                    <span className={`${styles.tag} ${styles.tagGreen}`}>100% Match</span>
                  </div>
                </div>

                <div className={styles.issueCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.issueId}>DOC-1912</span>
                    <span className={styles.avatarMini} style={{ background: '#4ade80' }}>✓</span>
                  </div>
                  <div className={styles.issueTitle}>Patent Prior Art Citation Index</div>
                  <div className={styles.issueTags}>
                    <span className={`${styles.tag} ${styles.tagGreen}`}>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Floating Thread Modal (Matching Screenshot 4) ───── */}
          <div className={styles.floatingThread}>
            {/* Thread Header */}
            <div className={styles.threadHeader}>
              <div className={styles.threadTitleBox}>
                <MessageSquare size={13} className={styles.threadIcon} />
                <span className={styles.threadTitle}>Thread</span>
                <span className={styles.threadChannel}>#apollo-11-report</span>
              </div>
              <MoreHorizontal size={14} className={styles.threadMore} />
            </div>

            {/* Thread Messages */}
            <div className={styles.threadBody}>
              {/* Message 1: User */}
              <div className={styles.messageRow}>
                <div className={styles.avatarSarah}>S</div>
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <span className={styles.authorName}>sarah</span>
                    <span className={styles.messageTime}>8:27 PM</span>
                  </div>
                  <p className={styles.messageText}>
                    Can someone verify when Apollo 11 landed on the Moon and who stepped out first?
                  </p>
                </div>
              </div>

              {/* Message 2: ContextIQ Bot Answer */}
              <div className={styles.messageRow}>
                <div className={styles.avatarIQ}>
                  <Zap size={11} fill="#ffffff" color="#ffffff" />
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <span className={styles.authorNameIQ}>ContextIQ Verified Answer</span>
                    <span className={styles.messageTime}>8:27 PM</span>
                  </div>
                  <div className={styles.botAnswerBubble}>
                    <p className={styles.answerText}>
                      "Apollo 11 landed on the Moon on <span className={styles.highlightSpan}>July 20, 1969</span>. <span className={styles.highlightSpan}>Neil Armstrong</span> was the first human to step onto the lunar surface."
                    </p>

                    {/* ── 3.6s Real-Time Inference Stream (Question → AI Processing → Answer → Evidence) ── */}
                    <div className={styles.botMotionProof}>
                      <MotionVideoPlayer
                        concept="qa-stream"
                        src="/animations/qa-mini-loop.webm?v=clear1"
                        title="Continuous Extractive QA Stream"
                        tag="3.6s QA Loop"
                        aspectRatio="16/9"
                      />
                    </div>

                    <div className={styles.sourceBadge}>
                      <CheckCircle2 size={11} color="#4ade80" />
                      <span>Exact sentence verified · Page 4, Paragraph 2 · Source Grounded</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message 3: Marcus User */}
              <div className={styles.messageRow}>
                <div className={styles.avatarMarcus}>M</div>
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <span className={styles.authorName}>marcus</span>
                    <span className={styles.messageTime}>8:28 PM</span>
                  </div>
                  <p className={styles.messageText}>
                    Does the flight log mention if they found any liquid water on the landing site?
                  </p>
                </div>
              </div>

              {/* Message 4: Honest No-Answer Safeguard */}
              <div className={styles.messageRow}>
                <div className={styles.avatarIQ}>
                  <ShieldCheck size={11} color="#ffffff" />
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <span className={styles.authorNameIQ}>ContextIQ Safeguard</span>
                    <span className={styles.messageTime}>8:28 PM</span>
                  </div>
                  <div className={styles.noAnswerBubble}>
                    <div className={styles.noAnswerHead}>
                      <AlertTriangle size={12} color="#fbbf24" />
                      <strong>Not Mentioned in Document</strong>
                    </div>
                    <p className={styles.noAnswerExplain}>
                      The document does not mention liquid water on the surface. Safeguard triggered — zero hallucination generated.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Bar (Matching Screenshot 4 bottom command bar) */}
            <div className={styles.threadInputBox}>
              <div className={styles.inputInner}>
                <input
                  type="text"
                  className={styles.threadInput}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question about this document..."
                />
              </div>

              <div className={styles.inputToolbar}>
                <div className={styles.toolIcons}>
                  <button type="button" className={styles.toolBtn} aria-label="Format"><Plus size={13} /></button>
                  <button type="button" className={styles.toolBtn} aria-label="Text"><span style={{ fontWeight: 600, fontSize: '0.72rem' }}>Aa</span></button>
                  <button type="button" className={styles.toolBtn} aria-label="Mention"><AtSign size={13} /></button>
                  <button type="button" className={styles.toolBtn} aria-label="Attach"><Paperclip size={13} /></button>
                </div>

                <button
                  type="button"
                  className={styles.sendBtn}
                  onClick={() => setInputValue('@ContextIQ verified from source.')}
                >
                  <span>See the Answer</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
