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

  // Inicializar el juego
  useEffect(() => {
    startGame()
  }, [])

  const startGame = async () => {
    setCurrentPhase('shuffling')

    // 1. Crear y barajar el mazo
    const newDeck = createDeck()
    await new Promise(resolve => setTimeout(resolve, 2000)) // Animación de barajado

    const shuffledDeck = casinoShuffle(newDeck)

    setCurrentPhase('distributing')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 2. Distribuir cartas en 13 grupos
    const distributedGroups = distributeCards(shuffledDeck)
    setGroups(distributedGroups)

    await new Promise(resolve => setTimeout(resolve, 2000))
    setCurrentPhase('playing')

    // 3. Comenzar el juego automático
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
      await new Promise(resolve => setTimeout(resolve, 800))

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
        if (gameStep > 150) {
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
      }, 1000)
    }

    const timer = setTimeout(playStep, 1500)
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {group.map((card, cardIndex) => (
            <Card
              key={`${card.id}-${cardIndex}`}
              card={card}
              isFlipped={true}
              className={movingCard?.id === card.id ? 'moving' : ''}
              style={{
                zIndex: cardIndex + 1,
                transform: `translateY(${cardIndex * -15}px)`
              }}
            />
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

      {/* Mesa de juego */}
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
