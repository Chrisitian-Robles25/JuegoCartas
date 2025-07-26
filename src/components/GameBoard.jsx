import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import OracleMessages from './OracleMessages'
import SpeedControl from './SpeedControl'
import ManualInstructions from './ManualInstructions'
import RevealedCardOverlay from './RevealedCardOverlay'
import GameGroup from './GameGroup'
import { createDeck, casinoShuffle, distributeCards, isGameWon } from '../utils/shuffle'
import { frasesFinales, getRandomPhrase } from '../utils/oraclePhrases'
import { useSoundEffects } from '../utils/sounds'
import { useAutoGame } from '../hooks/useAutoGame'
import { useManualGame } from '../hooks/useManualGame'
import { 
  createTimingFunction, 
  createSafePlaySound, 
  validateGameState 
} from '../utils/gameUtils'

const GameBoard = ({ playerQuestion, onGameEnd, onBackToIntro, gameMode = 'auto' }) => {
  // Estados principales del juego
  const [groups, setGroups] = useState(Array.from({ length: 13 }, () => []))
  const [currentPhase, setCurrentPhase] = useState('shuffling')
  const [movingCard, setMovingCard] = useState(null)
  const [gameStep, setGameStep] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [completedGroups, setCompletedGroups] = useState(new Set())
  const [deck, setDeck] = useState([])
  const [shuffleAnimation, setShuffleAnimation] = useState(false)
  const [currentGroup, setCurrentGroup] = useState(0)
  const [revealedCard, setRevealedCard] = useState(null)
  const [revealingPosition, setRevealingPosition] = useState(null)
  const [revealingGroups, setRevealingGroups] = useState(new Set())
  const [orderedCards, setOrderedCards] = useState(Array.from({ length: 13 }, () => []))
  const [gameSpeed, setGameSpeed] = useState(1)

  // Configuración de modo de juego
  const [isManualMode, setIsManualMode] = useState(gameMode === 'manual')

  // Hook de efectos de sonido
  const soundEffects = useSoundEffects()
  const { cardReveal = () => {}, shuffle = () => {}, cardOrdered = () => {}, victory = () => {}, defeat = () => {} } = soundEffects || {}

  // Función helper para reproducir sonidos
  const playSound = createSafePlaySound(soundEffects)

  // Función para obtener tiempos basados en la velocidad
  const getTimings = createTimingFunction(gameSpeed)

  // Hook para modo manual
  const manualGame = useManualGame({
    groups,
    orderedCards,
    currentGroup,
    gameStep,
    currentPhase,
    setGroups,
    setOrderedCards,
    setCurrentGroup,
    setGameStep,
    setCurrentPhase,
    setRevealedCard,
    setRevealingPosition,
    onGameEnd,
    playSound,
    cardReveal,
    cardOrdered,
    victory,
    defeat
  })

  // Función para revelar todas las cartas de un grupo completado
  const revealCompletedGroup = async (groupIndex) => {
    if (revealingGroups.has(groupIndex)) return

    setRevealingGroups(prev => new Set([...prev, groupIndex]))

    // Revelar cartas una por una con animación
    for (let i = 0; i < groups[groupIndex].length; i++) {
      setGroups(prevGroups => {
        const newGroups = [...prevGroups]
        if (newGroups[groupIndex][i]) {
          newGroups[groupIndex][i] = { ...newGroups[groupIndex][i], faceUp: true }
        }
        return newGroups
      })
      // Sonido de revelación de carta
      playSound(cardReveal, 'Card Reveal - Group Complete')
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Después de 3 segundos, quitar de la lista de revelación para mostrar en abanico
    setTimeout(() => {
      setRevealingGroups(prev => {
        const newSet = new Set(prev)
        newSet.delete(groupIndex)
        return newSet
      })
    }, 3000)
  }

  // Hook para juego automático
  useAutoGame({
    isAutoPlaying,
    currentPhase,
    groups,
    gameStep,
    currentGroup,
    orderedCards,
    gameSpeed,
    setIsAutoPlaying,
    setCurrentPhase,
    setRevealedCard,
    setRevealingPosition,
    setMovingCard,
    setGroups,
    setOrderedCards,
    setCurrentGroup,
    setGameStep,
    onGameEnd,
    playSound,
    cardReveal,
    cardOrdered,
    victory,
    defeat,
    revealCompletedGroup,
    getTimings
  })

  // Inicializar el juego
  useEffect(() => {
    startGame()
  }, [])

  const startGame = async () => {
    console.log('🎮 Iniciando nuevo juego...')
    
    // Resetear todos los estados
    setCurrentPhase('shuffling')
    setGameStep(0)
    setCompletedGroups(new Set())
    setCurrentGroup(0)
    setRevealedCard(null)
    setRevealingPosition(null)
    setRevealingGroups(new Set())
    setOrderedCards(Array.from({ length: 13 }, () => []))

    // Resetear estados específicos del modo manual
    if (isManualMode) {
      manualGame.resetManualStates()
    }

    // 1. Crear el mazo inicial y mostrarlo
    const newDeck = createDeck()
    setDeck(newDeck)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 2. Animación de barajado
    setShuffleAnimation(true)
    playSound(shuffle, 'Shuffle')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 3. Barajar el mazo
    const shuffledDeck = casinoShuffle(newDeck)
    setDeck(shuffledDeck)
    setShuffleAnimation(false)
    await new Promise(resolve => setTimeout(resolve, 1000))

    setCurrentPhase('distributing')

    // 4. Distribuir cartas gradualmente
    const distributedGroups = distributeCards(shuffledDeck)
    const groupsWithFaceDownCards = distributedGroups.map(group =>
      group.map(card => ({ ...card, faceUp: false }))
    )

    // Animar la distribución carta por carta
    for (let i = 0; i < 13; i++) {
      setGroups(prevGroups => {
        const newGroups = [...prevGroups]
        newGroups[i] = groupsWithFaceDownCards[i]
        return newGroups
      })
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    setCurrentPhase('playing')

    // 5. Configurar modo de juego
    if (isManualMode) {
      manualGame.initializeManualMode()
    } else {
      // Modo automático: comenzar el juego automático
      setTimeout(() => {
        setIsAutoPlaying(true)
      }, 1000)
    }

    // Validar estado inicial del juego
    validateGameState(groupsWithFaceDownCards, orderedCards)
    console.log('✅ Juego iniciado correctamente')
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

      {/* Control de velocidad */}
      <SpeedControl 
        gameSpeed={gameSpeed}
        setGameSpeed={setGameSpeed}
        isManualMode={isManualMode}
        currentPhase={currentPhase}
        onBackToIntro={onBackToIntro}
      />

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
            {groups.map((group, index) => (
              <GameGroup 
                key={index}
                group={group}
                index={index}
                orderedCards={orderedCards}
                completedGroups={completedGroups}
                revealingGroups={revealingGroups}
                movingCard={movingCard}
                currentGroup={currentGroup}
                currentPhase={currentPhase}
                isManualMode={isManualMode}
                allowedGroups={manualGame.allowedGroups}
                onGroupClick={manualGame.handleManualGroupClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Carta revelada como superposición */}
      <RevealedCardOverlay 
        revealedCard={revealedCard}
        manualRevealedCard={manualGame.manualRevealedCard}
        isManualMode={isManualMode}
      />

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

      {/* Panel de instrucciones para modo manual */}
      <ManualInstructions 
        isManualMode={isManualMode}
        currentPhase={currentPhase}
        waitingForReveal={manualGame.waitingForReveal}
        waitingForPlacement={manualGame.waitingForPlacement}
        manualRevealedCard={manualGame.manualRevealedCard}
        gameStep={gameStep}
        currentGroup={currentGroup}
      />
    </div>
  )
}

export default GameBoard
