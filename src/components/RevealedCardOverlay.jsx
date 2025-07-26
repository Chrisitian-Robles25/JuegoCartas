import { motion } from 'framer-motion'
import Card from './Card'

const RevealedCardOverlay = ({ revealedCard, manualRevealedCard, isManualMode }) => {
  const cardToShow = isManualMode && manualRevealedCard ? manualRevealedCard : revealedCard
  
  if (!cardToShow) {
    return null
  }

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '15px',
        border: '2px solid var(--gold)',
        boxShadow: '0 0 30px var(--gold)'
      }}
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      animate={{
        opacity: 1,
        scale: 1.2,
        rotateY: 0,
        boxShadow: [
          '0 0 30px var(--gold)',
          '0 0 50px var(--gold)',
          '0 0 30px var(--gold)'
        ]
      }}
      transition={{
        duration: 0.8,
        boxShadow: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <Card
        card={cardToShow}
        isFlipped={true}
        className="revealed-card"
      />
      <motion.div
        style={{
          textAlign: 'center',
          marginTop: '10px',
          color: 'var(--gold)',
          fontSize: '16px',
          fontFamily: 'var(--font-decorative)'
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {isManualMode ? 'Carta Revelada - Elige Destino' : 'Carta Revelada'}
      </motion.div>
    </motion.div>
  )
}

export default RevealedCardOverlay
