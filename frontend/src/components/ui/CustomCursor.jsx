import React, { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.css'

export default function CustomCursor() {
  const glowRef = useRef(null)
  const visibleRef = useRef(false)

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const onMouseMove = (e) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
        if (!visibleRef.current) {
          visibleRef.current = true
          glowRef.current.style.opacity = '1'
        }
      }
    }

    const onMouseLeave = () => {
      visibleRef.current = false
      if (glowRef.current) {
        glowRef.current.style.opacity = '0'
      }
    }

    const onMouseEnter = () => {
      visibleRef.current = true
      if (glowRef.current) {
        glowRef.current.style.opacity = '1'
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className={styles.cursorGlow}
      aria-hidden="true"
    />
  )
}
