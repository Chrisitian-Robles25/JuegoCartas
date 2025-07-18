import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import OracleMessages from './OracleMessages'
import { createDeck, casinoShuffle, distributeCards, isGameWon } from '../utils/shuffle'
import { frasesFinales, getRandomPhrase } from '../utils/oraclePhrases'

const GameBoard = ({ playerQuestion, onGameEnd, onBackToIntro, gameMode = 'auto' }) => {
  const [groups, setGroups] = useState(Array.from({ length: 13 }, () => []))
  const [currentPhase, setCurrentPhase] = useState('shuffling') // 'shuffling', 'distributing', 'playing', 'checking', 'finished'
  const [movingCard, setMovingCard] = useState(null)
  const [gameStep, setGameStep] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [completedGroups, setCompletedGroups] = useState(new Set())
  const [deck, setDeck] = useState([])
  const [shuffleAnimation, setShuffleAnimation] = useState(false)
  const [currentGroup, setCurrentGroup] = useState(0) // Grupo actual desde donde se toma la carta
  const [revealedCard, setRevealedCard] = useState(null) // Carta actualmente revelada (sin afectar grupos)
  const [revealingPosition, setRevealingPosition] = useState(null) // Posición de la carta siendo revelada
  const [revealingGroups, setRevealingGroups] = useState(new Set()) // Grupos en proceso de revelación
  const [orderedCards, setOrderedCards] = useState(Array.from({ length: 13 }, () => [])) // Cartas ordenadas por grupo

  // Estados específicos para modo manual
  const [isManualMode, setIsManualMode] = useState(gameMode === 'manual')
  const [waitingForReveal, setWaitingForReveal] = useState(false) // Esperando que usuario revele carta
  const [waitingForPlacement, setWaitingForPlacement] = useState(false) // Esperando que usuario coloque carta
  const [allowedGroups, setAllowedGroups] = useState(new Set()) // Grupos que el usuario puede tocar
  const [manualRevealedCard, setManualRevealedCard] = useState(null) // Carta revelada en modo manual

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

  // Inicializar el juego
  useEffect(() => {
    startGame()
  }, [])
  const startGame = async () => {
    setCurrentPhase('shuffling')
    setGameStep(0)
    setCompletedGroups(new Set())
    setCurrentGroup(0) // Empezar desde el grupo central
    setRevealedCard(null)
    setRevealingPosition(null)
    setRevealingGroups(new Set()) // Resetear grupos en revelación
    setOrderedCards(Array.from({ length: 13 }, () => [])) // Resetear cartas ordenadas

    // Resetear estados de modo manual
    setWaitingForReveal(false)
    setWaitingForPlacement(false)
    setAllowedGroups(new Set())
    setManualRevealedCard(null)

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

    // 4. Distribuir cartas gradualmente (todas boca abajo)
    const distributedGroups = distributeCards(shuffledDeck)

    // Marcar todas las cartas como boca abajo inicialmente
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
      // Modo manual: habilitar solo el grupo central (Rey/13)
      setAllowedGroups(new Set([0]))
      setWaitingForReveal(true)
      console.log('Modo manual iniciado. Solo el grupo central está habilitado.')
    } else {
      // Modo automático: comenzar el juego automático
      setTimeout(() => {
        setIsAutoPlaying(true)
      }, 1000)
    }
  }
  // Lógica principal del juego automático
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
          setIsAutoPlaying(false)
          setCurrentPhase('finished')

          // Verificar si REALMENTE todas las cartas están ordenadas correctamente (52 cartas)
          let allGroupsComplete = true
          let totalOrderedCards = 0
          let completedOrderedGroups = 0

          orderedCards.forEach((orderedGroup, index) => {
            totalOrderedCards += orderedGroup.length
            if (orderedGroup.length === 4) {
              completedOrderedGroups++
            } else if (orderedGroup.length < 4) {
              allGroupsComplete = false
            }
          })

          // Solo es victoria si TODAS las 52 cartas están ordenadas en sus grupos correctos
          const won = allGroupsComplete && totalOrderedCards === 52

          console.log(`Fin del juego - Sin cartas restantes. Grupos ordenados completos: ${completedOrderedGroups}/13, Total ordenadas: ${totalOrderedCards}/52`)

          const finalMessage = won
            ? '¡Felicidades! Has logrado el orden perfecto. La suerte te sonríe.'
            : 'No tienes suerte hoy. Las cartas no encontraron su lugar correcto.'

          if (onGameEnd) {
            onGameEnd({
              success: won,
              finalMessage: finalMessage,
              steps: gameStep,
              completedGroups: completedOrderedGroups, // Usar el conteo real de grupos ordenados
              reason: won ? 'Todas las cartas ordenadas correctamente' : 'Sin cartas restantes pero orden incompleto'
            })
          }
          return
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
          // Esto no debería pasar si el conteo anterior es correcto
          console.error('Error: No se encontró grupo con cartas pero totalCardsRemaining > 0')

          // Contar grupos ordenados correctamente
          let completedOrderedGroups = 0
          orderedCards.forEach((orderedGroup) => {
            if (orderedGroup.length === 4) {
              completedOrderedGroups++
            }
          })

          setIsAutoPlaying(false)
          setCurrentPhase('finished')

          if (onGameEnd) {
            onGameEnd({
              success: false,
              finalMessage: 'Error en el juego. No tienes suerte hoy.',
              steps: gameStep,
              completedGroups: completedOrderedGroups, // Usar el conteo real de grupos ordenados
              reason: 'Error: Sin grupos válidos'
            })
          }
        }
        return
      }

      // 1. Revelar la carta superior del grupo actual
      const topCard = currentGroupCards[currentGroupCards.length - 1]

      // VERIFICAR REGLA DE BLOQUEO ANTES DE REVELAR
      // Determinar el grupo de destino de esta carta
      let targetGroupIndex
      if (topCard.value === 13) {
        targetGroupIndex = 0 // Rey va al grupo central (índice 0)
      } else if (topCard.value === 1) {
        targetGroupIndex = 1 // As va al grupo 1
      } else {
        targetGroupIndex = topCard.value // Otros van a su número correspondiente
      }

      // Verificar si el grupo de destino ya tiene 3 cartas del valor correcto
      const targetGroup = groups[targetGroupIndex]
      const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
      const cardsOfCorrectValue = targetGroup.filter(card => card.value === expectedValue).length

      if (cardsOfCorrectValue >= 3 && topCard.value === expectedValue) {
        // BLOQUEO: El grupo ya tiene 3 cartas del valor correcto y la próxima carta es del mismo valor
        console.log(`BLOQUEO DETECTADO: Grupo ${targetGroupIndex} ya tiene ${cardsOfCorrectValue} cartas del valor ${expectedValue} y la próxima carta también es ${topCard.value}`)

        // Revelar la carta problemática SOLO en el estado de revelación, sin modificar grupos
        setRevealedCard({ ...topCard, faceUp: true })
        setRevealingPosition({ groupIndex: currentGroup, cardIndex: currentGroupCards.length - 1 })

        await new Promise(resolve => setTimeout(resolve, 3000))

        // TERMINAR EL JUEGO INMEDIATAMENTE - DETECCIÓN DE DERROTA
        setIsAutoPlaying(false)
        setCurrentPhase('finished')

        // Contar grupos ordenados correctamente
        let completedOrderedGroups = 0
        orderedCards.forEach((orderedGroup) => {
          if (orderedGroup.length === 4) {
            completedOrderedGroups++
          }
        })

        const finalMessage = 'No tienes suerte hoy. El destino ha cerrado todos los caminos.'

        if (onGameEnd) {
          onGameEnd({
            success: false,
            finalMessage: finalMessage,
            steps: gameStep,
            completedGroups: completedOrderedGroups, // Usar el conteo real de grupos ordenados
            reason: `DERROTA: Grupo ${targetGroupIndex} bloqueado con ${cardsOfCorrectValue} cartas del valor ${expectedValue}`
          })
        }
        return
      }

      // Solo continuar si el juego sigue activo
      if (currentPhase !== 'playing' || !isAutoPlaying) {
        return
      }

      // Revelar la carta SOLO en el estado de revelación, sin modificar grupos
      setRevealedCard({ ...topCard, faceUp: true })
      setRevealingPosition({ groupIndex: currentGroup, cardIndex: currentGroupCards.length - 1 })

      console.log(`Grupo ${currentGroup}: Tomando carta ${topCard.display} de ${topCard.suit} (carta ${currentGroupCards.length} de ${currentGroupCards.length})`)

      // Determinar si la carta va a su lugar correcto ANTES de revelarla
      const isCardGoingToCorrectPlace = topCard.value === expectedValue

      // Pausa para mostrar la carta revelada
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log(`Moviendo carta ${topCard.display} de ${topCard.suit} del grupo ${currentGroup} al grupo ${targetGroupIndex}`)

      // 3. Marcar la carta como en movimiento
      setMovingCard(topCard)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 4. Mover la carta según su destino

      if (isCardGoingToCorrectPlace) {
        // La carta va a su lugar correcto, agregarla a las cartas ordenadas

        // OPERACIÓN ATÓMICA: Hacer todos los cambios a la vez para evitar duplicación
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

        console.log(`Carta ${topCard.display} colocada correctamente en grupo ${targetGroupIndex}`)
      } else {
        // La carta no va a su lugar correcto, agregarla al grupo normal

        // Primero remover del grupo actual
        setGroups(prevGroups => {
          const newGroups = [...prevGroups]
          newGroups[currentGroup] = newGroups[currentGroup].slice(0, -1)
          return newGroups
        })

        // Luego agregar al grupo destino
        setGroups(prevGroups => {
          const newGroups = [...prevGroups]
          // Agregar al INICIO del grupo destino (abajo de la pila física)
          newGroups[targetGroupIndex] = [topCard, ...newGroups[targetGroupIndex]]
          return newGroups
        })

        console.log(`Carta ${topCard.display} colocada temporalmente en grupo ${targetGroupIndex}`)
      }

      setMovingCard(null)
      setRevealedCard(null)
      setRevealingPosition(null)
      setGameStep(prev => prev + 1)

      // 5. VERIFICACIÓN CRÍTICA: Si la carta fue ordenada, verificar inmediatamente si el grupo de destino tiene cartas
      if (isCardGoingToCorrectPlace) {
        // El grupo de destino ahora será el grupo activo para la siguiente ronda
        const nextActiveGroup = groups[targetGroupIndex]

        console.log(`Carta ordenada colocada. Verificando grupo de destino ${targetGroupIndex} para siguiente movimiento...`)
        console.log(`Cartas restantes en grupo ${targetGroupIndex}:`, nextActiveGroup.length)

        if (nextActiveGroup.length === 0) {
          // DERROTA: No hay cartas para revelar en el grupo de destino
          console.log(`DERROTA: Grupo ${targetGroupIndex} no tiene cartas para revelar después de colocar carta ordenada`)

          // Contar grupos ordenados correctamente
          let completedOrderedGroups = 0
          orderedCards.forEach((orderedGroup, index) => {
            const expectedCount = (index === targetGroupIndex) ? (orderedGroup.length + 1) : orderedGroup.length
            if (expectedCount === 4) {
              completedOrderedGroups++
            }
          })

          setIsAutoPlaying(false)
          setCurrentPhase('finished')

          const finalMessage = 'No tienes suerte hoy. El grupo de destino se quedó sin cartas para revelar.'

          if (onGameEnd) {
            onGameEnd({
              success: false,
              finalMessage: finalMessage,
              steps: gameStep + 1,
              completedGroups: completedOrderedGroups, // Usar el conteo real de grupos ordenados
              reason: `DERROTA: Grupo ${targetGroupIndex} sin cartas para revelar tras colocar carta ordenada`
            })
          }
          return
        }

        // Solo verificar victoria si el grupo está completo Y tiene todas las cartas del juego ordenadas
        const currentOrderedCount = (orderedCards[targetGroupIndex]?.length || 0) + 1

        if (currentOrderedCount === 4) {
          console.log(`Grupo ${targetGroupIndex} completado con 4 cartas ordenadas`)

          // Verificar si TODOS los grupos están completos (52 cartas ordenadas en total)
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
            // VICTORIA VERDADERA: Todos los grupos completados
            console.log(`VICTORIA VERDADERA: Todos los grupos completados. Total de cartas ordenadas: ${totalOrderedCards}`)

            setIsAutoPlaying(false)
            setCurrentPhase('finished')
            const finalMessage = '¡Felicidades! Has logrado el orden perfecto. La suerte te sonríe.'

            if (onGameEnd) {
              onGameEnd({
                success: true,
                finalMessage: finalMessage,
                steps: gameStep + 1,
                completedGroups: 13, // Todos los grupos
                reason: 'Todos los grupos completados correctamente'
              })
            }
            return
          }
        }
      }

      // 6. Cambiar al grupo de destino para la siguiente iteración
      setCurrentGroup(targetGroupIndex)

      // 6. Verificar si algún grupo se completó
      const newCompletedGroups = new Set()
      groups.forEach((group, index) => {
        if (group.length === 4) {
          const expectedValue = index === 0 ? 13 : index
          const isComplete = group.every(card =>
            index === 0 ? card.value === 13 : card.value === expectedValue
          )
          if (isComplete) {
            newCompletedGroups.add(index)
            // Si es un grupo recién completado, revelar todas sus cartas
            if (!completedGroups.has(index)) {
              revealCompletedGroup(index)
            }
          }
        }
      })
      setCompletedGroups(newCompletedGroups)

      // 7. Pausa antes del siguiente movimiento (solo si el juego sigue activo)
      setTimeout(() => {
        // Verificar si el juego sigue activo antes de continuar
        if (currentPhase === 'playing' && isAutoPlaying) {
          // El juego continúa hasta encontrar bloqueo o completar todas las cartas
        }
      }, 800)
    }

    // Solo ejecutar el próximo paso si el juego sigue activo
    if (currentPhase === 'playing' && isAutoPlaying) {
      const timer = setTimeout(playStep, 2000)
      return () => clearTimeout(timer)
    }
  }, [isAutoPlaying, groups, gameStep, currentPhase, currentGroup, onGameEnd])

  // Funciones para modo manual
  const handleManualGroupClick = (groupIndex) => {
    if (!isManualMode || !allowedGroups.has(groupIndex)) return

    if (waitingForReveal) {
      // Revelar carta del grupo clickeado
      handleManualReveal(groupIndex)
    } else if (waitingForPlacement && manualRevealedCard) {
      // Colocar carta en el grupo clickeado
      handleManualPlacement(groupIndex)
    }
  }

  const handleManualReveal = (groupIndex) => {
    const group = groups[groupIndex]
    if (!group || group.length === 0) return

    const topCard = group[group.length - 1]

    // Verificar bloqueo antes de revelar
    let targetGroupIndex
    if (topCard.value === 13) {
      targetGroupIndex = 0
    } else if (topCard.value === 1) {
      targetGroupIndex = 1
    } else {
      targetGroupIndex = topCard.value
    }

    const targetGroup = groups[targetGroupIndex]
    const expectedValue = targetGroupIndex === 0 ? 13 : targetGroupIndex
    const cardsOfCorrectValue = targetGroup.filter(card => card.value === expectedValue).length

    if (cardsOfCorrectValue >= 3 && topCard.value === expectedValue) {
      // BLOQUEO detectado
      console.log(`BLOQUEO DETECTADO en modo manual: Grupo ${targetGroupIndex} ya tiene ${cardsOfCorrectValue} cartas del valor ${expectedValue}`)

      setRevealedCard({ ...topCard, faceUp: true })
      setRevealingPosition({ groupIndex, cardIndex: group.length - 1 })

      setTimeout(() => {
        let completedOrderedGroups = 0
        orderedCards.forEach((orderedGroup) => {
          if (orderedGroup.length === 4) {
            completedOrderedGroups++
          }
        })

        setCurrentPhase('finished')
        if (onGameEnd) {
          onGameEnd({
            success: false,
            finalMessage: 'No tienes suerte hoy. El destino ha cerrado todos los caminos.',
            steps: gameStep,
            completedGroups: completedOrderedGroups,
            reason: `DERROTA: Grupo ${targetGroupIndex} bloqueado con ${cardsOfCorrectValue} cartas del valor ${expectedValue}`
          })
        }
      }, 3000)
      return
    }

    // Revelar carta
    setManualRevealedCard({ ...topCard, faceUp: true })
    setWaitingForReveal(false)
    setWaitingForPlacement(true)

    // Determinar grupos válidos para colocación
    const validGroups = new Set([targetGroupIndex])

    // Si la carta va a su lugar correcto, también permitir el área de ordenadas
    const isCardGoingToCorrectPlace = topCard.value === expectedValue
    if (isCardGoingToCorrectPlace) {
      validGroups.add(-1) // -1 representa el área de cartas ordenadas
    }

    setAllowedGroups(validGroups)
    setCurrentGroup(groupIndex) // Recordar de dónde viene la carta

    console.log(`Carta revelada: ${topCard.display} de ${topCard.suit}. Colocar en grupo ${targetGroupIndex}`)
  }

  const handleManualPlacement = (targetGroupIndex) => {
    if (!manualRevealedCard) return

    const sourceGroup = groups[currentGroup]
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

      // Verificar si el grupo de destino tiene cartas para la siguiente ronda
      const nextActiveGroup = groups[targetGroupIndex]
      if (nextActiveGroup.length === 0) {
        // Derrota: grupo sin cartas
        let completedOrderedGroups = 0
        orderedCards.forEach((orderedGroup, index) => {
          const expectedCount = (index === targetGroupIndex) ? (orderedGroup.length + 1) : orderedGroup.length
          if (expectedCount === 4) {
            completedOrderedGroups++
          }
        })

        setTimeout(() => {
          setCurrentPhase('finished')
          if (onGameEnd) {
            onGameEnd({
              success: false,
              finalMessage: 'No tienes suerte hoy. El grupo de destino se quedó sin cartas para revelar.',
              steps: gameStep + 1,
              completedGroups: completedOrderedGroups,
              reason: `DERROTA: Grupo ${targetGroupIndex} sin cartas para revelar tras colocar carta ordenada`
            })
          }
        }, 1000)
        return
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
          setTimeout(() => {
            setCurrentPhase('finished')
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
          return
        }
      }

      // Continuar con el grupo de destino
      setCurrentGroup(targetGroupIndex)
    } else {
      // Colocar en grupo normal
      setGroups(prevGroups => {
        const newGroups = [...prevGroups]
        newGroups[targetGroupIndex] = [topCard, ...newGroups[targetGroupIndex]]
        return newGroups
      })

      // Continuar con el grupo de destino
      setCurrentGroup(targetGroupIndex)
    }

    // Resetear estados manuales
    setManualRevealedCard(null)
    setWaitingForPlacement(false)
    setWaitingForReveal(true)
    setAllowedGroups(new Set([targetGroupIndex])) // Solo permitir el nuevo grupo activo
    setGameStep(prev => prev + 1)

    console.log(`Carta colocada. Siguiente grupo activo: ${targetGroupIndex}`)
  }

  // Posiciones de los grupos en círculo (con más separación horizontal)
  const getGroupPosition = (index) => {
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

  const renderGroup = (group, index) => {
    const position = getGroupPosition(index)
    const isCompleted = completedGroups.has(index)
    const isCentral = index === 0
    const isRevealing = revealingGroups.has(index)
    const ordered = orderedCards[index] || []

    // Estados para modo manual
    const isClickable = isManualMode && allowedGroups.has(index) && currentPhase === 'playing'
    const isCurrentGroupHighlighted = index === currentGroup && currentPhase === 'playing'
    const hasCardsToReveal = group.length > 0

    return (
      <motion.div
        key={index}
        className={`card-group ${isCentral ? 'central' : ''} ${isCompleted ? 'complete' : ''}`}
        style={{
          ...position,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
          border: isCurrentGroupHighlighted
            ? '2px solid var(--gold-light)'
            : isClickable
              ? '2px solid var(--gold)'
              : '1px solid transparent',
          borderRadius: '8px',
          padding: '5px',
          cursor: isClickable ? 'pointer' : 'default',
          background: isClickable ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
          transition: 'all 0.3s ease'
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: isCompleted ? [
            "0 0 15px var(--gold)",
            "0 0 30px var(--gold)",
            "0 0 15px var(--gold)"
          ] : isClickable ? [
            "0 0 10px var(--gold)",
            "0 0 20px var(--gold)",
            "0 0 10px var(--gold)"
          ] : undefined
        }}
        transition={{
          delay: index * 0.1,
          boxShadow: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        onClick={() => isClickable && handleManualGroupClick(index)}
        whileHover={isClickable ? { scale: 1.05 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
      >
        {/* Cartas ordenadas (lado izquierdo) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          minWidth: '60px'
        }}>
          <div style={{
            fontSize: '10px',
            color: 'var(--gold)',
            opacity: 0.8,
            marginBottom: '2px'
          }}>
            Ordenadas: {ordered.length}/4
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            position: 'relative',
            minHeight: '40px'
          }}>
            {ordered.map((card, cardIndex) => (
              <motion.div
                key={`ordered-${card.id}-${cardIndex}`}
                style={{
                  position: 'absolute',
                  top: `${cardIndex * -2}px`,
                  zIndex: cardIndex + 1,
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 0.6
                }}
                transition={{
                  delay: cardIndex * 0.1,
                  duration: 0.3
                }}
              >
                <Card
                  card={card}
                  isFlipped={true}
                  className="ordered-card"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Grupo principal (centro) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px'
        }}>
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
            flexDirection: (isCompleted && !isRevealing) ? 'row' : 'column',
            gap: (isCompleted && !isRevealing) ? '5px' : '2px',
            position: 'relative',
            minHeight: '40px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {group.map((card, cardIndex) => (
              <motion.div
                key={`${card.id}-${cardIndex}`}
                style={{
                  position: (isCompleted && !isRevealing) ? 'relative' : 'absolute',
                  // Para mostrar el orden correcto: las cartas más recientes (índice bajo) van abajo
                  top: (isCompleted && !isRevealing) ? '0px' : `${(group.length - 1 - cardIndex) * -3}px`,
                  zIndex: cardIndex + 1,
                }}
                initial={{ opacity: 0, y: -50 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: movingCard?.id === card.id ? 1.2 : ((isCompleted && !isRevealing) ? 0.8 : 1),
                  rotateY: (isCompleted && !isRevealing) ? [0, 360, 0] : 0,
                  // Efecto abanico para grupos completados
                  rotate: (isCompleted && !isRevealing) ? (cardIndex - 1.5) * 15 : 0
                }}
                transition={{
                  delay: cardIndex * 0.1,
                  duration: movingCard?.id === card.id ? 0.8 : 0.3,
                  rotateY: { duration: 2, delay: cardIndex * 0.2 },
                  rotate: { duration: 0.5, delay: cardIndex * 0.1 }
                }}
              >
                <Card
                  card={card}
                  isFlipped={card.faceUp || false} // Mostrar solo si está boca arriba
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
              marginTop: '5px',
              color: index === currentGroup && currentPhase === 'playing' ? 'var(--gold-light)' : 'var(--gold)'
            }}
          >
            {group.length}/4 {index === currentGroup && currentPhase === 'playing' && '← ACTUAL'}
            {isCompleted && ' ✓'}
          </motion.div>
        </div>
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

      {/* Carta revelada como superposición */}
      {(revealedCard && revealingPosition) || (isManualMode && manualRevealedCard) ? (
        <motion.div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '15px',
            border: '2px solid var(--gold)',
            boxShadow: '0 0 30px var(--gold)'
          }}
          initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
          animate={{
            opacity: 1,
            scale: 1.2,
            rotateY: 0,
            boxShadow: [
              '0 0 30px var(--gold)',
              '0 0 50px var(--gold)',
              '0 0 30px var(--gold)'
            ]
          }}
          transition={{
            duration: 0.8,
            boxShadow: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <Card
            card={isManualMode && manualRevealedCard ? manualRevealedCard : revealedCard}
            isFlipped={true}
            className="revealed-card"
          />
          <motion.div
            style={{
              textAlign: 'center',
              marginTop: '10px',
              color: 'var(--gold)',
              fontSize: '16px',
              fontFamily: 'var(--font-decorative)'
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {isManualMode ? 'Carta Revelada - Elige Destino' : 'Carta Revelada'}
          </motion.div>
        </motion.div>
      ) : null}

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
      {isManualMode && currentPhase === 'playing' && (
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
      )}
    </div>
  )
}

export default GameBoard
