# 🔮 Oráculo de la Suerte

Un juego de cartas místico donde el destino revela su voluntad a través del ordenamiento automático de cartas. Basado en la mecánica tradicional de casino con una estética envolvente y misteriosa.

![Screenshot del juego](https://via.placeholder.com/800x400/1a0b2e/d4af37?text=Or%C3%A1culo+de+la+Suerte)

## 🌟 Características del Juego

### 🎰 Mecánica Principal
- **Barajado Realista**: Simulación de barajado tipo casino con técnicas Riffle, Overhand y corte
- **Distribución Circular**: 52 cartas distribuidas en 13 grupos en disposición circular
- **Movimiento Automático**: Las cartas se mueven automáticamente siguiendo las reglas del juego
- **Victoria por Suerte**: El objetivo es lograr que todos los grupos queden completamente ordenados

### 🎨 Diseño Visual
- **Paleta Mística**: Morado oscuro, dorado, negro y azul índigo
- **Tipografía Elegante**: Cinzel Decorative y Playfair Display
- **Efectos Visuales**: 
  - Partículas animadas de fondo con tsParticles
  - Efectos de glow y neón suave
  - Animaciones fluidas con Framer Motion
  - Cartas con diseño vintage/tarot

### 🔊 Experiencia Sonora
- Música de fondo atmosférica en bucle
- Efectos sonoros para:
  - Barajado de cartas
  - Movimiento de cartas
  - Completado de grupos
- Integración con Howler.js

### 🎭 Temática Oracular
- Mensajes místicos durante el juego
- Frases inspiradoras del oráculo
- Resultado interpretado como revelación del destino
- Interfaz que invita a la contemplación

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd oraculo-de-la-suerte

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de la construcción
- `npm run lint` - Análisis de código

## 🎮 Cómo Jugar

1. **Pantalla de Inicio**: Introduce tu pregunta al oráculo
2. **Observa el Ritual**: 
   - Las cartas son barajadas de forma realista
   - Se distribuyen en 13 grupos circulares
   - El grupo central (posición 13) contiene los Reyes
3. **El Juego Automático**:
   - Se voltea una carta del grupo central
   - La carta se mueve al grupo correspondiente a su valor
   - El proceso se repite automáticamente
4. **Resultado Final**: El oráculo revela si el destino te favorece

## 🔧 Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **Vite** - Build tool rápido y moderno
- **Framer Motion** - Animaciones y transiciones
- **tsParticles** - Efectos de partículas de fondo

### Audio
- **Howler.js** - Reproducción de audio avanzada

### Utilidades
- **Lodash** - Funciones de utilidad para el barajado
- **ESLint** - Análisis de código

### Desarrollo
- **Vite** - Servidor de desarrollo con hot reload
- **PostCSS** - Procesamiento de CSS

## 📁 Estructura del Proyecto

```
oraculo-de-la-suerte/
├── README.md                    # Documentación principal
├── vite.config.js              # Configuración de Vite
├── package.json                # Dependencias y scripts
├── index.html                  # Punto de entrada HTML
├── .eslintrc.cjs              # Configuración de ESLint
├── .gitignore                 # Archivos ignorados por Git
│
├── src/
│   ├── main.jsx               # Punto de entrada de React
│   ├── App.jsx                # Componente principal y navegación
│   ├── styles/
│   │   └── globals.css        # Estilos globales
│   ├── components/
│   │   ├── IntroScreen.jsx    # Pantalla de introducción
│   │   ├── GameBoard.jsx      # Mesa de juego principal
│   │   ├── Card.jsx           # Componente individual de carta
│   │   ├── OracleMessages.jsx # Sistema de mensajes místicos
│   │   ├── AudioPlayer.jsx    # Control de audio
│   │   └── ParticlesBackground.jsx # Fondo de partículas
│   └── utils/
│       ├── shuffle.js         # Lógica de barajado y juego
│       └── oraclePhrases.js   # Frases místicas del oráculo
│
└── public/
    ├── images/               # Recursos de imágenes
    ├── sounds/              # Archivos de audio
    └── README.md           # Instrucciones para recursos
```

## 🎨 Personalización

### Colores
Los colores principales están definidos en CSS custom properties:
```css
:root {
  --purple-dark: #1a0b2e;
  --gold: #d4af37;
  --indigo: #2c3e50;
  --glow-color: #9b59b6;
}
```

### Frases del Oráculo
Puedes personalizar las frases editando `src/utils/oraclePhrases.js`:
```javascript
export const frasesOraculo = [
  "Los caminos del destino son misteriosos.",
  "Tu deseo navega entre las sombras del azar.",
  // Añade tus propias frases...
];
```

### Audio
Para añadir música y efectos:
1. Coloca archivos de audio en `public/sounds/`
2. Actualiza las referencias en `AudioPlayer.jsx`

## 🌟 Características Avanzadas

### Barajado Realista
El sistema implementa técnicas reales de barajado:
- **Riffle Shuffle**: Mezcla en cascada
- **Overhand Shuffle**: Mezcla por montones
- **Corte Final**: Corte tradicional del mazo

### Lógica del Juego
- Distribución automática en 13 grupos
- Movimiento basado en valor de cartas
- Detección automática de victoria
- Sistema de puntuación por pasos

### Efectos Visuales
- Animaciones de cartas con física realista
- Efectos de glow en grupos completados
- Transiciones suaves entre pantallas
- Partículas interactivas de fondo

## 📱 Responsive Design

El juego está optimizado para:
- **Desktop**: Experiencia completa con todos los efectos
- **Tablet**: Interfaz adaptada para pantallas medianas
- **Mobile**: Versión simplificada para dispositivos móviles

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🙏 Créditos

### Recursos Recomendados
- **Música**: [Freesound.org](https://freesound.org), [Mixkit.co](https://mixkit.co)
- **Imágenes**: [Unsplash.com](https://unsplash.com), [Pixabay.com](https://pixabay.com)
- **Fuentes**: Google Fonts (Cinzel Decorative, Playfair Display)

### Inspiración
- Juegos de solitario tradicionales
- Mecánicas de casino clásicas
- Estética de cartas de tarot y astrología

---

**¿El destino te sonríe? Solo las cartas lo saben...** 🔮✨
