import React, { useRef, useEffect, useState } from 'react'
import { Play, Pause, Sparkles } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import styles from './MotionVideoPlayer.module.css'

/**
 * Palette configuration for the 5 ContextIQ design systems
 */
function getThemeColors(theme) {
  switch (theme) {
    case 'void':
      return {
        bg: '#000000',
        bgSubtle: '#080808',
        grid: 'rgba(255, 255, 255, 0.04)',
        cardBg: '#0e0e0e',
        cardBorder: 'rgba(255, 255, 255, 0.14)',
        cardBorderActive: '#ffffff',
        text1: '#ffffff',
        text2: '#d4d4d8',
        textMuted: '#71717a',
        accent: '#ffffff',
        accentLight: '#f4f4f5',
        accentGlow: 'rgba(255, 255, 255, 0.45)',
        accentBg: 'rgba(255, 255, 255, 0.08)',
        success: '#ffffff',
        successLight: '#f4f4f5',
        successBg: 'rgba(255, 255, 255, 0.16)',
        warning: '#a1a1aa',
        warningBg: 'rgba(255, 255, 255, 0.08)',
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontMono: '"JetBrains Mono", "Fira Code", monospace',
        isPixel: false,
        isVoid: true,
      }
    case 'cloud':
      return {
        bg: '#f8fafc',
        bgSubtle: '#ffffff',
        grid: '#e2e8f0',
        cardBg: '#ffffff',
        cardBorder: '#cbd5e1',
        cardBorderActive: '#2563eb',
        text1: '#0f172a',
        text2: '#334155',
        textMuted: '#64748b',
        accent: '#2563eb',
        accentLight: '#3b82f6',
        accentGlow: 'rgba(37, 99, 235, 0.25)',
        accentBg: 'rgba(37, 99, 235, 0.09)',
        success: '#059669',
        successLight: '#10b981',
        successBg: 'rgba(16, 185, 129, 0.14)',
        warning: '#d97706',
        warningBg: 'rgba(217, 119, 6, 0.14)',
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontMono: '"JetBrains Mono", "Fira Code", monospace',
        isPixel: false,
      }
    case 'ember':
      return {
        bg: '#fff8f0',
        bgSubtle: '#fff3e0',
        grid: 'rgba(234, 88, 12, 0.1)',
        cardBg: '#ffffff',
        cardBorder: 'rgba(234, 88, 12, 0.25)',
        cardBorderActive: '#ea580c',
        text1: '#1c0a00',
        text2: '#431407',
        textMuted: '#78350f',
        accent: '#ea580c',
        accentLight: '#f97316',
        accentGlow: 'rgba(234, 88, 12, 0.32)',
        accentBg: 'rgba(234, 88, 12, 0.12)',
        success: '#15803d',
        successLight: '#16a34a',
        successBg: 'rgba(21, 128, 61, 0.14)',
        warning: '#d97706',
        warningBg: 'rgba(217, 119, 6, 0.14)',
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontMono: '"JetBrains Mono", "Fira Code", monospace',
        isPixel: false,
      }
    case 'pixelcraft':
      return {
        bg: '#0e1810',
        bgSubtle: '#142217',
        grid: 'rgba(74, 222, 128, 0.08)',
        cardBg: '#182b1c',
        cardBorder: '#388e3c',
        cardBorderActive: '#22c55e',
        text1: '#f0fdf4',
        text2: '#86efac',
        textMuted: '#4ade80',
        accent: '#22c55e',
        accentLight: '#4ade80',
        accentGlow: 'rgba(34, 197, 94, 0.4)',
        accentBg: 'rgba(34, 197, 94, 0.18)',
        success: '#4ade80',
        successLight: '#86efac',
        successBg: 'rgba(74, 222, 128, 0.22)',
        warning: '#facc15',
        warningBg: 'rgba(250, 204, 21, 0.22)',
        fontSans: '"JetBrains Mono", monospace',
        fontMono: '"JetBrains Mono", monospace',
        isPixel: true,
      }
    case 'imperium':
      return {
        bg: '#000000',
        bgSubtle: '#080808',
        grid: 'rgba(198, 162, 58, 0.035)',
        cardBg: '#080808',
        cardBorder: 'rgba(168, 132, 42, 0.28)',
        cardBorderActive: '#c6a23a',
        text1: '#f5f2e8',
        text2: '#b7b2a4',
        textMuted: '#77736a',
        accent: '#c6a23a',
        accentLight: '#d4af37',
        accentGlow: 'rgba(198, 162, 58, 0.28)',
        accentBg: 'rgba(198, 162, 58, 0.10)',
        success: '#c6a23a',
        successLight: '#f5f2e8',
        successBg: 'rgba(198, 162, 58, 0.12)',
        warning: '#d4af37',
        warningBg: 'rgba(212, 175, 55, 0.12)',
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontDisplay: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontMono: '"JetBrains Mono", "Fira Code", monospace',
        isPixel: false,
        isImperium: true,
      }
    case 'original':
    default:
      return {
        bg: '#07080a',
        bgSubtle: '#0e1017',
        grid: 'rgba(99, 102, 241, 0.07)',
        cardBg: 'rgba(16, 19, 29, 0.96)',
        cardBorder: 'rgba(99, 102, 241, 0.3)',
        cardBorderActive: '#22d3ee',
        text1: '#f8fafc',
        text2: '#cbd5e1',
        textMuted: '#64748b',
        accent: '#6366f1',
        accentLight: '#22d3ee',
        accentGlow: 'rgba(99, 102, 241, 0.45)',
        accentBg: 'rgba(99, 102, 241, 0.16)',
        success: '#22d3ee',
        successLight: '#67e8f9',
        successBg: 'rgba(34, 211, 238, 0.16)',
        warning: '#f59e0b',
        warningBg: 'rgba(245, 158, 11, 0.16)',
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontMono: '"JetBrains Mono", "Fira Code", monospace',
        isPixel: false,
      }
  }
}

function drawBackgroundAndGrid(ctx, width, height, colors) {
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, width, height)

  // Subtle radial depth aura
  const rad = ctx.createRadialGradient(
    width / 2, height / 2, 20,
    width / 2, height / 2, width * 0.55
  )
  rad.addColorStop(0, colors.accentBg)
  rad.addColorStop(1, 'transparent')
  ctx.fillStyle = rad
  ctx.fillRect(0, 0, width, height)

  // Technical blueprint / circuit grid
  ctx.strokeStyle = colors.grid
  ctx.lineWidth = 1
  const gridSize = colors.isPixel ? 24 : 32
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }
}

