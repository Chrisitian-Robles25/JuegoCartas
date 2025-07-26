import { useEffect } from 'react'

/**
 * Hook personalizado para manejar la lógica del juego automático
 */
export const useAutoGame = ({
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
}) => {
  useEffect(() => {
    if (!isAutoPlaying || currentPhase !== 'playing') {
      console.log('Efecto del juego cancelado - isAutoPlaying:', isAutoPlaying, 'currentPhase:', currentPhase)
      return
    }

    const playStep = async () => {
      // VERIFICACIÓN CRÍTICA: Detener inmediatamente si el juego ya no está activo
      if (currentPhase !== 'playing' || !isAutoPlaying) {
        console.log('Juego detenido en playStep - Fase:', currentPhase, 'AutoPlaying:', isAutoPlaying)
        return
      }

      // Verificar si el grupo actual tiene cartas
      const currentGroupCards = groups[currentGroup]

      if (!currentGroupCards || currentGroupCards.length === 0) {
        // Si el grupo actual está vacío, buscar el siguiente grupo con cartas
        let nextGroup = currentGroup
        let foundGroup = false
        let totalCardsRemaining = 0

        // Contar total de cartas restantes en todos los grupos
        groups.forEach(group => {
          totalCardsRemaining += group.length
        })

        if (totalCardsRemaining === 0) {
          // No quedan cartas en ningún grupo - fin del juego
          return await handleGameEnd('no-cards-remaining')
        }

        // Buscar el siguiente grupo con cartas
        for (let i = 0; i < 13; i++) {
          nextGroup = (nextGroup + 1) % 13
          if (groups[nextGroup] && groups[nextGroup].length > 0) {
            setCurrentGroup(nextGroup)
            foundGroup = true
            break
          }
        }

        if (!foundGroup) {
          return await handleGameEnd('no-valid-groups')
        }
        return
      }

      // 1. Revelar la carta superior del grupo actual
      const topCard = currentGroupCards[currentGroupCards.length - 1]

      // Determinar el grupo de destino de esta carta
      const targetGroupIndex = getTargetGroupIndex(topCard)

      // Verificar si hay bloqueo antes de revelar
      if (await checkForBlocking(topCard, targetGroupIndex)) {
        return
      }

      // Solo continuar si el juego sigue activo
      if (currentPhase !== 'playing' || !isAutoPlaying) {
        return
      }

      // Revelar la carta
      await revealCard(topCard)

      // Determinar si la carta va a su lugar correcto
      const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
      const isCardGoingToCorrectPlace = topCard.value === expectedValue

      // Pausa para mostrar la carta revelada
      await new Promise(resolve => setTimeout(resolve, getTimings().cardRevealDelay))

      console.log(`Moviendo carta ${topCard.display} de ${topCard.suit} del grupo ${currentGroup} al grupo ${targetGroupIndex}`)

      // Marcar la carta como en movimiento
      setMovingCard(topCard)
      await new Promise(resolve => setTimeout(resolve, getTimings().movementDelay))

      // Mover la carta según su destino
      await moveCard(topCard, targetGroupIndex, isCardGoingToCorrectPlace)

      // Verificar condiciones de victoria/derrota después del movimiento
      if (isCardGoingToCorrectPlace) {
        const result = await checkVictoryOrDefeat(targetGroupIndex, topCard)
        if (result) return
      }

      // Cambiar al grupo de destino para la siguiente iteración
      setCurrentGroup(targetGroupIndex)

      // Limpiar estados
      setMovingCard(null)
      setRevealedCard(null)
      setRevealingPosition(null)
      setGameStep(prev => prev + 1)

      // Pausa antes del siguiente movimiento
      setTimeout(() => {
        if (currentPhase === 'playing' && isAutoPlaying) {
          // El juego continúa
        }
      }, 800)
    }

    // Función para obtener el índice del grupo de destino
    const getTargetGroupIndex = (card) => {
      if (card.value === 13) {
        return 0 // Rey va al grupo central
      } else if (card.value === 1) {
        return 1 // As va al grupo 1
      } else {
        return card.value // Otros van a su número correspondiente
      }
    }

    // Función para verificar bloqueo
    const checkForBlocking = async (topCard, targetGroupIndex) => {
      const targetGroup = groups[targetGroupIndex]
      const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
      const cardsOfCorrectValue = targetGroup.filter(card => card.value === expectedValue).length

      if (cardsOfCorrectValue >= 3 && topCard.value === expectedValue) {
        console.log(`BLOQUEO DETECTADO: Grupo ${targetGroupIndex} ya tiene ${cardsOfCorrectValue} cartas del valor ${expectedValue}`)

        // Revelar la carta problemática
        setRevealedCard({ ...topCard, faceUp: true })
        setRevealingPosition({ groupIndex: currentGroup, cardIndex: groups[currentGroup].length - 1 })

        playSound(cardReveal, 'Card Reveal - Blocking')
        await new Promise(resolve => setTimeout(resolve, getTimings().blockingDelay))

        // Terminar el juego - derrota
        await handleGameEnd('blocking', targetGroupIndex, cardsOfCorrectValue, expectedValue)
        return true
      }
      return false
    }

    // Función para revelar carta
    const revealCard = async (topCard) => {
      setRevealedCard({ ...topCard, faceUp: true })
      setRevealingPosition({ 
        groupIndex: currentGroup, 
        cardIndex: groups[currentGroup].length - 1 
      })

      playSound(cardReveal, 'Card Reveal - Auto Game')
      console.log(`Grupo ${currentGroup}: Tomando carta ${topCard.display} de ${topCard.suit}`)
    }

    // Función para mover carta
    const moveCard = async (topCard, targetGroupIndex, isCardGoingToCorrectPlace) => {
      if (isCardGoingToCorrectPlace) {
        // La carta va a su lugar correcto
        setGroups(prevGroups => {
          const newGroups = [...prevGroups]
          newGroups[currentGroup] = newGroups[currentGroup].slice(0, -1)
          return newGroups
        })

        setOrderedCards(prevOrdered => {
          const newOrdered = [...prevOrdered]
          newOrdered[targetGroupIndex] = [...newOrdered[targetGroupIndex], topCard]
          console.log(`Cartas ordenadas en grupo ${targetGroupIndex}:`, newOrdered[targetGroupIndex].length, 'de 4')
          return newOrdered
        })

        playSound(cardOrdered, 'Card Ordered')
        console.log(`Carta ${topCard.display} colocada correctamente en grupo ${targetGroupIndex}`)
      } else {
        // La carta no va a su lugar correcto
        setGroups(prevGroups => {
          const newGroups = [...prevGroups]
          newGroups[currentGroup] = newGroups[currentGroup].slice(0, -1)
          return newGroups
        })

        setGroups(prevGroups => {
          const newGroups = [...prevGroups]
          newGroups[targetGroupIndex] = [topCard, ...newGroups[targetGroupIndex]]
          return newGroups
        })

        console.log(`Carta ${topCard.display} colocada temporalmente en grupo ${targetGroupIndex}`)
      }
    }

    // Función para verificar victoria o derrota después de ordenar carta
    const checkVictoryOrDefeat = async (targetGroupIndex, topCard) => {
      // Verificar si el grupo de destino tiene cartas para la siguiente ronda
      const nextActiveGroup = groups[targetGroupIndex]

      if (nextActiveGroup.length === 0) {
        console.log(`DERROTA: Grupo ${targetGroupIndex} no tiene cartas para revelar después de colocar carta ordenada`)
        await handleGameEnd('no-cards-in-target', targetGroupIndex)
        return true
      }

      // Verificar victoria completa
      const currentOrderedCount = (orderedCards[targetGroupIndex]?.length || 0) + 1

      if (currentOrderedCount === 4) {
        console.log(`Grupo ${targetGroupIndex} completado con 4 cartas ordenadas`)

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
          console.log(`VICTORIA VERDADERA: Todos los grupos completados. Total: ${totalOrderedCards}`)
          await handleGameEnd('victory')
          return true
        }
      }

      return false
    }

    // Función unificada para manejar el fin del juego
    const handleGameEnd = async (reason, ...args) => {
      setIsAutoPlaying(false)
      setCurrentPhase('finished')

      let completedOrderedGroups = 0
      orderedCards.forEach((orderedGroup) => {
        if (orderedGroup.length === 4) {
          completedOrderedGroups++
        }
      })

      let gameResult = {
        success: false,
        finalMessage: 'No tienes suerte hoy.',
        steps: gameStep,
        completedGroups: completedOrderedGroups,
        reason: reason
      }

      switch (reason) {
        case 'victory':
          gameResult = {
            success: true,
            finalMessage: '¡Felicidades! Has logrado el orden perfecto. La suerte te sonríe.',
            steps: gameStep + 1,
            completedGroups: 13,
            reason: 'Todos los grupos completados correctamente'
          }
          playSound(victory, 'Victory - All Groups Complete')
          break

        case 'no-cards-remaining':
          const won = completedOrderedGroups === 13
          gameResult = {
            success: won,
            finalMessage: won 
              ? '¡Felicidades! Has logrado el orden perfecto. La suerte te sonríe.'
              : 'No tienes suerte hoy. Las cartas no encontraron su lugar correcto.',
            steps: gameStep,
            completedGroups: completedOrderedGroups,
            reason: won ? 'Todas las cartas ordenadas correctamente' : 'Sin cartas restantes pero orden incompleto'
          }
          playSound(won ? victory : defeat, won ? 'Victory - No Cards Remaining' : 'Defeat - No Cards Remaining')
          break

        case 'blocking':
          const [targetGroupIndex, cardsOfCorrectValue, expectedValue] = args
          gameResult.finalMessage = 'No tienes suerte hoy. El destino ha cerrado todos los caminos.'
          gameResult.reason = `DERROTA: Grupo ${targetGroupIndex} bloqueado con ${cardsOfCorrectValue} cartas del valor ${expectedValue}`
          playSound(defeat, 'Defeat - Blocking Game')
          break

        case 'no-cards-in-target':
          const [targetGroup] = args
          gameResult.finalMessage = 'No tienes suerte hoy. El grupo de destino se quedó sin cartas para revelar.'
          gameResult.steps = gameStep + 1
          gameResult.reason = `DERROTA: Grupo ${targetGroup} sin cartas para revelar tras colocar carta ordenada`
          playSound(defeat, 'Defeat - No Cards In Target Group')
          break

        case 'no-valid-groups':
          gameResult.finalMessage = 'Error en el juego. No tienes suerte hoy.'
          gameResult.reason = 'Error: Sin grupos válidos'
          playSound(defeat, 'Defeat - No Valid Groups')
          break
      }

      if (onGameEnd) {
        onGameEnd(gameResult)
      }
    }

    // Solo ejecutar el próximo paso si el juego sigue activo
    if (currentPhase === 'playing' && isAutoPlaying) {
      const timer = setTimeout(playStep, getTimings().stepInterval)
      return () => clearTimeout(timer)
    }
  }, [
    isAutoPlaying, 
    groups, 
    gameStep, 
    currentPhase, 
    currentGroup, 
    orderedCards,
    gameSpeed,
    onGameEnd
  ])
}
