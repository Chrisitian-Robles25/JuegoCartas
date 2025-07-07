import { useEffect, useState } from 'react'

const ParticlesBackground = () => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Crear partículas más simples con CSS
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: '#d4af37',
              borderRadius: '50%',
              opacity: 0.3,
              animation: `particleFloat ${particle.duration}s ease-in-out infinite alternate`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Estilos CSS para las animaciones */}
      <style>{`
        @keyframes particleFloat {
          0% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3; 
          }
          100% { 
            transform: translateY(-20px) rotate(360deg); 
            opacity: 0.1; 
          }
        }
      `}</style>
    </>
  )
}

export default ParticlesBackground
