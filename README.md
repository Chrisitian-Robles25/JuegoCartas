oraculo-de-la-suerte/
│
├── README.md              # Documentación del juego
├── vite.config.js         # Configuración de Vite
├── package.json           # Dependencias y scripts
├── index.html             # Entrada principal
│
├── src/
│   ├── main.jsx           # Punto de entrada de React
│   ├── App.jsx            # Navegación principal del juego
│   ├── styles/
│   │   ├── globals.css      # Estilos globales
│   ├── components/
│   │   ├── IntroScreen.jsx     # Pantalla de inicio y entrada de pregunta
│   │   ├── GameBoard.jsx       # Lógica y vista de la mesa de cartas
│   │   ├── Card.jsx            # Componente visual de cada carta
│   │   ├── OracleMessages.jsx  # Mensajes místicos animados
│   │   ├── AudioPlayer.jsx     # Reproductor de audio de fondo
│   │   └── ParticlesBackground.jsx  # Fondo animado de partículas
│   └── utils/
│       ├── shuffle.js         # Barajado realista de las cartas
│       └── oraclePhrases.js   # Frases místicas del oráculo
│
└── public/
    ├── images/           # Imágenes de las cartas y fondos
    ├── sounds/           # Sonidos y música
    └── favicon.ico


---

README.md (Contenido sugerido)

# Oráculo de la Suerte

Juego de cartas místico basado en la suerte y el destino. Simula un casino en donde el oráculo revela tu fortuna a través de un proceso de barajado y ordenamiento automático de cartas.

## 🌟 Temática del Juego

- Juego de azar y misterio.
- Barajado imperfecto (simulación realista de casino).
- Distribución de cartas en 13 grupos.
- Las cartas se mueven automáticamente entre los grupos según su número.
- El jugador gana si logra que todos los grupos queden ordenados.

## 🔧 Tecnologías Usadas

- **React.js** (Frontend principal)
- **Vite** (Build rápido y ligero)
- **Framer Motion** (Animaciones suaves y transiciones)
- **Particles.js / tsParticles** (Fondo animado de partículas)
- **Howler.js** (Reproducción de audio)
- **Lodash** (Utilidades para barajado)

## 🌐 Pantallas del Juego

1. **Pantalla de Inicio**
   - Entrada de pregunta al oráculo.
   - Música de fondo y partículas.

2. **Pantalla de Juego (Mesa de Cartas)**
   - Animación de barajado.
   - Distribución visual de las cartas.
   - Movimiento automático de cartas entre los grupos.
   - Mensajes del oráculo con frases místicas.

3. **Pantalla de Resultado Final**
   - Resultado: éxito o fracaso.
   - Frase final mística.
   - Botón para reiniciar el juego.

---

Este juego está diseñado para ofrecer una experiencia hipnótica y misteriosa, combinando mecánicas simples con una estética envolvente.
