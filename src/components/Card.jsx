import { motion } from 'framer-motion'

const Card = ({ card, isFlipped = false, className = '', style = {} }) => {
  const getSuitSymbol = (suit) => {
    const symbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    }
    return symbols[suit] || '?'
  }

  const getDisplayValue = (card) => {
    if (card.value === 1) return 'A'
    if (card.value === 11) return 'J'
    if (card.value === 12) return 'Q'
    if (card.value === 13) return 'K'
    return card.value.toString()
  }

  return (
    <motion.div
      className={`card ${card?.suit || ''} ${isFlipped ? '' : 'face-down'} ${className}`}
      style={style}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {isFlipped && card ? (
        <motion.div
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%'
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {getDisplayValue(card)}
          </div>
          <div style={{ fontSize: '16px', marginTop: '2px' }}>
            {getSuitSymbol(card.suit)}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            position: 'relative'
          }}
        >
          {/* Parte trasera de la carta con símbolo místico */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ fontSize: '24px' }}
          >
            🔮
          </motion.div>

          {/* Efecto de brillo en la parte trasera */}
          <motion.div
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              right: '10%',
              bottom: '10%',
              border: '1px solid var(--gold)',
              borderRadius: '4px',
              opacity: 0.3
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

export default Card
