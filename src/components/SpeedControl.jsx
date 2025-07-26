import { motion } from 'framer-motion'
import { getSpeedLabel } from '../utils/gameUtils'

const SpeedControl = ({ gameSpeed, setGameSpeed, isManualMode, currentPhase, onBackToIntro }) => {
  if (isManualMode || currentPhase !== 'playing') {
    return null
  }

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: '20px',
        right: onBackToIntro ? '180px' : '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid var(--gold)',
        borderRadius: '8px',
        padding: '10px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <span style={{
        color: 'var(--gold)',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        ⚡ Velocidad:
      </span>
      <motion.button
        onClick={() => setGameSpeed(gameSpeed === 1 ? 2 : 1)}
        style={{
          background: 'var(--gold)',
          color: 'black',
          border: 'none',
          borderRadius: '6px',
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          minWidth: '90px'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {getSpeedLabel(gameSpeed)}
      </motion.button>
    </motion.div>
  )
}

export default SpeedControl
