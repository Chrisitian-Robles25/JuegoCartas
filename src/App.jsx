import { useState, useEffect } from 'react'
import './styles/globals.css'
import IntroScreen from './components/IntroScreen'
import GameBoard from './components/GameBoard'
import ParticlesBackground from './components/ParticlesBackground'
import AudioPlayer from './components/AudioPlayer'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)

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
    // Opcionalmente, mostrar resultados o volver al inicio automáticamente
    // setTimeout(() => setGameStarted(false), 3000)
  }

  const handleBackToIntro = () => {
    console.log('Volviendo a la introducción...')
    setGameStarted(false)
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
