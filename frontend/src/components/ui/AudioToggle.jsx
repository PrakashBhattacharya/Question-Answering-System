import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { soundService } from '../../services/soundService'
import styles from './AudioToggle.module.css'

export default function AudioToggle() {
  const [muted, setMuted] = useState(soundService.isMuted())

  useEffect(() => {
    const handleToggle = (e) => {
      setMuted(e.detail.muted)
    }
    window.addEventListener('contextiq_sound_toggled', handleToggle)
    return () => window.removeEventListener('contextiq_sound_toggled', handleToggle)
  }, [])

  const handleToggleClick = () => {
    const newMuted = soundService.toggleMute()
    setMuted(newMuted)
    if (!newMuted) {
      soundService.playClick()
    }
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${!muted ? styles.btnActive : ''}`}
      onClick={handleToggleClick}
      title={muted ? 'Unmute UI sounds' : 'Mute UI sounds'}
      aria-label={muted ? 'Unmute UI sounds' : 'Mute UI sounds'}
    >
      {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
    </button>
  )
}
