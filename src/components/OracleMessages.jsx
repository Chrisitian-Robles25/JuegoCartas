import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { frasesOraculo, getRandomPhrase } from '../utils/oraclePhrases'

const OracleMessages = ({ isGameActive, currentPhase }) => {
  const [currentMessage, setCurrentMessage] = useState('')
  const [messageKey, setMessageKey] = useState(0)

  useEffect(() => {
    if (!isGameActive) return

    // Mostrar mensajes según la fase del juego
    let message = ''

    switch (currentPhase) {
      case 'shuffling':
        message = 'Las cartas danzan en el viento del destino...'
        break
      case 'distributing':
        message = 'Los 13 círculos sagrados se preparan para recibir la sabiduría...'
        break
      case 'playing':
        message = getRandomPhrase(frasesOraculo)
        break
      case 'checking':
        message = 'El oráculo contempla el orden de las cartas...'
        break
      default:
        message = getRandomPhrase(frasesOraculo)
    }

    setCurrentMessage(message)
    setMessageKey(prev => prev + 1)

    // Cambiar mensaje periódicamente durante el juego
    if (currentPhase === 'playing') {
      const interval = setInterval(() => {
        setCurrentMessage(getRandomPhrase(frasesOraculo))
        setMessageKey(prev => prev + 1)
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [isGameActive, currentPhase])

  if (!isGameActive || !currentMessage) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        maxWidth: '600px',
        width: '90%'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={messageKey}
          className="oracle-message"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            boxShadow: [
              "0 0 10px var(--glow-color)",
              "0 0 20px var(--glow-color)",
              "0 0 10px var(--glow-color)"
            ]
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            duration: 0.6,
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '2px solid var(--gold)',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'center',
            fontSize: '18px',
            fontStyle: 'italic',
            color: 'var(--gold)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Efecto de brillo en el fondo */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent)',
              pointerEvents: 'none'
            }}
            animate={{
              left: ['100%', '-100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Iconos decorativos */}
          <motion.span
            style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '24px'
            }}
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🔮
          </motion.span>

          <motion.span
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '24px'
            }}
            animate={{
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          >
            ✨
          </motion.span>

          {/* Texto del mensaje */}
          <motion.div
            style={{ margin: '0 40px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentMessage}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default OracleMessages
