import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSoundEffects } from '../utils/sounds'

const IntroScreen = ({ onStartGame }) => {
  const [question, setQuestion] = useState('')
  const [gameMode, setGameMode] = useState('auto') // 'auto' o 'manual'
  
  const { uiClick } = useSoundEffects()

  // Activar sonidos automáticamente al cargar
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Pequeño delay para asegurar que el componente esté montado
        setTimeout(async () => {
          await uiClick() // Activa el contexto de audio con un sonido silencioso
          console.log('🎵 Audio activado automáticamente')
        }, 500)
      } catch (error) {
        console.log('Audio no pudo activarse automáticamente:', error)
      }
    }
    
    initAudio()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.trim()) {
      onStartGame(question.trim(), gameMode)
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  }

  const itemVariants = {
    initial: { y: 50, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      className="fullscreen-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.h1
        className="main-title glow-text-lg floating"
        variants={itemVariants}
      >
        Oráculo de la Suerte
      </motion.h1>

      <motion.p
        className="subtitle"
        variants={itemVariants}
      >
        Las cartas revelarán los secretos del destino
      </motion.p>

      <motion.div
        className="oracle-message"
        variants={itemVariants}
        style={{
          maxWidth: '600px',
          marginBottom: '40px',
          fontSize: '20px'
        }}
      >
        <p>Bienvenido, buscador de verdades.</p>
        <p>Haz una pregunta al oráculo y permite que las cartas dancen para revelarte tu destino.</p>
      </motion.div>

      {/* Selección de modo de juego */}
      <motion.div
        variants={itemVariants}
        style={{
          marginBottom: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}
      >
        <p style={{
          color: 'var(--gold)',
          fontSize: '18px',
          marginBottom: '10px',
          fontFamily: 'var(--font-decorative)'
        }}>
          Elige tu camino hacia el destino:
        </p>

        <div style={{ display: 'flex', gap: '20px' }}>
          <motion.button
            type="button"
            onClick={() => setGameMode('auto')}
            style={{
              background: gameMode === 'auto' ? 'var(--gold)' : 'transparent',
              border: '2px solid var(--gold)',
              color: gameMode === 'auto' ? 'black' : 'var(--gold)',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🤖 Automático
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setGameMode('manual')}
            style={{
              background: gameMode === 'manual' ? 'var(--gold)' : 'transparent',
              border: '2px solid var(--gold)',
              color: gameMode === 'manual' ? 'black' : 'var(--gold)',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✋ Manual
          </motion.button>
        </div>

        <p style={{
          color: 'var(--gold-light)',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '400px',
          fontStyle: 'italic'
        }}>
          {gameMode === 'auto'
            ? 'El oráculo controlará las cartas automáticamente'
            : 'Tú controlarás cada movimiento de las cartas'
          }
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        variants={itemVariants}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxWidth: '500px',
          width: '100%'
        }}
      >
        <motion.input
          type="text"
          placeholder="¿Qué pregunta llevas en tu corazón?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mystic-input"
          style={{
            fontSize: '18px',
            textAlign: 'center',
            minHeight: '60px'
          }}
          maxLength={200}
          whileFocus={{ scale: 1.02 }}
        />

        <motion.button
          type="submit"
          className="mystic-button"
          disabled={!question.trim()}
          whileHover={{ scale: question.trim() ? 1.05 : 1 }}
          whileTap={{ scale: question.trim() ? 0.95 : 1 }}
          style={{
            fontSize: '20px',
            padding: '15px 30px',
            opacity: question.trim() ? 1 : 0.6,
            cursor: question.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          Consultar al Oráculo
        </motion.button>
      </motion.form>

      <motion.div
        variants={itemVariants}
        style={{
          marginTop: '40px',
          textAlign: 'center',
          maxWidth: '500px'
        }}
      >
        <p style={{
          fontSize: '14px',
          opacity: 0.7,
          fontStyle: 'italic',
          color: 'var(--gold)'
        }}>
          🎵 Los sonidos místicos del oráculo están listos para acompañarte
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 2 }}
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          opacity: 0.6,
          textAlign: 'center'
        }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default IntroScreen
