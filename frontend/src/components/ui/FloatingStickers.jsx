import React from 'react'
import { Sparkles, Zap, CheckCircle2, Database, Bot, Target } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import styles from './FloatingStickers.module.css'

export const HERO_STICKERS = [
  {
    id: 'bert',
    text: 'BERT POWERED',
    icon: Sparkles,
    position: 'topRight',
    theme: 'indigo',
    delay: '0s',
  },
  {
    id: 'inference',
    text: 'REAL-TIME INFERENCE',
    icon: Zap,
    position: 'bottomCenter',
    theme: 'cyan',
    delay: '1.2s',
  },
  {
    id: 'evidence',
    text: 'EVIDENCE GROUNDED',
    icon: CheckCircle2,
    position: 'rightCenter',
    theme: 'emerald',
    delay: '0.6s',
  },
  {
    id: 'squad',
    text: 'SQuAD 2.0 BENCHMARK',
    icon: Database,
    position: 'bottomLeft',
    theme: 'amber',
    delay: '2.1s',
  },
  {
    id: 'qa',
    text: 'AI QUESTION ANSWERING',
    icon: Bot,
    position: 'topLeft',
    theme: 'violet',
    delay: '1.7s',
  },
  {
    id: 'span',
    text: 'SPAN EXTRACTION',
    icon: Target,
    position: 'bottomRight',
    theme: 'pink',
    delay: '2.8s',
  },
]

export const IMPERIUM_STICKERS = [
  {
    id: 'bert',
    text: '✦ BERT POWERED',
    icon: Sparkles,
    position: 'topRight',
    theme: 'gold',
    delay: '0s',
  },
  {
    id: 'evidence',
    text: '◆ EVIDENCE VERIFIED',
    icon: CheckCircle2,
    position: 'rightCenter',
    theme: 'gold',
    delay: '0.8s',
  },
  {
    id: 'context',
    text: '◈ CONTEXT READY',
    icon: Target,
    position: 'bottomCenter',
    theme: 'gold',
    delay: '1.6s',
  },
  {
    id: 'intelligence',
    text: '⚜ INTELLIGENCE ACTIVE',
    icon: Zap,
    position: 'topLeft',
    theme: 'gold',
    delay: '2.4s',
  },
  {
    id: 'zero',
    text: '⛨ ZERO FABRICATION',
    icon: Database,
    position: 'bottomLeft',
    theme: 'gold',
    delay: '1.2s',
  },
  {
    id: 'squad',
    text: '❖ SQuAD 2.0 VERIFIED',
    icon: Bot,
    position: 'bottomRight',
    theme: 'gold',
    delay: '3.0s',
  },
]

export default function FloatingStickers({ stickers, className = '' }) {
  const { theme } = useTheme()
  const activeStickers = stickers || (theme === 'imperium' ? IMPERIUM_STICKERS : HERO_STICKERS)

  return (
    <div className={`${styles.stickersOverlay} ${className}`} aria-hidden="true">
      {activeStickers.map((stk) => {
        const Icon = stk.icon
        return (
          <div
            key={stk.id}
            className={`${styles.sticker} ${styles[stk.position]} ${styles[`theme_${stk.theme}`]}`}
            style={{ animationDelay: stk.delay }}
          >
            <div className={styles.stickerInner}>
              <div className={styles.iconWrap}>
                <Icon size={12} className={styles.icon} />
              </div>
              <span className={styles.text}>{stk.text}</span>
            </div>
            <div className={styles.glow} />
          </div>
        )
      })}
    </div>
  )
}
