// Web Audio API Sound Service for ContextIQ
// Zero external audio files, ultra-low latency, pure synthesized harmonics.

class SoundService {
  constructor() {
    this.ctx = null
    this.muted = localStorage.getItem('contextiq_sound_muted') === 'true'
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  isMuted() {
    return this.muted
  }

  setMuted(muted) {
    this.muted = !!muted
    localStorage.setItem('contextiq_sound_muted', this.muted ? 'true' : 'false')
    window.dispatchEvent(new CustomEvent('contextiq_sound_toggled', { detail: { muted: this.muted } }))
  }

  toggleMute() {
    this.setMuted(!this.muted)
    return this.muted
  }

  // Generic tone generator
  playTone(freq, duration = 0.15, type = 'sine', gainVal = 0.1, delay = 0) {
    if (this.muted) return
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime + delay
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(gainVal, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + duration)
    } catch {
      // AudioContext could be blocked by browser policy until gesture
    }
  }

  // Micro-click on buttons
  playClick() {
    if (this.muted) return
    this.playTone(800, 0.04, 'triangle', 0.05)
  }

  // Whoosh when asking a question
  playQuestionAsk() {
    if (this.muted) return
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.18)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.22)
    } catch {}
  }

  // Harmonic chime when an answer arrives
  playAnswerSuccess() {
    if (this.muted) return
    this.playTone(523.25, 0.2, 'sine', 0.08, 0)       // C5
    this.playTone(659.25, 0.28, 'triangle', 0.09, 0.08) // E5
    this.playTone(783.99, 0.35, 'sine', 0.07, 0.16) // G5
  }

  // Bespoke acoustic motif per theme
  playThemeSwitch(themeId) {
    if (this.muted) return
    try {
      this.init()
      if (!this.ctx) return

      switch (themeId) {
        case 'pixelcraft': {
          // Retro 8-bit coin jump arpeggio (square wave)
          this.playTone(440, 0.06, 'square', 0.05, 0)
          this.playTone(554.37, 0.06, 'square', 0.06, 0.05)
          this.playTone(659.25, 0.12, 'square', 0.07, 0.10)
          break
        }
        case 'imperium': {
          // Resonant imperial royal chime / gong
          this.playTone(293.66, 0.45, 'triangle', 0.1, 0)
          this.playTone(440.00, 0.4, 'sine', 0.08, 0.05)
          this.playTone(587.33, 0.6, 'sine', 0.09, 0.1)
          break
        }
        case 'void': {
          // Subtle muted mechanical tactile click
          this.playTone(180, 0.05, 'triangle', 0.07, 0)
          this.playTone(120, 0.08, 'sine', 0.05, 0.03)
          break
        }
        case 'cloud': {
          // Sparkling clear glass chime
          this.playTone(659.25, 0.22, 'sine', 0.07, 0)
          this.playTone(880.00, 0.32, 'sine', 0.06, 0.08)
          break
        }
        case 'ember': {
          // Warm acoustic tone
          this.playTone(329.63, 0.3, 'sine', 0.08, 0)
          this.playTone(392.00, 0.35, 'triangle', 0.07, 0.07)
          break
        }
        case 'original':
        default: {
          // Futuristic cybernetic laser chirp
          const now = this.ctx.currentTime
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(700, now)
          osc.frequency.exponentialRampToValueAtTime(1400, now + 0.14)
          gain.gain.setValueAtTime(0.04, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
          osc.connect(gain)
          gain.connect(this.ctx.destination)
          osc.start(now)
          osc.stop(now + 0.15)
          break
        }
      }
    } catch {}
  }

  // Realistic parchment/book page turn sound
  playPageTurn() {
    if (this.muted) return
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.18)
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let b0 = 0, b1 = 0, b2 = 0

      // Pink noise with subtle air turbulence
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.12
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      // Dynamic resonant bandpass to mimic sliding paper sheet
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(950, now)
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.08)
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.18)
      filter.Q.value = 1.4

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.09, now + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      noise.start(now)
      noise.stop(now + 0.19)
    } catch {}
  }
}

export const soundService = new SoundService()
