import { motion } from 'framer-motion'

const ManualInstructions = ({ 
  isManualMode, 
  currentPhase, 
  waitingForReveal, 
  waitingForPlacement, 
  manualRevealedCard, 
  gameStep, 
  currentGroup 
}) => {
  if (!isManualMode || currentPhase !== 'playing') {
    return null
  }

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        border: '2px solid var(--gold)',
        borderRadius: '15px',
        padding: '20px',
        maxWidth: '300px',
        zIndex: 1000
      }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      <h3 style={{
        color: 'var(--gold)',
        marginBottom: '15px',
        fontSize: '18px',
        textAlign: 'center',
        fontFamily: 'var(--font-decorative)'
      }}>
        🎮 Modo Manual
      </h3>

      {waitingForReveal && (
        <div style={{ color: 'var(--gold-light)', fontSize: '14px', lineHeight: '1.4' }}>
          <p><strong>📋 Instrucciones:</strong></p>
          <p>• Click en el <strong>grupo resaltado</strong> para revelar la carta superior</p>
          <p>• Solo puedes interactuar con grupos habilitados</p>
          {manualRevealedCard && (
            <p style={{ marginTop: '10px', color: 'var(--gold)' }}>
              <strong>Carta a revelar:</strong> {manualRevealedCard.display} de {manualRevealedCard.suit}
            </p>
          )}
        </div>
      )}

      {waitingForPlacement && manualRevealedCard && (
        <div style={{ color: 'var(--gold-light)', fontSize: '14px', lineHeight: '1.4' }}>
          <p><strong>📋 Instrucciones:</strong></p>
          <p>• Click en el <strong>grupo destino</strong> para colocar la carta</p>
          <p><strong>Carta revelada:</strong> {manualRevealedCard.display} de {manualRevealedCard.suit}</p>
          <p>• Destino: Grupo {manualRevealedCard.value === 13 ? 'K' : manualRevealedCard.value === 1 ? 'A' : manualRevealedCard.value}</p>
        </div>
      )}

      <div style={{
        marginTop: '15px',
        paddingTop: '10px',
        borderTop: '1px solid var(--gold)',
        fontSize: '12px',
        color: 'var(--gold-light)'
      }}>
        <p>Paso: {gameStep}</p>
        <p>Grupo actual: {currentGroup === 0 ? 'K' : currentGroup === 1 ? 'A' : currentGroup}</p>
      </div>
    </motion.div>
  )
}

export default ManualInstructions
