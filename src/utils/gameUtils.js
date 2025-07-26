/**
 * Utilidades para la lógica del juego
 */

/**
 * Función para obtener tiempos basados en la velocidad del juego
 */
export const createTimingFunction = (gameSpeed) => {
  return () => {
    const speedMultiplier = gameSpeed === 1 ? 1 : 0.6 // x2 usa 60% del tiempo original
    return {
      cardRevealDelay: Math.max(1500 * speedMultiplier, 900), // Mínimo 900ms para ver bien la carta
      movementDelay: Math.max(1500 * speedMultiplier, 500),   // Mínimo 500ms
      stepInterval: Math.max(2000 * speedMultiplier, 800),     // Mínimo 800ms
      blockingDelay: Math.max(3000 * speedMultiplier, 1500)   // Mínimo 1500ms
    }
  }
}

/**
 * Función para obtener etiquetas de velocidad
 */
export const getSpeedLabel = (gameSpeed) => {
  switch (gameSpeed) {
    case 1: return '1x Normal'
    case 2: return '2x Rápido'
    default: return '1x Normal'
  }
}

/**
 * Función para obtener posiciones de los grupos en círculo
 */
export const getGroupPosition = (index) => {
  if (index === 0) {
    // Grupo central (Rey/13)
    return {
      gridColumn: '4', // Centrado en grid de 7 columnas
      gridRow: '3',
      transform: 'scale(1.1)'
    }
  }

  // Posiciones circulares para grupos 1-12 (más separados horizontalmente)
  const positions = [
    null, // índice 0 ya manejado
    { gridColumn: '4', gridRow: '1' }, // 12 o'clock (arriba centro)
    { gridColumn: '5', gridRow: '1' }, // 1 o'clock
    { gridColumn: '6', gridRow: '2' }, // 2 o'clock (más a la derecha)
    { gridColumn: '7', gridRow: '3' }, // 3 o'clock (extremo derecho)
    { gridColumn: '6', gridRow: '4' }, // 4 o'clock (más a la derecha)
    { gridColumn: '5', gridRow: '5' }, // 5 o'clock
    { gridColumn: '4', gridRow: '5' }, // 6 o'clock (abajo centro)
    { gridColumn: '3', gridRow: '5' }, // 7 o'clock
    { gridColumn: '2', gridRow: '4' }, // 8 o'clock (más a la izquierda)
    { gridColumn: '1', gridRow: '3' }, // 9 o'clock (extremo izquierdo)
    { gridColumn: '2', gridRow: '2' }, // 10 o'clock (más a la izquierda)
    { gridColumn: '3', gridRow: '1' }, // 11 o'clock
    { gridColumn: '2', gridRow: '1' }, // 11 o'clock
  ]

  return positions[index] || { gridColumn: '3', gridRow: '3' }
}

/**
 * Función para determinar el grupo de destino de una carta
 */
export const getTargetGroupIndex = (card) => {
  if (card.value === 13) {
    return 0 // Rey va al grupo central (índice 0)
  } else if (card.value === 1) {
    return 1 // As va al grupo 1
  } else {
    return card.value // Otros van a su número correspondiente
  }
}

/**
 * Función para verificar si una carta va a su lugar correcto
 */
export const isCardGoingToCorrectPlace = (card, targetGroupIndex) => {
  const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
  return card.value === expectedValue
}

/**
 * Función para contar cartas ordenadas correctamente
 */
export const countCompletedOrderedGroups = (orderedCards) => {
  return orderedCards.filter(group => group.length === 4).length
}

/**
 * Función para verificar victoria completa
 */
export const checkCompleteVictory = (orderedCards) => {
  let totalOrderedCards = 0
  let allGroupsComplete = true

  orderedCards.forEach((orderedGroup) => {
    totalOrderedCards += orderedGroup.length
    if (orderedGroup.length < 4) {
      allGroupsComplete = false
    }
  })

  return allGroupsComplete && totalOrderedCards === 52
}

/**
 * Función para contar cartas restantes en todos los grupos
 */
export const countRemainingCards = (groups) => {
  return groups.reduce((total, group) => total + group.length, 0)
}

/**
 * Función para verificar bloqueo
 */
export const checkBlocking = (topCard, targetGroup, targetGroupIndex) => {
  const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
  const cardsOfCorrectValue = targetGroup.filter(card => card.value === expectedValue).length
  
  return cardsOfCorrectValue >= 3 && topCard.value === expectedValue
}

/**
 * Función para obtener el siguiente grupo con cartas
 */
export const findNextGroupWithCards = (groups, currentGroup) => {
  let nextGroup = currentGroup
  
  for (let i = 0; i < 13; i++) {
    nextGroup = (nextGroup + 1) % 13
    if (groups[nextGroup] && groups[nextGroup].length > 0) {
      return nextGroup
    }
  }
  
  return null // No se encontró grupo con cartas
}

/**
 * Función helper para reproducir sonidos de forma segura
 */
export const createSafePlaySound = (soundEffects) => {
  return async (soundFunction, soundName) => {
    try {
      console.log(`🎵 Intentando reproducir: ${soundName}`)
      await soundFunction()
      console.log(`✅ Sonido reproducido: ${soundName}`)
    } catch (error) {
      console.log(`❌ Error al reproducir ${soundName}:`, error)
    }
  }
}

/**
 * Función para validar estado del juego
 */
export const validateGameState = (groups, orderedCards) => {
  const totalCards = countRemainingCards(groups) + orderedCards.reduce((sum, group) => sum + group.length, 0)
  
  if (totalCards !== 52) {
    console.warn(`Advertencia: Total de cartas incorrectas: ${totalCards}/52`)
    return false
  }
  
  return true
}
