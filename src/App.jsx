import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './styles/globals.css'
import IntroScreen from './components/IntroScreen'
import GameBoard from './components/GameBoard'
import ParticlesBackground from './components/ParticlesBackground'
import AudioPlayer from './components/AudioPlayer'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameResult, setGameResult] = useState(null) // Resultado del juego para mostrar pantalla final

  console.log('App renderizado, isLoading:', isLoading, 'gameStarted:', gameStarted)

  useEffect(() => {
    console.log('App montado, iniciando carga...')
    const timer = setTimeout(() => {
      console.log('Carga completada')
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleStartGame = () => {
    console.log('Iniciando juego...')
    setGameStarted(true)
  }

  const handleGameEnd = (result) => {
    console.log('Juego terminado:', result)
    setGameResult(result) // Guardar el resultado para mostrar la pantalla final
    setGameStarted(false) // Volver al estado inicial pero mostrar resultado
  }

  const handleBackToIntro = () => {
    console.log('Volviendo a la introducción...')
    setGameStarted(false)
    setGameResult(null) // Limpiar resultado al volver manualmente
  }

  const handlePlayAgain = () => {
    console.log('Jugando de nuevo...')
    setGameResult(null) // Limpiar resultado
    setGameStarted(true) // Iniciar nuevo juego
  }

  const handleReturnToIntro = () => {
    console.log('Regresando al inicio...')
    setGameResult(null) // Limpiar resultado
    // gameStarted ya está en false
  }

  if (isLoading) {
    return (
      <>
        <ParticlesBackground />
        <AudioPlayer />
        <div className="fullscreen-center">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', color: '#d4af37' }}>🔮</h1>
            <p style={{ color: '#d4af37', fontSize: '18px', marginTop: '20px' }}>
              Preparando el ritual...
            </p>
          </div>
        </div>
      </>
    )
  }

  if (!gameStarted && gameResult) {
    // Mostrar pantalla de resultados
    return (
      <>
        <ParticlesBackground />
        <AudioPlayer />
        <div className="fullscreen-center">
          <motion.div
            style={{
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '40px',
              borderRadius: '20px',
              border: '2px solid var(--gold)',
              boxShadow: '0 0 30px var(--gold)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              boxShadow: [
                '0 0 30px var(--gold)',
                '0 0 50px var(--gold)',
                '0 0 30px var(--gold)'
              ]
            }}
            transition={{
              duration: 0.8,
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            {/* Icono según resultado */}
            <motion.h1
              style={{
                fontSize: '4rem',
                color: gameResult.success ? '#4ade80' : '#ef4444',
                marginBottom: '20px'
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            >
              {gameResult.success ? '🎉' : '💔'}
            </motion.h1>

            {/* Mensaje principal */}
            <motion.h2
              style={{
                color: 'var(--gold)',
                fontSize: '2rem',
                marginBottom: '20px',
                fontFamily: 'var(--font-decorative)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {gameResult.success ? '¡El Destino te Sonríe!' : 'Hoy No es tu Día de Suerte'}
            </motion.h2>

            {/* Mensaje del oráculo */}
            <motion.p
              style={{
                color: 'var(--gold-light)',
                fontSize: '18px',
                marginBottom: '30px',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {gameResult.finalMessage}
            </motion.p>

            {/* Estadísticas */}
            <motion.div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '30px'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <p style={{ color: 'var(--gold)', marginBottom: '10px' }}>
                <strong>Pasos realizados:</strong> {gameResult.steps}
              </p>
              <p style={{ color: 'var(--gold)', marginBottom: '10px' }}>
                <strong>Grupos completados:</strong> {gameResult.completedGroups}
              </p>
              <p style={{ color: 'var(--gold-light)', fontSize: '14px' }}>
                <strong>Razón:</strong> {gameResult.reason}
              </p>
            </motion.div>

            {/* Botones */}
            <motion.div
              style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <motion.button
                onClick={handlePlayAgain}
                style={{
                  background: 'linear-gradient(135deg, var(--gold) 0%, #b8860b 100%)',
                  border: 'none',
                  color: 'black',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 20px var(--gold)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                🎮 Jugar de Nuevo
              </motion.button>

              <motion.button
                onClick={handleReturnToIntro}
                style={{
                  background: 'transparent',
                  border: '2px solid var(--gold)',
                  color: 'var(--gold)',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{
                  background: 'var(--gold)',
                  color: 'black'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                🏠 Volver al Inicio
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </>
    )
  }

  if (!gameStarted) {
    return (
      <>
        <ParticlesBackground />
        <AudioPlayer />
        <IntroScreen onStartGame={handleStartGame} />
      </>
    )
  }

  return (
    <>
      <ParticlesBackground />
      <AudioPlayer />
      <GameBoard
        onBackToIntro={handleBackToIntro}
        onGameEnd={handleGameEnd}
        playerQuestion="¿Qué me depara el destino?"
      />
    </>
  )
}

export default App
