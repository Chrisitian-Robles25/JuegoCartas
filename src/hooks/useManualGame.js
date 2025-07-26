import { useState } from 'react'

/**
 * Hook personalizado para manejar la lógica del juego manual
 */
export const useManualGame = ({
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
}) => {
  const [waitingForReveal, setWaitingForReveal] = useState(false)
  const [waitingForPlacement, setWaitingForPlacement] = useState(false)
  const [allowedGroups, setAllowedGroups] = useState(new Set())
  const [manualRevealedCard, setManualRevealedCard] = useState(null)

  // Función principal para manejar clicks en grupos
  const handleManualGroupClick = (groupIndex) => {
    if (!allowedGroups.has(groupIndex)) return

    if (waitingForReveal) {
      handleManualReveal(groupIndex)
    } else if (waitingForPlacement && manualRevealedCard) {
      handleManualPlacement(groupIndex)
    }
  }

  // Función para revelar carta en modo manual
  const handleManualReveal = (groupIndex) => {
    const group = groups[groupIndex]
    if (!group || group.length === 0) return

    const topCard = group[group.length - 1]

    // Determinar grupo de destino
    const targetGroupIndex = getTargetGroupIndex(topCard)

    // Verificar bloqueo antes de revelar
    if (checkBlocking(topCard, targetGroupIndex)) {
      handleBlockingInManualMode(topCard, groupIndex, targetGroupIndex)
      return
    }

    // Revelar carta
    setManualRevealedCard({ ...topCard, faceUp: true })
    setWaitingForReveal(false)
    setWaitingForPlacement(true)

    playSound(cardReveal, 'Manual Card Reveal')

    // Determinar grupos válidos para colocación
    const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
    const isCardGoingToCorrectPlace = topCard.value === expectedValue
    const validGroups = new Set([targetGroupIndex])

    if (isCardGoingToCorrectPlace) {
      validGroups.add(-1) // Área de cartas ordenadas
    }

    setAllowedGroups(validGroups)
    setCurrentGroup(groupIndex)

    console.log(`Carta revelada: ${topCard.display} de ${topCard.suit}. Colocar en grupo ${targetGroupIndex}`)
  }

  // Función para colocar carta en modo manual
  const handleManualPlacement = (targetGroupIndex) => {
    if (!manualRevealedCard) return

    const topCard = manualRevealedCard
    const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
    const isCardGoingToCorrectPlace = topCard.value === expectedValue

    // Remover carta del grupo origen
    setGroups(prevGroups => {
      const newGroups = [...prevGroups]
      newGroups[currentGroup] = newGroups[currentGroup].slice(0, -1)
      return newGroups
    })

    if (isCardGoingToCorrectPlace) {
      // Colocar en cartas ordenadas
      setOrderedCards(prevOrdered => {
        const newOrdered = [...prevOrdered]
        newOrdered[targetGroupIndex] = [...newOrdered[targetGroupIndex], topCard]
        return newOrdered
      })

      playSound(cardOrdered, 'Manual Card Ordered')

      // Verificar condiciones post-colocación
      if (checkPostPlacementConditions(targetGroupIndex)) {
        return
      }
    } else {
      // Colocar en grupo normal
      setGroups(prevGroups => {
        const newGroups = [...prevGroups]
        newGroups[targetGroupIndex] = [topCard, ...newGroups[targetGroupIndex]]
        return newGroups
      })
    }

    // Resetear estados y continuar
    resetManualStates()
    setCurrentGroup(targetGroupIndex)
    setAllowedGroups(new Set([targetGroupIndex]))
    setGameStep(prev => prev + 1)

    console.log(`Carta colocada. Siguiente grupo activo: ${targetGroupIndex}`)
  }

  // Función para obtener el índice del grupo de destino
  const getTargetGroupIndex = (card) => {
    if (card.value === 13) return 0
    if (card.value === 1) return 1
    return card.value
  }

  // Función para verificar bloqueo
  const checkBlocking = (topCard, targetGroupIndex) => {
    const targetGroup = groups[targetGroupIndex]
    const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
    const cardsOfCorrectValue = targetGroup.filter(card => card.value === expectedValue).length

    return cardsOfCorrectValue >= 3 && topCard.value === expectedValue
  }

  // Función para manejar bloqueo en modo manual
  const handleBlockingInManualMode = (topCard, groupIndex, targetGroupIndex) => {
    const cardsOfCorrectValue = groups[targetGroupIndex].filter(
      card => card.value === (targetGroupIndex === 0 ? 13 : targetGroupIndex)
    ).length

    console.log(`BLOQUEO DETECTADO en modo manual: Grupo ${targetGroupIndex} ya tiene ${cardsOfCorrectValue} cartas`)

    setRevealedCard({ ...topCard, faceUp: true })
    setRevealingPosition({ groupIndex, cardIndex: groups[groupIndex].length - 1 })

    playSound(cardReveal, 'Manual Card Reveal - Blocking')

    setTimeout(() => {
      const completedOrderedGroups = orderedCards.filter(group => group.length === 4).length

      setCurrentPhase('finished')
      playSound(defeat, 'Manual Defeat - Blocking')

      if (onGameEnd) {
        onGameEnd({
          success: false,
          finalMessage: 'No tienes suerte hoy. El destino ha cerrado todos los caminos.',
          steps: gameStep,
          completedGroups: completedOrderedGroups,
          reason: `DERROTA: Grupo ${targetGroupIndex} bloqueado con ${cardsOfCorrectValue} cartas`
        })
      }
    }, 3000)
  }

  // Función para verificar condiciones después de colocar carta ordenada
  const checkPostPlacementConditions = (targetGroupIndex) => {
    // Verificar si el grupo de destino tiene cartas para la siguiente ronda
    const nextActiveGroup = groups[targetGroupIndex]
    if (nextActiveGroup.length === 0) {
      handleDefeat('no-cards-in-target', targetGroupIndex)
      return true
    }

    // Verificar victoria completa
    const currentOrderedCount = (orderedCards[targetGroupIndex]?.length || 0) + 1
    if (currentOrderedCount === 4) {
      let totalOrderedCards = 0
      let allGroupsComplete = true

      orderedCards.forEach((orderedGroup, index) => {
        const expectedCount = (index === targetGroupIndex) ? currentOrderedCount : orderedGroup.length
        totalOrderedCards += expectedCount

        if (expectedCount < 4) {
          allGroupsComplete = false
        }
      })

      if (allGroupsComplete && totalOrderedCards === 52) {
        handleVictory()
        return true
      }
    }

    return false
  }

  // Función para manejar victoria en modo manual
  const handleVictory = () => {
    setTimeout(() => {
      setCurrentPhase('finished')
      playSound(victory, 'Manual Victory')

      if (onGameEnd) {
        onGameEnd({
          success: true,
          finalMessage: '¡Felicidades! Has logrado el orden perfecto. La suerte te sonríe.',
          steps: gameStep + 1,
          completedGroups: 13,
          reason: 'Todos los grupos completados correctamente'
        })
      }
    }, 1000)
  }

  // Función para manejar derrota en modo manual
  const handleDefeat = (reason, targetGroupIndex = null) => {
    const completedOrderedGroups = orderedCards.filter(group => group.length === 4).length

    setTimeout(() => {
      setCurrentPhase('finished')
      playSound(defeat, 'Manual Defeat')

      let finalMessage = 'No tienes suerte hoy.'
      let reasonText = reason

      if (reason === 'no-cards-in-target') {
        finalMessage = 'No tienes suerte hoy. El grupo de destino se quedó sin cartas para revelar.'
        reasonText = `DERROTA: Grupo ${targetGroupIndex} sin cartas para revelar tras colocar carta ordenada`
      }

      if (onGameEnd) {
        onGameEnd({
          success: false,
          finalMessage,
          steps: gameStep + 1,
          completedGroups: completedOrderedGroups,
          reason: reasonText
        })
      }
    }, 1000)
  }

  // Función para resetear estados manuales
  const resetManualStates = () => {
    setManualRevealedCard(null)
    setWaitingForPlacement(false)
    setWaitingForReveal(true)
  }

  // Función para inicializar modo manual
  const initializeManualMode = () => {
    setAllowedGroups(new Set([0])) // Solo grupo central habilitado
    setWaitingForReveal(true)
    setWaitingForPlacement(false)
    setManualRevealedCard(null)
    console.log('Modo manual iniciado. Solo el grupo central está habilitado.')
  }

  return {
    // Estados
    waitingForReveal,
    waitingForPlacement,
    allowedGroups,
    manualRevealedCard,
    
    // Funciones
    handleManualGroupClick,
    initializeManualMode,
    resetManualStates,
    
    // Setters (para control externo si es necesario)
    setWaitingForReveal,
    setWaitingForPlacement,
    setAllowedGroups,
    setManualRevealedCard
  }
}
