import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import OracleMessages from './OracleMessages'
import { createDeck, casinoShuffle, distributeCards, isGameWon } from '../utils/shuffle'
import { frasesFinales, getRandomPhrase } from '../utils/oraclePhrases'

const GameBoard = ({ playerQuestion, onGameEnd, onBackToIntro }) => {
  const [groups, setGroups] = useState(Array.from({ length: 13 }, () => []))
  const [currentPhase, setCurrentPhase] = useState('shuffling') // 'shuffling', 'distributing', 'playing', 'checking', 'finished'
  const [movingCard, setMovingCard] = useState(null)
  const [gameStep, setGameStep] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [completedGroups, setCompletedGroups] = useState(new Set())
  const [deck, setDeck] = useState([])
  const [shuffleAnimation, setShuffleAnimation] = useState(false)

  // Inicializar el juego
  useEffect(() => {
    startGame()
  }, [])

  const startGame = async () => {
    setCurrentPhase('shuffling')
    setGameStep(0)
    setCompletedGroups(new Set())

    // 1. Crear el mazo inicial y mostrarlo
    const newDeck = createDeck()
    setDeck(newDeck)

    // Mostrar el mazo inicial por un momento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 2. Animación de barajado (riffle shuffle)
    setShuffleAnimation(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 3. Barajar el mazo
    const shuffledDeck = casinoShuffle(newDeck)
    setDeck(shuffledDeck)
    setShuffleAnimation(false)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setCurrentPhase('distributing')

    // 4. Distribuir cartas gradualmente
    const distributedGroups = distributeCards(shuffledDeck)

    // Animar la distribución carta por carta
    for (let i = 0; i < 13; i++) {
      setGroups(prevGroups => {
        const newGroups = [...prevGroups]
        newGroups[i] = distributedGroups[i]
        return newGroups
      })
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    setCurrentPhase('playing')

    // 5. Comenzar el juego automático
    setTimeout(() => {
      setIsAutoPlaying(true)
    }, 1000)
  }

  // Lógica principal del juego automático
  useEffect(() => {
    if (!isAutoPlaying || currentPhase !== 'playing') return

    const playStep = async () => {
      // Grupo central es el índice 0 (que representa el grupo 13)
      const centralGroup = groups[0]

      if (centralGroup.length === 0) {
        // No hay más cartas en el grupo central
        setCurrentPhase('checking')

        // Llamar checkGameResult directamente en lugar de usar el callback
        const won = isGameWon(groups)
        console.log('Verificando resultado del juego:', { won, groups })

        const finalMessage = won
          ? getRandomPhrase(frasesFinales.exito)
          : getRandomPhrase(frasesFinales.fracaso)

        setTimeout(() => {
          setCurrentPhase('finished')
          if (onGameEnd) {
            onGameEnd({
              success: won,
              finalMessage: finalMessage,
              steps: gameStep,
              completedGroups: completedGroups.size
            })
          }
        }, 2000)
        return
      }

      // Tomar la carta superior del grupo central
      const cardToMove = centralGroup[centralGroup.length - 1]
      setMovingCard(cardToMove)

      // Calcular el grupo de destino
      let targetGroupIndex
      if (cardToMove.value === 13) {
        targetGroupIndex = 0 // Rey va al grupo central
      } else if (cardToMove.value === 1) {
        targetGroupIndex = 1 // As va al grupo 1
      } else {
        targetGroupIndex = cardToMove.value // Otros van a su número correspondiente
      }

      // Animar el movimiento
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mover la carta
      setGroups(prevGroups => {
        const newGroups = [...prevGroups]

        // Remover del grupo central
        newGroups[0] = newGroups[0].slice(0, -1)

        // Agregar al grupo destino
        newGroups[targetGroupIndex] = [...newGroups[targetGroupIndex], cardToMove]

        return newGroups
      })

      setMovingCard(null)
      setGameStep(prev => prev + 1)

      // Verificar si algún grupo se completó (directamente)
      const newCompletedGroups = new Set()
      groups.forEach((group, index) => {
        if (group.length === 4) {
          const expectedValue = index === 0 ? 13 : index
          const isComplete = group.every(card =>
            index === 0 ? card.value === 13 : card.value === expectedValue
          )
          if (isComplete) {
            newCompletedGroups.add(index)
          }
        }
      })
      setCompletedGroups(newCompletedGroups)

      // Continuar con el siguiente paso después de una pausa
      setTimeout(() => {
        // Si el juego ha durado mucho, terminar automáticamente
        if (gameStep > 100) {
          setCurrentPhase('checking')

          const won = isGameWon(groups)
          const finalMessage = won
            ? getRandomPhrase(frasesFinales.exito)
            : getRandomPhrase(frasesFinales.fracaso)

          setTimeout(() => {
            setCurrentPhase('finished')
            if (onGameEnd) {
              onGameEnd({
                success: won,
                finalMessage: finalMessage,
                steps: gameStep,
                completedGroups: completedGroups.size
              })
            }
          }, 2000)
        }
      }, 800)
    }

    const timer = setTimeout(playStep, 2000)
    return () => clearTimeout(timer)
  }, [isAutoPlaying, groups, gameStep, currentPhase, onGameEnd, completedGroups.size])

  // Posiciones de los grupos en círculo
  const getGroupPosition = (index) => {
    if (index === 0) {
      // Grupo central (Rey/13)
      return {
        gridColumn: '3',
        gridRow: '3',
        transform: 'scale(1.1)'
      }
    }

    // Posiciones circulares para grupos 1-12
    const positions = [
      null, // índice 0 ya manejado
      { gridColumn: '3', gridRow: '1' }, // 12 o'clock
      { gridColumn: '4', gridRow: '1' }, // 1 o'clock
      { gridColumn: '5', gridRow: '2' }, // 2 o'clock
      { gridColumn: '5', gridRow: '3' }, // 3 o'clock
      { gridColumn: '5', gridRow: '4' }, // 4 o'clock
      { gridColumn: '4', gridRow: '5' }, // 5 o'clock
      { gridColumn: '3', gridRow: '5' }, // 6 o'clock
      { gridColumn: '2', gridRow: '5' }, // 7 o'clock
      { gridColumn: '1', gridRow: '4' }, // 8 o'clock
      { gridColumn: '1', gridRow: '3' }, // 9 o'clock
      { gridColumn: '1', gridRow: '2' }, // 10 o'clock
      { gridColumn: '2', gridRow: '1' }, // 11 o'clock
    ]

    return positions[index] || { gridColumn: '3', gridRow: '3' }
  }

  const renderGroup = (group, index) => {
    const position = getGroupPosition(index)
    const isCompleted = completedGroups.has(index)
    const isCentral = index === 0

    return (
      <motion.div
        key={index}
        className={`card-group ${isCentral ? 'central' : ''} ${isCompleted ? 'complete' : ''}`}
        style={{
          ...position,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px'
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: isCompleted ? [
            "0 0 15px var(--gold)",
            "0 0 30px var(--gold)",
            "0 0 15px var(--gold)"
          ] : undefined
        }}
        transition={{
          delay: index * 0.1,
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
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
          flexDirection: isCompleted ? 'row' : 'column',
          gap: isCompleted ? '5px' : '2px',
          position: 'relative',
          minHeight: '40px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {group.map((card, cardIndex) => (
            <motion.div
              key={`${card.id}-${cardIndex}`}
              style={{
                position: isCompleted ? 'relative' : 'absolute',
                top: isCompleted ? '0px' : `${cardIndex * -3}px`,
                zIndex: cardIndex + 1,
              }}
              initial={{ opacity: 0, y: -50 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: movingCard?.id === card.id ? 1.2 : (isCompleted ? 0.8 : 1),
                rotateY: isCompleted ? [0, 360, 0] : 0
              }}
              transition={{
                delay: cardIndex * 0.1,
                duration: movingCard?.id === card.id ? 0.8 : 0.3,
                rotateY: { duration: 2, delay: cardIndex * 0.2 }
              }}
            >
              <Card
                card={card}
                isFlipped={true}
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
            marginTop: '5px'
          }}
        >
          {group.length}/4
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <OracleMessages isGameActive={true} currentPhase={currentPhase} />

      {/* Botón para volver al inicio */}
      {onBackToIntro && (
        <motion.button
          onClick={onBackToIntro}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            zIndex: 1000
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--gold)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ← Volver al Inicio
        </motion.button>
      )}

      {/* Información del juego */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid var(--gold)',
          color: 'var(--gold)',
          fontSize: '14px',
          zIndex: 100
        }}
      >
        <div>Pregunta: &quot;{playerQuestion}&quot;</div>
        <div>Paso: {gameStep}</div>
        <div>Grupos completos: {completedGroups.size}/13</div>
        <div>Fase: {currentPhase}</div>
      </motion.div>

      {/* Mazo durante barajado y distribución */}
      {(currentPhase === 'shuffling' || currentPhase === 'distributing') && (
        <motion.div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          {/* Pila de cartas del mazo */}
          <div style={{ position: 'relative', width: '80px', height: '120px' }}>
            {deck.slice(0, 10).map((card, index) => (
              <motion.div
                key={`deck-${card.id}`}
                style={{
                  position: 'absolute',
                  width: '80px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 100%)',
                  border: '2px solid var(--gold)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold)',
                  fontSize: '24px',
                  transform: `translateY(${index * -2}px) rotate(${shuffleAnimation ? Math.sin(Date.now() / 1000 + index) * 10 : 0}deg)`,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
                animate={shuffleAnimation ? {
                  x: [0, Math.sin(index) * 20, 0],
                  rotate: [0, Math.sin(index) * 15, 0]
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: shuffleAnimation ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                🂠
              </motion.div>
            ))}
          </div>

          {/* Texto de estado */}
          <motion.div
            style={{
              textAlign: 'center',
              marginTop: '20px',
              color: 'var(--gold)',
              fontSize: '18px',
              fontFamily: 'var(--font-decorative)'
            }}
          >
            {currentPhase === 'shuffling' && 'Barajando...'}
            {currentPhase === 'distributing' && 'Distribuyendo cartas...'}
          </motion.div>
        </motion.div>
      )}

      {/* Mesa de juego */}
      {currentPhase === 'playing' && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <div className="game-table">
            {groups.map((group, index) => renderGroup(group, index))}
          </div>
        </div>
      )}

      {/* Indicador de progreso */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px 20px',
          borderRadius: '20px',
          border: '1px solid var(--gold)',
          color: 'var(--gold)',
          fontSize: '16px'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {currentPhase === 'shuffling' && 'Barajando las cartas del destino...'}
        {currentPhase === 'distributing' && 'Distribuyendo las cartas sagradas...'}
        {currentPhase === 'playing' && 'El oráculo trabaja su magia...'}
        {currentPhase === 'checking' && 'Contemplando el resultado final...'}
      </motion.div>
    </div>
  )
}

export default GameBoard
