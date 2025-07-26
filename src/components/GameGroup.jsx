import { motion } from 'framer-motion'
import Card from './Card'
import { getGroupPosition } from '../utils/gameUtils'

const GameGroup = ({ 
  group, 
  index, 
  orderedCards, 
  completedGroups, 
  revealingGroups, 
  movingCard, 
  currentGroup, 
  currentPhase, 
  isManualMode, 
  allowedGroups, 
  onGroupClick 
}) => {
  const position = getGroupPosition(index)
  const isCompleted = completedGroups.has(index)
  const isCentral = index === 0
  const isRevealing = revealingGroups.has(index)
  const ordered = orderedCards[index] || []

  // Estados para modo manual
  const isClickable = isManualMode && allowedGroups.has(index) && currentPhase === 'playing'
  const isCurrentGroupHighlighted = index === currentGroup && currentPhase === 'playing'

  return (
    <motion.div
      key={index}
      className={`card-group ${isCentral ? 'central' : ''} ${isCompleted ? 'complete' : ''}`}
      style={{
        ...position,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '10px',
        border: isCurrentGroupHighlighted
          ? '2px solid var(--gold-light)'
          : isClickable
            ? '2px solid var(--gold)'
            : '1px solid transparent',
        borderRadius: '8px',
        padding: '5px',
        cursor: isClickable ? 'pointer' : 'default',
        background: isClickable ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
        transition: 'all 0.3s ease'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: isCompleted ? [
          "0 0 15px var(--gold)",
          "0 0 30px var(--gold)",
          "0 0 15px var(--gold)"
        ] : isClickable ? [
          "0 0 10px var(--gold)",
          "0 0 20px var(--gold)",
          "0 0 10px var(--gold)"
        ] : undefined
      }}
      transition={{
        delay: index * 0.1,
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      onClick={() => isClickable && onGroupClick(index)}
      whileHover={isClickable ? { scale: 1.05 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
    >
      {/* Cartas ordenadas (lado izquierdo) */}
      <OrderedCardsSection ordered={ordered} />

      {/* Grupo principal (centro) */}
      <MainGroupSection 
        group={group}
        index={index}
        isCompleted={isCompleted}
        isRevealing={isRevealing}
        isCentral={isCentral}
        movingCard={movingCard}
        currentGroup={currentGroup}
        currentPhase={currentPhase}
      />
    </motion.div>
  )
}

const OrderedCardsSection = ({ ordered }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    minWidth: '60px'
  }}>
    <div style={{
      fontSize: '10px',
      color: 'var(--gold)',
      opacity: 0.8,
      marginBottom: '2px'
    }}>
      Ordenadas: {ordered.length}/4
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      position: 'relative',
      minHeight: '40px'
    }}>
      {ordered.map((card, cardIndex) => (
        <motion.div
          key={`ordered-${card.id}-${cardIndex}`}
          style={{
            position: 'absolute',
            top: `${cardIndex * -2}px`,
            zIndex: cardIndex + 1,
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 0.6
          }}
          transition={{
            delay: cardIndex * 0.1,
            duration: 0.3
          }}
        >
          <Card
            card={card}
            isFlipped={true}
            className="ordered-card"
          />
        </motion.div>
      ))}
    </div>
  </div>
)

const MainGroupSection = ({ 
  group, 
  index, 
  isCompleted, 
  isRevealing, 
  isCentral, 
  movingCard, 
  currentGroup, 
  currentPhase 
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px'
  }}>
    {/* Etiqueta del grupo */}
    <motion.div
      style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color: isCompleted ? 'var(--gold-light)' : 'var(--gold)',
        marginBottom: '5px',
        fontFamily: 'var(--font-decorative)'
      }}
      animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {isCentral ? 'K' : index === 1 ? 'A' : index}
    </motion.div>

    {/* Cartas del grupo */}
    <div style={{
      display: 'flex',
      flexDirection: (isCompleted && !isRevealing) ? 'row' : 'column',
      gap: (isCompleted && !isRevealing) ? '5px' : '2px',
      position: 'relative',
      minHeight: '40px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }}>
      {group.map((card, cardIndex) => (
        <motion.div
          key={`${card.id}-${cardIndex}`}
          style={{
            position: (isCompleted && !isRevealing) ? 'relative' : 'absolute',
            top: (isCompleted && !isRevealing) ? '0px' : `${(group.length - 1 - cardIndex) * -3}px`,
            zIndex: cardIndex + 1,
          }}
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: movingCard?.id === card.id ? 1.2 : ((isCompleted && !isRevealing) ? 0.8 : 1),
            rotateY: (isCompleted && !isRevealing) ? [0, 360, 0] : 0,
            rotate: (isCompleted && !isRevealing) ? (cardIndex - 1.5) * 15 : 0
          }}
          transition={{
            delay: cardIndex * 0.1,
            duration: movingCard?.id === card.id ? 0.8 : 0.3,
            rotateY: { duration: 2, delay: cardIndex * 0.2 },
            rotate: { duration: 0.5, delay: cardIndex * 0.1 }
          }}
        >
          <Card
            card={card}
            isFlipped={card.faceUp || false}
            className={movingCard?.id === card.id ? 'moving' : ''}
          />
        </motion.div>
      ))}
    </div>

    {/* Indicador de cartas restantes */}
    <motion.div
      style={{
        fontSize: '12px',
        opacity: 0.7,
        marginTop: '5px',
        color: index === currentGroup && currentPhase === 'playing' ? 'var(--gold-light)' : 'var(--gold)'
      }}
    >
      {group.length}/4 {index === currentGroup && currentPhase === 'playing' && '← ACTUAL'}
      {isCompleted && ' ✓'}
    </motion.div>
  </div>
)

export default GameGroup
