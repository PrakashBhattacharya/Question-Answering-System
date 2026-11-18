import { useEffect, useRef } from 'react'

/**
 * Adds the "revealed" class to the element when it enters the viewport.
 * Uses IntersectionObserver — no layout thrash, no re-renders.
 */
export function useScrollReveal({ threshold = 0.1, rootMargin = '0px' } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}
