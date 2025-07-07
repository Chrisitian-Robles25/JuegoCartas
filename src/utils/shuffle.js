// Crea un mazo de 52 cartas estándar
export const createDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const deck = [];

  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({
        id: `${suit}-${value}`,
        suit,
        value,
        display: value === 1 ? 'A' : value === 11 ? 'J' : value === 12 ? 'Q' : value === 13 ? 'K' : value.toString(),
        faceUp: false
      });
    });
  });

  return deck;
};

// Barajado realista tipo casino (múltiples técnicas)
export const casinoShuffle = (deck) => {
  let shuffledDeck = [...deck];

  // 1. Barajado Riffle (mezcla en cascada)
  for (let i = 0; i < 3; i++) {
    shuffledDeck = riffleShuffle(shuffledDeck);
  }

  // 2. Barajado Overhand (mezcla por montones)
  for (let i = 0; i < 2; i++) {
    shuffledDeck = overhandShuffle(shuffledDeck);
  }

  // 3. Corte final
  shuffledDeck = cutDeck(shuffledDeck);

  return shuffledDeck;
};

// Simulación de Riffle Shuffle (mezcla en cascada)
const riffleShuffle = (deck) => {
  const mid = Math.floor(deck.length / 2);
  const leftHalf = deck.slice(0, mid);
  const rightHalf = deck.slice(mid);
  const result = [];

  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < leftHalf.length || rightIndex < rightHalf.length) {
    // Simulación de imperfección humana en el riffle
    const leftChance = 0.5 + (Math.random() - 0.5) * 0.3;

    if (leftIndex < leftHalf.length && (rightIndex >= rightHalf.length || Math.random() < leftChance)) {
      result.push(leftHalf[leftIndex]);
      leftIndex++;
    } else if (rightIndex < rightHalf.length) {
      result.push(rightHalf[rightIndex]);
      rightIndex++;
    }
  }

  return result;
};

// Simulación de Overhand Shuffle (mezcla por montones)
const overhandShuffle = (deck) => {
  const result = [];
  let remaining = [...deck];

  while (remaining.length > 0) {
    // Toma un montón pequeño de cartas (1-6 cartas)
    const chunkSize = Math.floor(Math.random() * 6) + 1;
    const chunk = remaining.splice(0, Math.min(chunkSize, remaining.length));

    // Las coloca encima del montón resultado
    result.unshift(...chunk);
  }

  return result;
};

// Corte del mazo
const cutDeck = (deck) => {
  const cutPoint = Math.floor(Math.random() * (deck.length * 0.4)) + Math.floor(deck.length * 0.3);
  return [...deck.slice(cutPoint), ...deck.slice(0, cutPoint)];
};

// Distribución en 13 grupos de 4 cartas
export const distributeCards = (shuffledDeck) => {
  const groups = Array.from({ length: 13 }, () => []);

  shuffledDeck.forEach((card, index) => {
    const groupIndex = index % 13;
    groups[groupIndex].push(card);
  });

  return groups;
};

// Función para obtener el valor efectivo de una carta para el juego
export const getCardGameValue = (card) => {
  // As = 1, figuras mantienen sus valores, pero K = 13 va al grupo central
  return card.value === 13 ? 0 : card.value; // Rey va al grupo 0 (que será el grupo 13/central)
};

export const isGameWon = (groups) => {
  return groups.every((group, index) => {
    if (group.length !== 4) return false;

    const expectedValue = index === 0 ? 13 : index; // Grupo 0 es para Reyes (13)
    return group.every(card =>
      index === 0 ? card.value === 13 : card.value === expectedValue
    );
  });
};
