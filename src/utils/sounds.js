// Generador de sonidos simples usando Web Audio API
export const createSoundEffects = () => {
  let audioContext = null;

  // Inicializar contexto de audio con interacción del usuario
  const initAudioContext = async () => {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioContext = new AudioContext();
        
        // Reanudar contexto si está suspendido
        if (audioContext.state === 'suspended') {
          try {
            await audioContext.resume();
            console.log('🎵 Audio Context reanudado');
          } catch (error) {
            console.log('Error al reanudar audio context:', error);
          }
        }
      }
    }
    return audioContext;
  };

  // Función base para crear tonos
  const playTone = async (frequency, duration, volume = 0.3, type = 'sine') => {
    const context = await initAudioContext();
    if (!context || context.state !== 'running') {
      console.log('Audio context no disponible o suspendido');
      return;
    }

    try {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.log('Error al reproducir tono:', error);
    }
  };

  // Función para crear acordes
  const playChord = async (frequencies, duration, volume = 0.2) => {
    const context = await initAudioContext();
    if (!context || context.state !== 'running') {
      console.log('Audio context no disponible para acorde');
      return;
    }

    try {
      for (const freq of frequencies) {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.setValueAtTime(freq, context.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume / frequencies.length, context.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration);
      }
    } catch (error) {
      console.log('Error al reproducir acorde:', error);
    }
  };

  return {
    // Sonido de revelación de carta (tono ascendente místico)
    cardReveal: async () => {
      console.log('🎵 Reproduciendo sonido: Card Reveal');
      try {
        await playTone(330, 0.3, 0.4); // E4 - tono más directo y audible
      } catch (error) {
        console.log('Error en cardReveal:', error);
      }
    },

    // Sonido de barajado (ruido rítmico)
    shuffle: async () => {
      console.log('🎵 Reproduciendo sonido: Shuffle');
      const context = await initAudioContext();
      if (!context) return;

      // Simular sonido de cartas mezclándose
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const frequency = 150 + Math.random() * 100;
          playTone(frequency, 0.05, 0.1, 'square');
        }, i * 80);
      }
    },

    // Sonido de carta ordenada (acorde positivo)
    cardOrdered: async () => {
      console.log('🎵 Reproduciendo sonido: Card Ordered');
      const context = await initAudioContext();
      if (!context) return;

      // Acorde mayor (C-E-G)
      await playChord([262, 330, 392], 0.4, 0.25);
    },

    // Sonido de carta colocada (tono simple)
    cardPlaced: async () => {
      console.log('🎵 Reproduciendo sonido: Card Placed');
      const context = await initAudioContext();
      if (!context) return;

      await playTone(220, 0.15, 0.2); // A3
    },

    // Sonido de victoria (secuencia triunfal)
    victory: async () => {
      console.log('🎵 Reproduciendo sonido: Victory');
      const context = await initAudioContext();
      if (!context) return;

      // Secuencia triunfal ascendente
      const notes = [262, 330, 392, 523]; // C4-E4-G4-C5
      notes.forEach((freq, index) => {
        setTimeout(() => {
          playTone(freq, 0.3, 0.3);
        }, index * 150);
      });

      // Acorde final
      setTimeout(() => {
        playChord([262, 330, 392, 523], 0.8, 0.4);
      }, 600);
    },

    // Sonido de derrota (secuencia descendente sombría)
    defeat: async () => {
      console.log('🎵 Reproduciendo sonido: Defeat');
      const context = await initAudioContext();
      if (!context) return;

      // Secuencia descendente menor
      const notes = [392, 349, 294, 262]; // G4-F4-D4-C4
      notes.forEach((freq, index) => {
        setTimeout(() => {
          playTone(freq, 0.4, 0.3, 'sawtooth');
        }, index * 200);
      });
    },

    // Sonido de hover/click para UI
    uiClick: async () => {
      console.log('🎵 Reproduciendo sonido: UI Click');
      try {
        await playTone(440, 0.05, 0.1); // A4 - muy corto y silencioso para activación
      } catch (error) {
        console.log('Error en uiClick:', error);
      }
    },

    // Sonido de distribución de cartas
    cardDeal: async () => {
      console.log('🎵 Reproduciendo sonido: Card Deal');
      const context = await initAudioContext();
      if (!context) return;

      const frequency = 180 + Math.random() * 80;
      await playTone(frequency, 0.08, 0.15, 'triangle');
    },

    // Función para limpiar el contexto de audio
    cleanup: () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
      }
    }
  };
};

// Hook personalizado para usar efectos de sonido
export const useSoundEffects = () => {
  const soundEffects = createSoundEffects();

  // Función segura para reproducir sonidos (maneja errores)
  const playSound = async (soundName) => {
    try {
      if (soundEffects[soundName]) {
        await soundEffects[soundName]();
      }
    } catch (error) {
      console.log(`Error al reproducir sonido ${soundName}:`, error);
    }
  };

  return {
    cardReveal: () => playSound('cardReveal'),
    shuffle: () => playSound('shuffle'),
    cardOrdered: () => playSound('cardOrdered'),
    cardPlaced: () => playSound('cardPlaced'),
    victory: () => playSound('victory'),
    defeat: () => playSound('defeat'),
    uiClick: () => playSound('uiClick'),
    cardDeal: () => playSound('cardDeal'),
    cleanup: () => soundEffects.cleanup()
  };
};
