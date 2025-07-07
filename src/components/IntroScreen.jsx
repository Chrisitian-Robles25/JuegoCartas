import { useState } from 'react'
import { motion } from 'framer-motion'

const IntroScreen = ({ onStartGame }) => {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.trim()) {
      onStartGame(question.trim())
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
        <p>El antiguo ritual de las 52 cartas decidirá si la fortuna te sonríe.</p>
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
          fontSize: '16px',
          opacity: 0.8,
          fontStyle: 'italic',
          color: 'var(--gold)'
        }}>
          🔮 El ritual ancestral comenzará con el barajado de 52 cartas sagradas.<br />
          Su distribución en 13 grupos revelará si los dioses del azar te favorecen.
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
          ✨ Haz tu pregunta y presiona Enter ✨
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default IntroScreen
