import React, { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './AmbientCanvas.module.css'

export default function AmbientCanvas() {
  const canvasRef = useRef(null)
  const { theme, isPixelcraft, isImperium } = useTheme()
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId
    let width = 0
    let height = 0
    let dpr = window.devicePixelRatio || 1

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Particle pools depending on theme
    const count = theme === 'original' ? 45 : theme === 'void' ? 0 : 50
    const particles = []

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    // Floating orbs for Cloud theme
    const orbs = [
      { x: width * 0.2, y: height * 0.2, r: 240, color: 'rgba(99, 102, 241, 0.05)', vx: 0.15, vy: 0.1 },
      { x: width * 0.8, y: height * 0.3, r: 280, color: 'rgba(59, 130, 246, 0.05)', vx: -0.12, vy: 0.14 },
      { x: width * 0.5, y: height * 0.8, r: 320, color: 'rgba(168, 85, 247, 0.04)', vx: 0.1, vy: -0.1 },
    ]

    let tick = 0

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)
      tick++

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // --- 1. ORIGINAL THEME: Cyber Neural Web ---
      if (theme === 'original') {
        // Draw node connections
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy

          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0

          // Mouse attraction
          if (mouseRef.current.active) {
            const dx = mx - p.x
            const dy = my - p.y
            const dist = Math.hypot(dx, dy)
            if (dist < 180) {
              p.x += dx * 0.008
              p.y += dy * 0.008
            }
          }

          // Draw node
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(34, 211, 238, 0.5)'
          ctx.fill()

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]
            const dx = p.x - p2.x
            const dy = p.y - p2.y
            const dist = Math.hypot(dx, dy)

            if (dist < 110) {
              const alpha = (1 - dist / 110) * 0.18
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`
              ctx.lineWidth = 0.8
              ctx.stroke()
            }
          }
        }
      }

      // --- 2. VOID THEME: Minimalist Dot Matrix + Flashlight Spotlight ---
      else if (theme === 'void') {
        const spacing = 32
        const rows = Math.ceil(height / spacing)
        const cols = Math.ceil(width / spacing)
        const spotRadius = 180

        for (let r = 0; r < rows; r++) {
          const y = r * spacing
          for (let c = 0; c < cols; c++) {
            const x = c * spacing

            let alpha = 0.04
            let dotSize = 1

            if (mouseRef.current.active) {
              const dist = Math.hypot(mx - x, my - y)
              if (dist < spotRadius) {
                const ratio = 1 - dist / spotRadius
                alpha = 0.04 + ratio * 0.35
                dotSize = 1 + ratio * 1.5
              }
            }

            ctx.beginPath()
            ctx.arc(x, y, dotSize, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.fill()
          }
        }
      }

      // --- 3. CLOUD THEME: Floating Soft Gradient Orbs ---
      else if (theme === 'cloud') {
        orbs.forEach((orb) => {
          orb.x += orb.vx
          orb.y += orb.vy
          if (orb.x < -100) orb.x = width + 100
          if (orb.x > width + 100) orb.x = -100
          if (orb.y < -100) orb.y = height + 100
          if (orb.y > height + 100) orb.y = -100

          const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
          grad.addColorStop(0, orb.color)
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

          ctx.beginPath()
          ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        })
      }

      // --- 4. EMBER THEME: Rising Amber Sparks & Warm Hearth ---
      else if (theme === 'ember') {
        particles.forEach((p) => {
          p.y -= Math.abs(p.vy) + 0.2
          p.x += Math.sin(tick * 0.02 + p.twinklePhase) * 0.3

          if (p.y < 0) {
            p.y = height + 10
            p.x = Math.random() * width
          }

          const currentAlpha = 0.2 + Math.sin(tick * p.twinkleSpeed + p.twinklePhase) * 0.2
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(234, 88, 12, ${Math.max(0.05, currentAlpha)})`
          ctx.shadowBlur = 6
          ctx.shadowColor = 'rgba(245, 158, 11, 0.4)'
          ctx.fill()
          ctx.shadowBlur = 0
        })
      }

      // --- 5. PIXELCRAFT THEME: Retro Voxel Block Rain ---
      else if (theme === 'pixelcraft') {
        particles.forEach((p, idx) => {
          p.y += (idx % 3 + 1) * 0.75
          if (p.y > height) {
            p.y = -10
            p.x = Math.floor(Math.random() * (width / 16)) * 16
          }

          // Draw chunky 4x4 pixel block
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(132, 204, 22, 0.2)'
          ctx.fillRect(Math.floor(p.x / 4) * 4, Math.floor(p.y / 4) * 4, 4, 4)
        })
      }

      // --- 6. IMPERIUM THEME: Golden Stardust Motes & Shimmer ---
      else if (theme === 'imperium') {
        particles.forEach((p) => {
          p.x += p.vx * 0.4
          p.y += p.vy * 0.4
          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0

          const twinkle = (Math.sin(tick * p.twinkleSpeed + p.twinklePhase) + 1) / 2
          const alpha = 0.15 + twinkle * 0.45
          const radius = p.size * (0.8 + twinkle * 0.5)

          ctx.beginPath()
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`
          ctx.shadowBlur = twinkle > 0.7 ? 8 : 0
          ctx.shadowColor = '#fff4c7'
          ctx.fill()
          ctx.shadowBlur = 0

          // Occasional 4-point cross glimmer on bright particles
          if (twinkle > 0.85) {
            ctx.beginPath()
            ctx.moveTo(p.x - 3, p.y)
            ctx.lineTo(p.x + 3, p.y)
            ctx.moveTo(p.x, p.y - 3)
            ctx.lineTo(p.x, p.y + 3)
            ctx.strokeStyle = `rgba(255, 244, 199, ${alpha * 0.7})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [theme])

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {isPixelcraft && <div className={styles.scanlines} aria-hidden="true" />}
      {isImperium && <div className={styles.imperiumVignette} aria-hidden="true" />}
    </>
  )
}
