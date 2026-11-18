import React, { useState } from 'react'
import {
  Monitor, Settings, ClipboardList, Megaphone,
  Shapes, Tag, ArrowRight, CheckCircle2, Zap, FileText
} from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import styles from './TeamsSection.module.css'

/* ── Custom Icons matching Screenshot 2 precisely ──────────── */
function SoftwareIcon() {
  return (
    <div className={styles.iconSquircle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="3" stroke="#8b5cf6" strokeWidth="2"/>
        <path d="M8 21h8M12 17v4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
        <rect x="5" y="6" width="14" height="8" rx="1.5" fill="#f59e0b" fillOpacity="0.85"/>
      </svg>
    </div>
  )
}

function OperationsIcon() {
  return (
    <div className={styles.iconSquircle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#a855f7" strokeWidth="2"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="#a855f7" strokeWidth="1.8"/>
        <circle cx="15" cy="9" r="2" fill="#f59e0b"/>
      </svg>
    </div>
  )
}

function HRIcon() {
  return (
    <div className={styles.iconSquircle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="3" fill="#f59e0b"/>
        <path d="M8 2h8a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#b45309"/>
        <circle cx="12" cy="11" r="2.5" fill="#dc2626"/>
        <path d="M8 17c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function AllTeamsIcon() {
  return (
    <div className={styles.iconBlueActive}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Double upward arrow matching Screenshot 2 center blue icon */}
        <path d="M5 14L12 7L19 14" stroke="#ffffff" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 19L12 14L17 19" stroke="#ffffff" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function MarketingIcon() {
  return (
    <div className={styles.iconSquircle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 11v2a2 2 0 002 2h1l3 4v-4h3l6 4V4l-6 4H5a2 2 0 00-2 2z" fill="#f59e0b"/>
        <path d="M19 8a5 5 0 010 7M21 5a9 9 0 010 13" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function DesignIcon() {
  return (
    <div className={styles.iconSquircle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 12H5l7-12z" fill="#a855f7" fillOpacity="0.85"/>
        <rect x="11" y="11" width="10" height="10" rx="2" fill="#10b981" fillOpacity="0.9"/>
        <circle cx="8" cy="16" r="4" fill="#f59e0b" fillOpacity="0.8"/>
      </svg>
    </div>
  )
}

function SalesIcon() {
  return (
    <div className={styles.iconSquircle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="12" height="8" rx="2" fill="#f59e0b"/>
        <rect x="9" y="10" width="12" height="8" rx="2" fill="#8b5cf6" fillOpacity="0.9"/>
        <path d="M12 14l2 2 4-4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

const TEAMS = [
  {
    id: 'software',
    name: 'Software',
    icon: SoftwareIcon,
    badge: 'Code & Architecture',
    title: 'Search API specs, RFCs, and system architecture',
    context: 'The Authentication Service v2 enforces token expiration after 3600 seconds. For unauthenticated clients, requests are throttled to a maximum rate of 60 requests per minute per origin IP address. Exceeded limits return HTTP 429 with Retry-After headers.',
    question: 'What is the rate limit for unauthenticated requests?',
    answer: '60 requests per minute per origin IP address',
    file: 'api-gateway-spec.md',
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: OperationsIcon,
    badge: 'SOPs & Infrastructure',
    title: 'Find exact steps in runbooks and procedures',
    context: 'Database cluster snapshots are automatically executed every 6 hours and replicated cross-region to us-east-2. Recovery Point Objective (RPO) is guaranteed at 15 minutes, with automated failover testing conducted on the first Tuesday of each month.',
    question: 'How often are automated database snapshots executed?',
    answer: 'every 6 hours',
    file: 'disaster-recovery-sop.pdf',
  },
  {
    id: 'hr',
    name: 'HR',
    icon: HRIcon,
    badge: 'Benefits & Guidelines',
    title: 'Instant policy answers from company handbooks',
    context: 'All full-time employees are entitled to 16 weeks of fully paid parental leave, available following the birth or adoption of a child. Additionally, team members receive a $1,500 annual home-office stipend renewed every January 1st.',
    question: 'How many weeks of paid parental leave are offered?',
    answer: '16 weeks of fully paid parental leave',
    file: 'global-employee-handbook-2024.pdf',
  },
  {
    id: 'all-teams',
    name: 'All Teams',
    icon: AllTeamsIcon,
    badge: 'Universal Knowledge',
    title: 'Instant verified truth across all team documents',
    context: 'ContextIQ operates with zero generative hallucinations. Every answer is extracted as a direct contiguous span from the text you provide. If the document does not contain the answer, the engine states so explicitly, ensuring total trust.',
    question: 'Does ContextIQ ever make up false answers?',
    answer: 'ContextIQ operates with zero generative hallucinations',
    file: 'company-knowledge-base.md',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: MarketingIcon,
    badge: 'Brand & Campaigns',
    title: 'Verify brand rules, guidelines, and press assets',
    context: 'The official ContextIQ brand guidelines specify JetBrains Mono for technical monospaced displays and Inter for UI body copy. The primary brand accent is Linear Indigo with hex code #5e6ad2, and must maintain 4.5:1 contrast against dark backgrounds.',
    question: 'What is the hex code for the primary brand accent?',
    answer: '#5e6ad2',
    file: 'brand-identity-guidelines-v3.pdf',
  },
  {
    id: 'design',
    name: 'Design',
    icon: DesignIcon,
    badge: 'Design Systems',
    title: 'Find token specifications and component rules',
    context: 'Surface card containers utilize border-radius token var(--radius-xl) measuring 14px with a 1px border colored rgba(255, 255, 255, 0.08). The specular inset highlight is 0 1px 0 rgba(255, 255, 255, 0.07).',
    question: 'What is the radius measurement for surface cards?',
    answer: '14px',
    file: 'design-tokens-v2.json',
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: SalesIcon,
    badge: 'Enterprise Deals',
    title: 'Pull contract terms, SLAs, and security answers',
    context: 'Enterprise plan customers receive a 99.99% monthly uptime SLA with 24/7 dedicated support engineers and a maximum 15-minute response time. SOC 2 Type II compliance reports and ISO 27001 certificates are accessible directly upon NDA execution.',
    question: 'What is the monthly uptime SLA for Enterprise accounts?',
    answer: '99.99% monthly uptime SLA',
    file: 'enterprise-msa-template.docx',
  },
]

export default function TeamsSection({ onGetStarted }) {
  const [selectedId, setSelectedId] = useState('all-teams')
  const titleRef = useScrollReveal({ threshold: 0.15 })

  const team = TEAMS.find(t => t.id === selectedId) || TEAMS[3]
  const IconComponent = team.icon

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div ref={titleRef} className={styles.header}>
          <h2 className={styles.title}>
            Built for everyday work across every team.
          </h2>
          <p className={styles.subtitle}>
            From engineering specs and HR policies to sales contracts — find the exact sentence you need in seconds.
          </p>
        </div>

        {/* ── Screenshot 2 Selector Bar ──────────────────────── */}
        <div className={styles.tabBarContainer}>
          <div className={styles.tabBar}>
            {TEAMS.map((t) => {
              const Icon = t.icon
              const isActive = selectedId === t.id
              const isCenter = t.id === 'all-teams'

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''} ${isCenter ? styles.tabBtnCenter : ''}`}
                >
                  <Icon />
                  <span className={styles.tabLabel}>{t.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Interactive Team Document Showcase ─────────────── */}
        <div className={styles.showcaseCard}>
          <div className={styles.showcaseHeader}>
            <div className={styles.showcaseLeft}>
              <span className={styles.badge}>{team.badge}</span>
              <h3 className={styles.showcaseTitle}>{team.title}</h3>
            </div>
            <div className={styles.filePill}>
              <FileText size={12} color="#a78bfa" />
              <span>{team.file}</span>
            </div>
          </div>

          <div className={styles.cardContent}>
            {/* Context with answer highlight */}
            <div className={styles.passageWrap}>
              <div className={styles.passageLabel}>
                <span className={styles.dotCyan} />
                <span>Document excerpt</span>
              </div>
              <p className={styles.passageText}>
                {team.context.split(team.answer).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <mark className={styles.highlight}>{team.answer}</mark>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* QA Box */}
            <div className={styles.qaWrap}>
              <div className={styles.questionBlock}>
                <span className={styles.qaTagQ}>Question</span>
                <p className={styles.qText}>"{team.question}"</p>
              </div>

              <div className={styles.answerBlock}>
                <div className={styles.answerHead}>
                  <CheckCircle2 size={13} color="#4ade80" />
                  <span className={styles.qaTagA}>Verified Answer</span>
                  <span className={styles.speedPill}><Zap size={10} /> Real-Time</span>
                </div>
                <p className={styles.aText}>"{team.answer}"</p>
              </div>

              <button
                type="button"
                className={styles.actionBtn}
                onClick={onGetStarted}
              >
                <span>Try with your own documents</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
