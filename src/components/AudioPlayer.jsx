import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    // Crear un audio context simple con tono generado
    const createAudioContext = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        const audioContext = new AudioContext()

        // Crear oscilador para música ambiente místico
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Configurar sonido místico (frecuencias bajas y suaves)
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime) // A3
        oscillator.type = 'sine'

        // Volumen muy bajo para música ambiente
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

        return { audioContext, oscillator, gainNode }
      } catch (error) {
        console.log('Audio no disponible:', error)
        return null
      }
    }

    if (isPlaying && !audioRef.current) {
      const audio = createAudioContext()
      if (audio) {
        audio.oscillator.start()
        audioRef.current = audio
        setAudioEnabled(true)
      }
    } else if (!isPlaying && audioRef.current) {
      try {
        audioRef.current.oscillator.stop()
        audioRef.current.audioContext.close()
        audioRef.current = null
      } catch (error) {
        console.log('Error al detener audio:', error)
      }
    }

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.oscillator.stop()
          audioRef.current.audioContext.close()
        } catch (error) {
          // Audio ya detenido
        }
      }
    }
  }, [isPlaying])

  const toggleAudio = async () => {
    try {
      // Solicitar permisos de audio en navegadores modernos
      if (!audioEnabled && !isPlaying) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
          const tempContext = new AudioContext()
          if (tempContext.state === 'suspended') {
            await tempContext.resume()
          }
          tempContext.close()
        }
      }

      setIsPlaying(!isPlaying)
      console.log(`Audio ${!isPlaying ? 'activado' : 'desactivado'}`)
    } catch (error) {
      console.log('Error al activar audio:', error)
      alert('Audio no disponible en este navegador')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}
    >
      <motion.button
        className="mystic-button"
        onClick={toggleAudio}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}
      >
        {isPlaying ? '🔊' : '🔇'}
      </motion.button>
    </motion.div>
  )
}

export default AudioPlayer
