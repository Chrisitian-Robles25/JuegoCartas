import { useState } from 'react'
import { motion } from 'framer-motion'

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleAudio = () => {
    setIsPlaying(!isPlaying)
    console.log(`Audio ${!isPlaying ? 'activado' : 'desactivado'} (solo visual)`)
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
