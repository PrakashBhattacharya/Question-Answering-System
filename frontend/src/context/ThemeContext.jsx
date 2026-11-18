import React, { createContext, useContext, useState, useEffect } from 'react'

export const THEME_ORDER = ['original', 'void', 'cloud', 'ember', 'pixelcraft', 'imperium']

export const THEMES = {
  original: {
    id: 'original',
    name: 'Original',
    subtitle: 'Signature ContextIQ',
    tagline: 'Signature ContextIQ design system',
    icon: '◈',
    pixelPreview: ['#07080a', '#6366f1', '#22d3ee'],
    description: 'The definitive ContextIQ interface with electric indigo and cyan cyber-depth.',
  },
  void: {
    id: 'void',
    name: 'Void',
    subtitle: 'Pure focus. Zero distraction.',
    tagline: 'Deep cinematic black developer environment',
    icon: '✦',
    pixelPreview: ['#000000', '#ffffff', '#888888'],
    description: 'Ultra-modern, black-on-black AI workspace with minimal glow and zero visual noise.',
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud',
    subtitle: 'Clear. Calm. Productive.',
    tagline: 'High-clarity enterprise light workspace',
    icon: '◉',
    pixelPreview: ['#f8f9fb', '#2563eb', '#4f46e5'],
    description: 'Crisp light productivity suite with high legibility, clean shadows, and blue accents.',
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    subtitle: 'Warm intelligence.',
    tagline: 'Warm editorial cream & amber intelligence',
    icon: '◆',
    pixelPreview: ['#fff8f0', '#ea580c', '#d97706'],
    description: 'Thoughtful, human-centric workspace with warm paper tones, amber accents, and editorial warmth.',
  },
  pixelcraft: {
    id: 'pixelcraft',
    name: 'Pixelcraft',
    subtitle: 'Question answering, block by block.',
    tagline: 'Voxel-inspired tactile block world',
    icon: '▣',
    pixelPreview: ['#142016', '#16a34a', '#84cc16'],
    description: 'Original voxel world with physical block cards, directional shadows, and game-inspired tactile UI.',
  },
  imperium: {
    id: 'imperium',
    name: 'Imperium',
    subtitle: 'Intelligence, refined.',
    tagline: 'Dark golden royal intelligence edition',
    icon: '⚜',
    pixelPreview: ['#000000', '#d4af37', '#fff4c7'],
    description: 'Sophisticated royal intelligence system with dark palace depths, antique gold accents, and illuminated manuscript precision.',
  },
}

import { storageService } from '../services/storage'
import { soundService } from '../services/soundService'

const ThemeContext = createContext({
  theme: 'original',
  switchTheme: () => {},
  currentTheme: THEMES.original,
  isOriginal: true,
  isVoid: false,
  isCloud: false,
  isEmber: false,
  isPixelcraft: false,
  isImperium: false,
})

export function ThemeProvider({ children }) {
  // storageService.getUserTheme() reads getActiveUser() from localStorage — no useAuth needed.
  const [theme, setTheme] = useState(() => {
    const saved = storageService.getUserTheme()
    return THEMES[saved] ? saved : 'original'
  })

  // Listen for storage changes (triggered when a different account logs in/out)
  // so the theme re-syncs to the new user's private preference.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'contextiq_user' || e.key === null) {
        const userTheme = storageService.getUserTheme()
        if (userTheme && THEMES[userTheme]) {
          setTheme(userTheme)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const switchTheme = (newTheme, event = null) => {
    if (!THEMES[newTheme]) return
    if (newTheme === theme) return

    soundService.playThemeSwitch(newTheme)

    const updateState = () => {
      setTheme(newTheme)
      storageService.setUserTheme(newTheme)
    }

    if (
      typeof document !== 'undefined' &&
      document.startViewTransition &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    ) {
      const x = event?.clientX ?? window.innerWidth / 2
      const y = event?.clientY ?? window.innerHeight / 2
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      const transition = document.startViewTransition(() => {
        updateState()
      })

      transition.ready?.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 450,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        )
      }).catch(() => {})
    } else {
      updateState()
    }
  }

  // Synchronize data-theme on <html> and <body>
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    
    // Also manage class for convenience if needed
    THEME_ORDER.forEach(t => {
      root.classList.remove(`theme-${t}`)
      document.body.classList.remove(`theme-${t}`)
    })
    root.classList.add(`theme-${theme}`)
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  const value = {
    theme,
    switchTheme,
    currentTheme: THEMES[theme] || THEMES.original,
    isOriginal: theme === 'original',
    isVoid: theme === 'void',
    isCloud: theme === 'cloud',
    isEmber: theme === 'ember',
    isPixelcraft: theme === 'pixelcraft',
    isImperium: theme === 'imperium',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