function drawRoundedBox(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath()
  if (r > 0 && ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

/* ══════════════════════════════════════════════════════════════════
   CONCEPT 1: SQuAD 2.0 No-Answer Safeguard Gate
   Explains: Null-Score Threshold Gate, Query Interception & Safe Reject
   ══════════════════════════════════════════════════════════════════ */
function renderSafeguard(ctx, width, height, progress, colors) {
  drawBackgroundAndGrid(ctx, width, height, colors)

  // Top Telemetry Header
  ctx.fillStyle = colors.warning
  ctx.font = `700 9.5px ${colors.fontMono}`
  ctx.textAlign = 'left'
  ctx.fillText('⛨ SQuAD 2.0 NO-ANSWER SAFEGUARD • NULL-SPAN GATE', 18, 22)

  ctx.fillStyle = colors.textMuted
  ctx.font = `600 8px ${colors.fontMono}`
  ctx.textAlign = 'right'
  ctx.fillText('τ = 0.850', width - 18, 22)

  const isBlocked = progress > 0.42
  const midY = height * 0.52

  // 1. Incoming Speculative Query Card (Left)
  const qW = Math.min(140, width * 0.28)
  const qH = Math.min(54, height * 0.32)
  const gateX = width * 0.44
  const startX = 18
  const targetX = gateX - qW - 10
  const moveProgress = Math.min(1, progress / 0.42)
  const qX = startX + (targetX - startX) * moveProgress
  const qY = midY - qH / 2

  drawRoundedBox(ctx, qX, qY, qW, qH, colors.isPixel ? 0 : 8, colors.cardBg, colors.cardBorder)

  // Safely clipped inner content
  ctx.save()
  ctx.beginPath()
  ctx.rect(qX + 4, qY + 4, qW - 8, qH - 8)
  ctx.clip()

  ctx.fillStyle = colors.textMuted
  ctx.font = `700 7.5px ${colors.fontMono}`
  ctx.textAlign = 'left'
  ctx.fillText('SPECULATIVE QUERY', qX + 8, qY + 16)

  ctx.fillStyle = colors.text1
  ctx.font = `600 8.5px ${colors.fontSans}`
  ctx.fillText('"Mars colony 1969?"', qX + 8, qY + 31)

  ctx.fillStyle = colors.warning
  ctx.font = `500 7px ${colors.fontMono}`
  ctx.fillText('• Out-of-Domain', qX + 8, qY + 44)
  ctx.restore()

  // 2. Center: Protective Threshold Laser Gate Barrier
  const gateTop = height * 0.16
  const gateH = height * 0.68

  ctx.save()
  const gatePulse = 0.7 + Math.sin(progress * Math.PI * 6) * 0.3
  ctx.strokeStyle = colors.warning
  ctx.lineWidth = colors.isPixel ? 3 : 2
  ctx.shadowColor = colors.warning
  ctx.shadowBlur = colors.isPixel ? 0 : 14 * gatePulse
  ctx.beginPath()
  ctx.moveTo(gateX, gateTop)
  ctx.lineTo(gateX, gateTop + gateH)
  ctx.stroke()

  // Central Shield Emblem
  const shieldR = 14
  drawRoundedBox(ctx, gateX - shieldR, midY - shieldR, shieldR * 2, shieldR * 2, colors.isPixel ? 0 : 6, colors.cardBg, colors.warning)
  ctx.fillStyle = colors.warning
  ctx.font = `700 12px ${colors.fontMono}`
  ctx.textAlign = 'center'
  ctx.fillText('⛨', gateX, midY + 4)

  // Deflection Shockwave when query hits
  if (isBlocked) {
    const flash = Math.sin(((progress - 0.42) / 0.58) * Math.PI)
    ctx.strokeStyle = colors.warning
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(gateX, midY, 18 + flash * 22, -Math.PI / 2, Math.PI / 2)
    ctx.stroke()

    // Bouncing particle sparks
    for (let i = 0; i < 6; i++) {
      const spAng = -Math.PI / 2 + (i / 5) * Math.PI
      const spDist = 14 + flash * 28
      ctx.fillStyle = colors.warning
      ctx.fillRect(gateX - Math.cos(spAng) * spDist, midY + Math.sin(spAng) * spDist, 2.5, 2.5)
    }
  }
  ctx.restore()

  // 3. Right: Safe Reject Output Box
  const decX = gateX + 18
  const decW = width - decX - 18
  const decH = Math.min(62, height * 0.38)
  const decY = midY - decH / 2

  drawRoundedBox(ctx, decX, decY, decW, decH, colors.isPixel ? 0 : 8, isBlocked ? colors.warningBg : colors.cardBg, isBlocked ? colors.warning : colors.cardBorder)

  ctx.save()
  ctx.beginPath()
  ctx.rect(decX + 4, decY + 4, decW - 8, decH - 8)
  ctx.clip()

  ctx.textAlign = 'left'
  ctx.fillStyle = isBlocked ? colors.warning : colors.textMuted
  ctx.font = `700 8px ${colors.fontMono}`
  ctx.fillText(isBlocked ? '✓ SAFE REJECT ACTIVATED' : 'EVALUATING NULL LOGIT…', decX + 10, decY + 16)

  ctx.fillStyle = colors.text1
  ctx.font = `700 9px ${colors.fontSans}`
  ctx.fillText(isBlocked ? 'Answer Unmentioned in Document' : 'Calibrated Confidence Sweep', decX + 10, decY + 32)

  ctx.fillStyle = colors.text2
  ctx.font = `500 7px ${colors.fontMono}`
  ctx.fillText(isBlocked ? 'S_null: 0.942 > τ_safe: 0.850 • 0% Hallucination' : 'Span logits below zero-answer threshold', decX + 10, decY + 46)
  ctx.restore()

  // Bottom Telemetry Bar (Clipped)
  ctx.save()
  ctx.beginPath()
  ctx.rect(18, height * 0.88, width - 36, 20)
  ctx.clip()
  ctx.fillStyle = colors.textMuted
  ctx.font = `500 7.5px ${colors.fontMono}`
  ctx.textAlign = 'left'
  ctx.fillText('PROTECTION: Prevents generative fabrication by enforcing verbatim document verification.', 18, height * 0.94)
  ctx.restore()
}

/* ══════════════════════════════════════════════════════════════════
   CONCEPT 2: Instant Evidence Highlighting & Coordinate Scanning
   Explains: Character Coordinate Scanning [31 : 44] & Source Grounding
   ══════════════════════════════════════════════════════════════════ */
function renderEvidence(ctx, width, height, progress, colors) {
  drawBackgroundAndGrid(ctx, width, height, colors)

  // Top Header
  ctx.fillStyle = colors.accent
  ctx.font = `700 9.5px ${colors.fontMono}`
  ctx.textAlign = 'left'
  ctx.fillText('⚡ EVIDENCE SCANNER • CHARACTER COORDINATE CALIPER', 18, 22)

  ctx.fillStyle = colors.textMuted
  ctx.font = `600 8px ${colors.fontMono}`
  ctx.textAlign = 'right'
  ctx.fillText('JIT: 12.4MS', width - 18, 22)

  // Document Container
  const docX = 18
  const docY = height * 0.32
  const docW = width - 36
  const docH = Math.min(84, height * 0.5)

  drawRoundedBox(ctx, docX, docY, docW, docH, colors.isPixel ? 0 : 8, colors.cardBg, colors.cardBorder)

  // STRICT INNER CLIPPING: Guarantees zero text overflow outside the box!
  ctx.save()
  ctx.beginPath()
  ctx.rect(docX + 4, docY + 4, docW - 8, docH - 8)
  ctx.clip()

  // Adaptive font size so tokens fit cleanly across all card widths
  const textFontSize = Math.min(9.5, Math.max(7.5, (docW - 40) / 42))

  // Responsive ruler text
  ctx.fillStyle = colors.textMuted
  ctx.font = `600 ${textFontSize * 0.8}px ${colors.fontMono}`
  ctx.textAlign = 'left'
  if (docW > 450) {
    ctx.fillText('CHAR: 000       015       031                044       065       090       120', docX + 12, docY + 16)
  } else {
    ctx.fillText('CHAR: 000     015     031          044     065     090', docX + 12, docY + 16)
  }

  // Document Text Stream Line
  const textY = docY + 42
  ctx.font = `500 ${textFontSize}px ${colors.fontMono}`
  ctx.fillStyle = colors.textMuted

  // Responsive lead and tail strings tailored to container width
  const isWide = docW > 460
  const leadStr = isWide ? '"Apollo 11 landed on Moon on ' : '"...Moon on '
  const targetStr = 'July 20, 1969'
  const tailStr = isWide ? ' . Neil Armstrong..."' : ' . Armstrong..."'

  ctx.fillText(leadStr, docX + 12, textY)
  const targetX = docX + 12 + ctx.measureText(leadStr).width
  const targetW = ctx.measureText(targetStr).width
  ctx.fillText(tailStr, targetX + targetW, textY)

  // Calipers Animation
  const isLocked = progress >= 0.38
  const sweepProgress = isLocked ? 1.0 : (progress / 0.38)
  const caliperStartX = (docX + 12) + (targetX - docX - 12) * sweepProgress
  const caliperEndX = caliperStartX + targetW

  if (isLocked) {
    // Glowing Highlight Fill
    const pulse = 0.85 + Math.sin(progress * Math.PI * 6) * 0.15
    ctx.save()
    ctx.shadowColor = colors.accent
    ctx.shadowBlur = colors.isPixel ? 0 : 12 * pulse
    drawRoundedBox(ctx, targetX - 4, textY - 17, targetW + 8, 24, colors.isPixel ? 0 : 4, colors.accentBg, colors.accent)
    ctx.restore()

    // Highlighted Text
    ctx.fillStyle = colors.accent
    ctx.font = `700 ${textFontSize}px ${colors.fontMono}`
    ctx.fillText(targetStr, targetX, textY)
  }

  // Draw Caliper Brackets [ and ]
  ctx.save()
  ctx.strokeStyle = colors.accent
  ctx.lineWidth = 2
  const bH = 26
  const bTop = textY - 18

  // Left bracket [
  ctx.beginPath()
  ctx.moveTo(caliperStartX - 1, bTop)
  ctx.lineTo(caliperStartX - 5, bTop)
  ctx.lineTo(caliperStartX - 5, bTop + bH)
  ctx.lineTo(caliperStartX - 1, bTop + bH)
  ctx.stroke()

  // Right bracket ]
  ctx.beginPath()
  ctx.moveTo(caliperEndX + 1, bTop)
  ctx.lineTo(caliperEndX + 5, bTop)
  ctx.lineTo(caliperEndX + 5, bTop + bH)
  ctx.lineTo(caliperEndX + 1, bTop + bH)
  ctx.stroke()
  ctx.restore()

  // Caliper Dimension Line
  const dimY = docY + docH - 12
  ctx.strokeStyle = colors.accent
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(targetX, dimY)
  ctx.lineTo(targetX + targetW, dimY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(targetX, dimY - 3); ctx.lineTo(targetX, dimY + 3)
  ctx.moveTo(targetX + targetW, dimY - 3); ctx.lineTo(targetX + targetW, dimY + 3)
  ctx.stroke()

  ctx.fillStyle = isLocked ? colors.accent : colors.textMuted
  ctx.font = `700 8px ${colors.fontMono}`
  ctx.textAlign = 'center'
  ctx.fillText(isLocked ? 'SPAN [31 : 44] • 13 CHARS' : 'SCANNING OFFSETS…', targetX + targetW / 2, dimY - 5)

  ctx.restore() // End document inner clipping

  // Bottom Telemetry Bar (Clipped)
  ctx.save()
  ctx.beginPath()
  ctx.rect(docX, height * 0.88, docW, 20)
  ctx.clip()
  ctx.textAlign = 'left'
  ctx.fillStyle = colors.success
  ctx.font = `700 8.5px ${colors.fontMono}`
  ctx.fillText(isLocked ? '✓ 100% EVIDENCE ATTRIBUTION LOCKED' : 'CALIBRATING DOCUMENT TOKENS…', docX, height * 0.94)

  ctx.textAlign = 'right'
  ctx.fillStyle = colors.text2
  ctx.font = `500 8px ${colors.fontMono}`
  ctx.fillText('SOURCE GROUNDED', width - docX, height * 0.94)
  ctx.restore()
}

/* ══════════════════════════════════════════════════════════════════
   CONCEPT 3: Continuous Extractive QA Stream (Inference Loop)
   Explains: Complete Apollo 11 QA Flow with Attention Heatmap & Verified Span
   ══════════════════════════════════════════════════════════════════ */
function renderQaStream(ctx, width, height, progress, colors) {
  drawBackgroundAndGrid(ctx, width, height, colors)

  // 1. Top Header Bar with Live Inference Telemetry
  ctx.fillStyle = colors.accent
  ctx.font = `700 9.5px ${colors.fontMono}`
  ctx.textAlign = 'left'
  ctx.fillText('✧ CONTINUOUS EXTRACTIVE QA STREAM', 18, 22)

  ctx.fillStyle = colors.success
  ctx.font = `700 8px ${colors.fontMono}`
  ctx.textAlign = 'right'
  ctx.fillText('● INFERENCE: 18.4MS • 98.4% CONF', width - 18, 22)

  const isExtractedPhase = progress > 0.52

  // 2. Top-Left: Natural Language Query Card
  const qW = Math.min(170, width * 0.38)
  const qH = Math.min(54, height * 0.32)
  const qX = 18
  const qY = 36

  drawRoundedBox(ctx, qX, qY, qW, qH, colors.isPixel ? 0 : 8, colors.cardBg, colors.cardBorder)

  // Strictly clip inside Query Box
  ctx.save()
  ctx.beginPath()
  ctx.rect(qX + 4, qY + 4, qW - 8, qH - 8)
  ctx.clip()

  ctx.fillStyle = colors.accent
  ctx.font = `700 7.5px ${colors.fontMono}`
  ctx.textAlign = 'left'
  ctx.fillText('NATURAL INQUIRY', qX + 8, qY + 15)

  ctx.fillStyle = colors.text1
  ctx.font = `600 9px ${colors.fontSans}`
  ctx.fillText('"When did Apollo 11 land?"', qX + 8, qY + 31)

  ctx.fillStyle = colors.textMuted
  ctx.font = `500 7px ${colors.fontMono}`
  ctx.fillText('[CLS] When did Apollo 11 [SEP]', qX + 8, qY + 45)
  ctx.restore()

  // 3. Top-Right: Verified Extracted Answer Card (Emerges at progress > 0.52)
  const ansW = Math.min(170, width * 0.38)
  const ansH = Math.min(54, height * 0.32)
  const ansX = width - ansW - 18
  const ansY = 36

  drawRoundedBox(ctx, ansX, ansY, ansW, ansH, colors.isPixel ? 0 : 8, isExtractedPhase ? colors.successBg : colors.cardBg, isExtractedPhase ? colors.success : colors.cardBorder)

  // Strictly clip inside Answer Box
  ctx.save()
  ctx.beginPath()
  ctx.rect(ansX + 4, ansY + 4, ansW - 8, ansH - 8)
  ctx.clip()

  ctx.textAlign = 'left'
  ctx.fillStyle = isExtractedPhase ? colors.success : colors.textMuted
  ctx.font = `700 7.5px ${colors.fontMono}`
  ctx.fillText(isExtractedPhase ? '✓ VERIFIED SPAN EXTRACTION' : 'COMPUTING SPAN HEAD…', ansX + 8, ansY + 15)

  ctx.fillStyle = colors.text1
  ctx.font = `700 10px ${colors.fontSans}`
  ctx.fillText(isExtractedPhase ? '"July 20, 1969"' : 'Evaluating tokens…', ansX + 8, ansY + 31)

  ctx.fillStyle = isExtractedPhase ? colors.success : colors.textMuted
  ctx.font = `600 7px ${colors.fontMono}`
  ctx.fillText(isExtractedPhase ? 'Span [31 : 44] • 98.4% Confidence' : 'Cross-attention resolution', ansX + 8, ansY + 45)
  ctx.restore()

  // 4. Middle: Neural Attention Waves connecting Query to Answer
  const midY = 63
  ctx.save()
  const waveProg = (progress * 2) % 1
  ctx.strokeStyle = colors.accent
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(qX + qW, midY)
  ctx.lineTo(ansX, midY)
  ctx.stroke()

  // Moving Attention Photon
  const photonX = (qX + qW) + (ansX - (qX + qW)) * waveProg
  ctx.fillStyle = colors.accent
  ctx.beginPath()
  ctx.arc(photonX, midY, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 5. Bottom: Ground Truth Document Context Strip
  const docX = 18
  const docY = height * 0.58
  const docW = width - 36
  const docH = Math.min(56, height * 0.32)

  drawRoundedBox(ctx, docX, docY, docW, docH, colors.isPixel ? 0 : 8, colors.cardBg, colors.cardBorder)

  // Strictly clip inside Document Strip
  ctx.save()
  ctx.beginPath()
  ctx.rect(docX + 4, docY + 4, docW - 8, docH - 8)
  ctx.clip()

  ctx.fillStyle = colors.textMuted
  ctx.font = `700 7.5px ${colors.fontMono}`
  ctx.textAlign = 'left'
  ctx.fillText('DOCUMENT SOURCE PASSAGE (APOLLO 11 FLIGHT SUMMARY)', docX + 10, docY + 15)

  // Responsive font & text formatting
  const passageFontSize = Math.min(9.5, Math.max(7.5, (docW - 40) / 44))
  const passageY = docY + 36
  ctx.font = `500 ${passageFontSize}px ${colors.fontMono}`
  ctx.fillStyle = colors.textMuted

  const isWide = docW > 480
  const preText = isWide ? '"Apollo 11 landed on Moon on ' : '"...Moon on '
  const matchText = 'July 20, 1969'
  const postText = isWide ? ' . Neil Armstrong..."' : ' . Armstrong..."'

  ctx.fillText(preText, docX + 10, passageY)
  const matchX = docX + 10 + ctx.measureText(preText).width
  const matchW = ctx.measureText(matchText).width

  // Glowing Span Highlight Box
  if (isExtractedPhase) {
    const glow = 0.85 + Math.sin(progress * Math.PI * 8) * 0.15
    ctx.save()
    ctx.shadowColor = colors.success
    ctx.shadowBlur = colors.isPixel ? 0 : 10 * glow
    drawRoundedBox(ctx, matchX - 4, passageY - 14, matchW + 8, 20, colors.isPixel ? 0 : 4, colors.successBg, colors.success)
    ctx.restore()
    ctx.fillStyle = colors.success
  } else {
    ctx.fillStyle = colors.textMuted
  }

  ctx.font = `700 ${passageFontSize}px ${colors.fontMono}`
  ctx.fillText(matchText, matchX, passageY)

  ctx.fillStyle = colors.textMuted
  ctx.font = `500 ${passageFontSize}px ${colors.fontMono}`
  ctx.fillText(postText, matchX + matchW, passageY)
  ctx.restore() // End document inner clipping

  // 6. Bottom Telemetry Status (Clipped)
  ctx.save()
  ctx.beginPath()
  ctx.rect(18, height * 0.88, width - 36, 20)
  ctx.clip()
  ctx.textAlign = 'left'
  ctx.fillStyle = colors.textMuted
  ctx.font = `500 7.5px ${colors.fontMono}`
  ctx.fillText('GUARANTEE: Pure extractive inference directly quotes the source. Zero hallucinations.', 18, height * 0.94)
  ctx.restore()
}

/* ══════════════════════════════════════════════════════════════════
   CONCEPT 4: BERT Extractive QA Architecture • 4-Stage Pipeline
   Explains: Complete End-to-End Deep Architectural Pipeline
   ══════════════════════════════════════════════════════════════════ */
function renderPipeline(ctx, width, height, progress, colors) {
  drawBackgroundAndGrid(ctx, width, height, colors)

  // 1. Top Header with Architecture Metadata
  ctx.fillStyle = colors.accent
  ctx.font = `700 10px ${colors.fontMono}`
  ctx.textAlign = 'left'
  ctx.fillText('◈ BERT EXTRACTIVE QA ARCHITECTURE • 4-STAGE TRANSFORMER PIPELINE', 18, 24)

  ctx.fillStyle = colors.textMuted
  ctx.font = `600 8px ${colors.fontMono}`
  ctx.textAlign = 'right'
  ctx.fillText('110M PARAMS • 12 HEADS • 768-D', width - 18, 24)

  // 2. The 4 Architecture Stages
  const stages = [
    {
      num: '01',
      title: 'INGESTION',
      sub: 'Tokenizer',
      badge: '384-tok Window',
      detail: '[CLS] Q [SEP] Doc',
    },
    {
      num: '02',
      title: 'EMBEDDINGS',
      sub: 'Summation',
      badge: '768-dim Vector',
      detail: 'Tok + Pos + Seg',
    },
    {
      num: '03',
      title: 'ATTENTION',
      sub: '12-Layer BERT',
      badge: '12 Attn Heads',
      detail: 'Bidirectional Self-Attn',
    },
    {
      num: '04',
      title: 'SPAN HEAD',
      sub: 'Classifier',
      badge: 'ArgMax [31 : 44]',
      detail: 'Verbatim Extracted Span',
    },
  ]

  const stageCount = stages.length
  const sideMargin = 18
  const availableW = width - sideMargin * 2
  const gap = 12
  const stageW = (availableW - (stageCount - 1) * gap) / stageCount
  const stageH = Math.min(94, height * 0.52)
  const stageY = height * 0.44 - stageH / 2

  const activeStageIdx = Math.floor(progress * 4) % 4
  const stageProgress = (progress * 4) % 1

  // 3. Draw Connecting Conduits with Animated Flowing Data Packets
  for (let i = 0; i < stageCount - 1; i++) {
    const x1 = sideMargin + i * (stageW + gap) + stageW
    const x2 = sideMargin + (i + 1) * (stageW + gap)
    const conduitY = height * 0.44

    ctx.strokeStyle = colors.cardBorder
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x1, conduitY)
    ctx.lineTo(x2, conduitY)
    ctx.stroke()

    // Active flowing pulse
    if (i === activeStageIdx) {
      const pX = x1 + (x2 - x1) * stageProgress
      ctx.fillStyle = colors.accent
      ctx.beginPath()
      ctx.arc(pX, conduitY, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 4. Render the 4 Architectural Cards
  stages.forEach((st, idx) => {
    const stX = sideMargin + idx * (stageW + gap)
    const isActive = idx === activeStageIdx
    const isPast = idx < activeStageIdx

    const cardFill = isActive ? colors.accentBg : colors.cardBg
    const cardBorder = isActive ? colors.accent : isPast ? colors.accentLight : colors.cardBorder

    // Card background with subtle shadow
    if (isActive) {
      ctx.save()
      ctx.shadowColor = colors.accent
      ctx.shadowBlur = colors.isPixel ? 0 : 14
      drawRoundedBox(ctx, stX, stageY, stageW, stageH, colors.isPixel ? 0 : 8, cardFill, cardBorder)
      ctx.restore()
    } else {
      drawRoundedBox(ctx, stX, stageY, stageW, stageH, colors.isPixel ? 0 : 8, cardFill, cardBorder)
    }

    // STRICT INNER CLIPPING: Zero text spill outside card!
    ctx.save()
    ctx.beginPath()
    ctx.rect(stX + 4, stageY + 4, stageW - 8, stageH - 8)
    ctx.clip()

    // Stage Number + Header Tag
    ctx.fillStyle = isActive ? colors.accent : colors.textMuted
    ctx.font = `700 8px ${colors.fontMono}`
    ctx.textAlign = 'left'
    ctx.fillText(`${st.num} ${st.title}`, stX + 8, stageY + 16)

    // Stage Subtitle
    ctx.fillStyle = colors.text1
    ctx.font = `700 9.5px ${colors.fontSans}`
    ctx.fillText(st.sub, stX + 8, stageY + 32)

    // Badge Pill (fitted inside width)
    const badgePad = 8
    const maxBadgeW = stageW - 16
    const badgeTextW = Math.min(maxBadgeW - badgePad, ctx.measureText(st.badge).width)
    drawRoundedBox(ctx, stX + 8, stageY + 42, badgeTextW + badgePad, 15, colors.isPixel ? 0 : 4, colors.accentBg, colors.cardBorder)
    ctx.fillStyle = colors.accent
    ctx.font = `600 7px ${colors.fontMono}`
    ctx.fillText(st.badge, stX + 12, stageY + 52)

    // Stage Detail
    ctx.fillStyle = colors.text2
    ctx.font = `500 7.5px ${colors.fontMono}`
    ctx.fillText(st.detail, stX + 8, stageY + 76)

    ctx.restore() // End card inner clipping
  })

  // 5. Bottom Architectural Pipeline Summary Ribbon
  const ribY = height * 0.88
  drawRoundedBox(ctx, sideMargin, ribY - 12, availableW, 26, colors.isPixel ? 0 : 6, colors.cardBg, colors.cardBorder)

  ctx.save()
  ctx.beginPath()
  ctx.rect(sideMargin + 4, ribY - 10, availableW - 8, 22)
  ctx.clip()

  ctx.fillStyle = colors.text1
  ctx.font = `600 8px ${colors.fontMono}`
  ctx.textAlign = 'center'
  ctx.fillText('DATA BUS: CONTEXT (DOC) ➔ 384-TOK WINDOW ➔ 768-D EMBEDDING ➔ 12-LAYER ATTENTION ➔ SPAN HEAD LOGITS [31:44]', width / 2, ribY + 4)
  ctx.restore()
}

/* ══════════════════════════════════════════════════════════════════
   CONCEPT 5: Imperium 4.0-Second Royal AI Motion Sequence
   Sequence:
   0.0–0.6s: Dark intelligence chamber appears with subtle golden ambient light.
   0.6–1.2s: Context/document appears as a dark manuscript-like panel.
   1.2–1.7s: Question appears. Tiny golden particles form tokens.
   1.7–2.3s: Tokens travel toward the BERT intelligence core.
   2.3–2.9s: BERT core activates. Thin golden rings briefly illuminate.
   2.9–3.4s: Start/End markers scan through the document.
   3.4–4.0s: Answer span becomes illuminated in antique gold.
             A small: EVIDENCE MATCHED indicator appears. Then seamlessly reset.
   ══════════════════════════════════════════════════════════════════ */
function renderImperiumMotion(ctx, width, height, progress, colors) {
  // 1. Pure pitch black background
  ctx.fillStyle = colors.bg || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Architectural palace grid
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.035)'
  ctx.lineWidth = 1
  const gridSize = 28
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }

  // Corner royal brackets [ and ]
  const cPad = 12
  const cLen = 14
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.45)'
  ctx.lineWidth = 1.5

  // Top-left
  ctx.beginPath()
  ctx.moveTo(cPad, cPad + cLen); ctx.lineTo(cPad, cPad); ctx.lineTo(cPad + cLen, cPad)
  ctx.stroke()
  // Top-right
  ctx.beginPath()
  ctx.moveTo(width - cPad - cLen, cPad); ctx.lineTo(width - cPad, cPad); ctx.lineTo(width - cPad, cPad + cLen)
  ctx.stroke()
  // Bottom-left
  ctx.beginPath()
  ctx.moveTo(cPad, height - cPad - cLen); ctx.lineTo(cPad, height - cPad); ctx.lineTo(cPad + cLen, height - cPad)
  ctx.stroke()
  // Bottom-right
  ctx.beginPath()
  ctx.moveTo(width - cPad - cLen, height - cPad); ctx.lineTo(width - cPad, height - cPad); ctx.lineTo(width - cPad, height - cPad - cLen)
  ctx.stroke()

  // Telemetry Header
  ctx.fillStyle = '#d4af37'
  ctx.font = `700 9.5px ${colors.fontDisplay || 'serif'}`
  ctx.textAlign = 'left'
  ctx.fillText('⚜ IMPERIUM ROYAL INTELLIGENCE CHAMBER', 20, 22)

  ctx.fillStyle = '#8f805f'
  ctx.font = `600 8px ${colors.fontMono}`
  ctx.textAlign = 'right'
  ctx.fillText('12.4MS INFERENCE · ZERO HALLUCINATION', width - 20, 22)

  // 0.6–1.2s: Context manuscript-like panel (fades in)
  const docOpacity = Math.min(1, Math.max(0, (progress - 0.15) / 0.15))
  const docX = 20
  const docW = width - 40
  const docH = Math.min(76, height * 0.38)
  const docY = height * 0.58

  if (progress >= 0.15) {
    ctx.save()
    ctx.globalAlpha = docOpacity

    // Double border manuscript card
    drawRoundedBox(ctx, docX, docY, docW, docH, 8, '#080808', 'rgba(168, 132, 42, 0.5)')
    drawRoundedBox(ctx, docX + 3, docY + 3, docW - 6, docH - 6, 6, null, 'rgba(201, 162, 39, 0.2)')

    // Strictly clip manuscript content
    ctx.save()
    ctx.beginPath()
    ctx.rect(docX + 6, docY + 6, docW - 12, docH - 12)
    ctx.clip()

    // Manuscript Title
    ctx.fillStyle = '#a8842a'
    ctx.font = `700 7.5px ${colors.fontMono}`
    ctx.textAlign = 'left'
    ctx.fillText('ROYAL ARCHIVE RECORD [APOLLO 11 FLIGHT TELEMETRY]', docX + 12, docY + 18)

    // Document text stream
    const textY = docY + 44
    const textFontSize = Math.min(9.5, Math.max(7.5, (docW - 40) / 44))
    ctx.font = `500 ${textFontSize}px ${colors.fontMono}`
    ctx.fillStyle = '#8f805f'

    const isWide = docW > 450
    const leadStr = isWide ? '"Apollo 11 landed on Moon on ' : '"...Moon on '
    const targetStr = 'July 20, 1969'
    const tailStr = isWide ? ' . Neil Armstrong..."' : ' . Armstrong..."'

    ctx.fillText(leadStr, docX + 12, textY)
    const targetX = docX + 12 + ctx.measureText(leadStr).width
    const targetW = ctx.measureText(targetStr).width
    ctx.fillText(tailStr, targetX + targetW, textY)

    // 2.9–3.4s: Start/End calipers scanning through document
    const isScanning = progress >= 0.725 && progress < 0.85
    const isAnswerLit = progress >= 0.85

    if (isScanning) {
      const scanProg = (progress - 0.725) / 0.125
      const scanX = (docX + 12) + (targetX + targetW - (docX + 12)) * scanProg

      ctx.strokeStyle = '#e5c766'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(scanX, docY + 24)
      ctx.lineTo(scanX, docY + docH - 8)
      ctx.stroke()

      ctx.fillStyle = '#e5c766'
      ctx.font = `700 7px ${colors.fontMono}`
      ctx.fillText('SCAN [31:44]', scanX - 18, docY + docH - 12)
    }

    // 3.4–4.0s: Answer span illuminated in antique gold
    if (isAnswerLit) {
      const pulse = 0.85 + Math.sin(progress * Math.PI * 8) * 0.15
      ctx.save()
      ctx.shadowColor = '#c9a227'
      ctx.shadowBlur = 14 * pulse
      drawRoundedBox(ctx, targetX - 4, textY - 15, targetW + 8, 20, 4, 'rgba(201, 162, 39, 0.22)', '#c9a227')
      ctx.restore()

      ctx.fillStyle = '#fff4c7'
      ctx.font = `700 ${textFontSize}px ${colors.fontMono}`
      ctx.fillText(targetStr, targetX, textY)
    }

    ctx.restore() // End manuscript inner clipping
    ctx.restore() // End manuscript globalAlpha
  }

  // 1.2–1.7s: Question appears on the left
  const qW = Math.min(160, width * 0.36)
  const qH = Math.min(54, height * 0.29)
  const qX = 20
  const qY = 36
  const qOpacity = Math.min(1, Math.max(0, (progress - 0.30) / 0.125))

  if (progress >= 0.30) {
    ctx.save()
    ctx.globalAlpha = qOpacity
    drawRoundedBox(ctx, qX, qY, qW, qH, 6, '#080808', 'rgba(168, 132, 42, 0.4)')

    ctx.save()
    ctx.beginPath()
    ctx.rect(qX + 4, qY + 4, qW - 8, qH - 8)
    ctx.clip()

    ctx.fillStyle = '#c9a227'
    ctx.font = `700 7.5px ${colors.fontMono}`
    ctx.textAlign = 'left'
    ctx.fillText('ROYAL INQUIRY', qX + 8, qY + 15)

    ctx.fillStyle = '#fff4c7'
    ctx.font = `600 8.5px ${colors.fontSans}`
    ctx.fillText('"When did Apollo 11 land?"', qX + 8, qY + 31)

    ctx.fillStyle = '#8f805f'
    ctx.font = `500 7px ${colors.fontMono}`
    ctx.fillText('[CLS] Apollo 11 land [SEP]', qX + 8, qY + 45)

    ctx.restore()
    ctx.restore()
  }

  // Center: BERT AI Core (Activates 2.3–2.9s)
  const coreX = width / 2
  const coreY = 63
  const coreR = 20
  const coreActive = progress >= 0.575

  // 1.7–2.3s: Tokens travel toward the BERT intelligence core
  if (progress >= 0.425 && progress < 0.575) {
    const travelProg = (progress - 0.425) / 0.15
    const pX = (qX + qW) + (coreX - (qX + qW)) * travelProg
    const pY = qY + qH / 2 + Math.sin(travelProg * Math.PI) * -12

    // Flowing golden trail
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(qX + qW, qY + qH / 2)
    ctx.quadraticCurveTo((qX + qW + coreX) / 2, qY - 6, coreX, coreY)
    ctx.stroke()

    // Traveling golden photon
    ctx.save()
    ctx.fillStyle = '#e5c766'
    ctx.shadowColor = '#c9a227'
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc(pX, pY, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // BERT Core Graphics
  ctx.save()
  // Outer circular ring
  ctx.strokeStyle = coreActive ? '#c9a227' : 'rgba(168, 132, 42, 0.3)'
  ctx.lineWidth = 1.5
  if (coreActive) {
    ctx.shadowColor = '#c9a227'
    ctx.shadowBlur = 16
  }
  ctx.beginPath()
  ctx.arc(coreX, coreY, coreR + 6, 0, Math.PI * 2)
  ctx.stroke()

  // Thin rotating orbit rings (2.3–2.9s and beyond)
  const rot1 = (progress * Math.PI * 4) % (Math.PI * 2)
  const rot2 = (-progress * Math.PI * 3) % (Math.PI * 2)
  ctx.strokeStyle = coreActive ? 'rgba(229, 199, 102, 0.7)' : 'rgba(168, 132, 42, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(coreX, coreY, coreR + 10, (coreR + 10) * 0.4, rot1, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(coreX, coreY, coreR + 10, (coreR + 10) * 0.4, rot2, 0, Math.PI * 2)
  ctx.stroke()

  // Core central dark medallion
  drawRoundedBox(ctx, coreX - coreR, coreY - coreR, coreR * 2, coreR * 2, coreR, '#080808', coreActive ? '#d4af37' : '#8a6a16')

  // Inner geometric seal
  ctx.fillStyle = coreActive ? '#fff4c7' : '#8f805f'
  ctx.font = `700 11px ${colors.fontDisplay || 'serif'}`
  ctx.textAlign = 'center'
  ctx.fillText('⚜', coreX, coreY + 4)
  ctx.restore()

  // 3.4–4.0s: Answer Card & "EVIDENCE MATCHED" indicator appears on top right
  const ansW = Math.min(160, width * 0.36)
  const ansH = Math.min(54, height * 0.29)
  const ansX = width - ansW - 20
  const ansY = 36

  if (progress >= 0.85) {
    const ansOpacity = Math.min(1, (progress - 0.85) / 0.08)
    ctx.save()
    ctx.globalAlpha = ansOpacity

    drawRoundedBox(ctx, ansX, ansY, ansW, ansH, 6, '#080808', '#c9a227')

    ctx.save()
    ctx.beginPath()
    ctx.rect(ansX + 4, ansY + 4, ansW - 8, ansH - 8)
    ctx.clip()

    ctx.textAlign = 'left'
    ctx.fillStyle = '#c9a227'
    ctx.font = `700 7.5px ${colors.fontMono}`
    ctx.fillText('⚜ EVIDENCE MATCHED', ansX + 8, ansY + 15)

    ctx.fillStyle = '#fff4c7'
    ctx.font = `700 10px ${colors.fontSans}`
    ctx.fillText('"July 20, 1969"', ansX + 8, ansY + 31)

    ctx.fillStyle = '#e5c766'
    ctx.font = `600 7px ${colors.fontMono}`
    ctx.fillText('Span [31 : 44] · 99.4% Match', ansX + 8, ansY + 45)

    ctx.restore()
    ctx.restore()
  } else {
    // Computing placeholder
    ctx.save()
    ctx.globalAlpha = 0.5
    drawRoundedBox(ctx, ansX, ansY, ansW, ansH, 6, '#100d08', 'rgba(168, 132, 42, 0.2)')
    ctx.fillStyle = '#8f805f'
    ctx.font = `600 7.5px ${colors.fontMono}`
    ctx.textAlign = 'left'
    ctx.fillText(coreActive ? 'RESOLVING SPAN HEAD…' : 'AWAITING QUERY…', ansX + 10, ansY + 30)
    ctx.restore()
  }

  // Bottom Telemetry Bar
  ctx.save()
  ctx.beginPath()
  ctx.rect(20, height * 0.90, width - 40, 18)
  ctx.clip()
  ctx.textAlign = 'left'
  ctx.fillStyle = progress >= 0.85 ? '#c9a227' : '#8f805f'
  ctx.font = `600 7.5px ${colors.fontMono}`
  ctx.fillText('IMPERIUM GUARANTEE: Contiguous span extraction directly quoted from source. Zero fabrication.', 20, height * 0.96)
  ctx.restore()
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT: MotionVideoPlayer
   ══════════════════════════════════════════════════════════════════ */
export default function MotionVideoPlayer({
  src,
  poster,
  concept,
  title = 'Motion Graphic',
  tag,
  className = '',
  aspectRatio = '16/9',
}) {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animFrameRef = useRef(null)
  const startTimeRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  // Auto-detect concept if not explicitly provided (same across all themes)
  const activeConcept = concept || (
    (title.toLowerCase().includes('safeguard') || title.toLowerCase().includes('null') || (src && src.includes('safeguard'))) ? 'safeguard' :
    (title.toLowerCase().includes('evidence') || title.toLowerCase().includes('scanning') || title.toLowerCase().includes('span') || (src && src.includes('evidence'))) ? 'evidence' :
    (title.toLowerCase().includes('qa') || (src && src.includes('qa'))) ? 'qa-stream' :
    'pipeline'
  )

  // Computed telemetry badge
  const headerTag = tag || (
    activeConcept === 'safeguard' ? (theme === 'pixelcraft' ? '▣ 3.6s VOXEL SHIELD' : theme === 'imperium' ? '⚜ 3.6s ROYAL SAFEGUARD' : '3.6s SAFEGUARD GATE') :
    activeConcept === 'evidence' ? (theme === 'pixelcraft' ? '▣ 3.6s SPAN CALIPER' : theme === 'imperium' ? '⚜ 3.6s EVIDENCE SCANNER' : '3.6s EVIDENCE SCANNER') :
    activeConcept === 'qa-stream' ? (theme === 'pixelcraft' ? '▣ 3.6s QA LOOP' : theme === 'imperium' ? '⚜ 3.6s REAL-TIME QA' : '3.6s REAL-TIME QA') :
    (theme === 'pixelcraft' ? '▣ 3.6s VOXEL LOOP' : theme === 'void' ? '3.6s AI STREAM' : theme === 'cloud' ? '3.6s DATA PIPELINE' : theme === 'ember' ? '3.6s INFERENCE' : theme === 'imperium' ? '⚜ 3.6s ROYAL PIPELINE' : '3.6s Real-Time Pipeline')
  )

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)

    const handleChange = (e) => {
      setIsReducedMotion(e.matches)
      if (e.matches) setIsPlaying(false)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Helper to render a specific frame onto canvas (same animations across all themes)
  const drawFrame = (progress, colors) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.max(window.devicePixelRatio || 1, 2.5)
    const logicalWidth = canvas.width / dpr
    const logicalHeight = canvas.height / dpr

    if (logicalWidth <= 0 || logicalHeight <= 0) return

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Run identical 4 concepts across all themes
    switch (activeConcept) {
      case 'safeguard':
        renderSafeguard(ctx, logicalWidth, logicalHeight, progress, colors)
        break
      case 'evidence':
        renderEvidence(ctx, logicalWidth, logicalHeight, progress, colors)
        break
      case 'qa-stream':
        renderQaStream(ctx, logicalWidth, logicalHeight, progress, colors)
        break
      case 'pipeline':
      default:
        renderPipeline(ctx, logicalWidth, logicalHeight, progress, colors)
        break
    }

    ctx.restore()
  }

  // Canvas animation render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const colors = getThemeColors(theme)
    const cycleDuration = 3600 // Consistent 3.6s loop across all themes

    let running = isPlaying && !isReducedMotion

    const render = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = (timestamp - startTimeRef.current) % cycleDuration
      const progress = elapsed / cycleDuration

      drawFrame(progress, colors)

      if (running) {
        animFrameRef.current = requestAnimationFrame(render)
      }
    }

    // Always draw an immediate static frame (0.50 for rich context or 0)
    drawFrame(0.5, colors)

    if (running) {
      animFrameRef.current = requestAnimationFrame(render)
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isPlaying, isReducedMotion, theme, activeConcept])

  // Handle intersection observer to pause when off-screen
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isReducedMotion) {
            startTimeRef.current = null
            setIsPlaying(true)
          } else if (entry.intersectionRatio <= 0) {
            setIsPlaying(false)
          }
        })
      },
      { threshold: [0, 0.05, 0.15] }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [isReducedMotion])

  const togglePlayback = () => {
    setIsPlaying((prev) => !prev)
  }

  // Handle high-resolution responsive canvas resizing with ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect()
      const w = rect.width  || container.offsetWidth
      const h = rect.height || container.offsetHeight
      if (w > 0 && h > 0) {
        const dpr = Math.max(window.devicePixelRatio || 1, 2.5)
        canvas.width  = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
        // Keep CSS width/height at 100% so it never forces flex/grid parent overflow
        canvas.style.width  = '100%'
        canvas.style.height = '100%'

        const colors = getThemeColors(theme)
        drawFrame(0.5, colors)
      }
    }

    let raf = requestAnimationFrame(() => {
      updateDimensions()
    })

    const ro = new ResizeObserver(() => {
      updateDimensions()
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [theme, aspectRatio, activeConcept])

  return (
    <div
      ref={containerRef}
      className={`${styles.playerContainer} ${styles[`theme_${theme}`]} ${className}`}
      style={{ aspectRatio }}
      data-video-theme={theme}
      data-concept={activeConcept}
    >
      <canvas
        ref={canvasRef}
        className={styles.themeCanvas}
        aria-label={`${title} (${theme} mode: ${activeConcept} animation)`}
      />

      {/* Ambient glass overlay rim */}
      <div className={styles.overlayRim} />

      {/* Floating telemetry tag */}
      <div className={styles.headerTag}>
        <span className={styles.pulseDot} />
        <span className={styles.tagText}>{headerTag}</span>
      </div>

      {/* Interactive hover controls */}
      <div className={styles.hoverBar}>
        <div className={styles.titleWrap}>
          <Sparkles size={11} className={styles.titleIcon} />
          <span className={styles.titleText}>{title}</span>
        </div>

        <button
          type="button"
          className={styles.controlBtn}
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>
    </div>
  )
}
