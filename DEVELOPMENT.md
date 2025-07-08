# 🛠️ Guía de Desarrollo

## Configuración del Entorno

### Requisitos
- Node.js 18+ 
- npm o yarn
- Editor de código (VS Code recomendado)

### Instalación Inicial
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# El servidor se iniciará en http://localhost:3001
```

## 🏗️ Arquitectura del Proyecto

### Componentes Principales

#### App.jsx
- **Propósito**: Navegación principal entre pantallas
- **Estado**: Maneja `currentScreen`, `playerQuestion`, `gameResult`
- **Pantallas**: 'intro', 'game', 'result'

#### IntroScreen.jsx
- **Propósito**: Pantalla de bienvenida y entrada de pregunta
- **Funcionalidad**: 
  - Input para pregunta del usuario
  - Validación de entrada
  - Animaciones de introducción

#### GameBoard.jsx
- **Propósito**: Mesa de juego principal con toda la lógica
- **Funcionalidades**:
  - Barajado y distribución de cartas
  - Lógica de movimiento automático
  - Detección de victoria
  - Animaciones de cartas

#### Card.jsx
- **Propósito**: Componente visual individual de carta
- **Estados**: cara arriba/abajo, animaciones

#### OracleMessages.jsx
- **Propósito**: Sistema de mensajes místicos
- **Funcionalidad**: Rotación automática de frases según la fase del juego

#### ParticlesBackground.jsx
- **Propósito**: Fondo animado con partículas
- **Configuración**: tsParticles con tema místico

### Utilidades

#### shuffle.js
- **Funciones principales**:
  - `createDeck()`: Crea mazo de 52 cartas
  - `casinoShuffle()`: Barajado realista multi-técnica
  - `distributeCards()`: Distribución en 13 grupos
  - `isGameWon()`: Verificación de victoria

#### oraclePhrases.js
- **Contenido**: Frases místicas para diferentes situaciones
- **Funciones**: `getRandomPhrase()` para selección aleatoria

## 🎨 Sistema de Estilos

### Variables CSS (globals.css)
```css
:root {
  --purple-dark: #1a0b2e;
  --gold: #d4af37;
  --indigo: #2c3e50;
  --glow-color: #9b59b6;
}
```

### Clases Principales
- `.mystic-button`: Botones con estilo místico
- `.mystic-input`: Inputs con borde dorado
- `.card`: Estilo de cartas con animaciones
- `.card-group`: Contenedores de grupos de cartas
- `.oracle-message`: Mensajes del oráculo

### Animaciones
- Framer Motion para transiciones
- CSS keyframes para efectos especiales
- Hover states con transformaciones

## 🎮 Lógica del Juego

### Fases del Juego
1. **'shuffling'**: Barajado de cartas
2. **'distributing'**: Distribución en grupos
3. **'playing'**: Movimiento automático
4. **'checking'**: Verificación final
5. **'finished'**: Resultado

### Mecánica de Movimiento
1. Tomar carta superior del grupo central (índice 0)
2. Determinar grupo destino según valor de carta:
   - Rey (13) → Grupo central (0)
   - As (1) → Grupo 1
   - Otros → Su número correspondiente
3. Animar movimiento
4. Actualizar estados
5. Verificar completación

### Condición de Victoria
- Todos los grupos deben tener exactamente 4 cartas
- Cada grupo debe contener solo cartas del valor correcto
- Grupo 0 (central) = Reyes (13)
- Grupos 1-12 = Cartas de valor correspondiente

## 🔧 Desarrollo y Debugging

### Scripts de Desarrollo
```bash
# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Debugging Tips
- Usar React DevTools
- Console.log en fases críticas del juego
- Verificar estados en el panel de información (esquina superior izquierda)

### Performance
- Limitar animaciones en móviles
- Optimizar re-renders con useCallback/useMemo
- Lazy loading de componentes pesados

## 🎵 Sistema de Audio

### Configuración Actual
- Componente AudioPlayer simplificado
- Toggle visual de estado de audio
- Preparado para integración con Howler.js

### Para Añadir Audio Real
1. Colocar archivos en `public/sounds/`
2. Actualizar AudioPlayer.jsx con Howler.js
3. Añadir efectos sonoros específicos:
   - Barajado de cartas
   - Movimiento de cartas
   - Completación de grupos
   - Música de fondo

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Adaptaciones Mobile
- Cartas más pequeñas
- Mesa de juego reducida
- Tipografía escalada
- Simplificación de animaciones

## 🚀 Deploy

### Opciones de Hosting
- **Vercel**: Ideal para Vite projects
- **Netlify**: Build automático desde Git
- **GitHub Pages**: Gratuito para repos públicos

### Build para Producción
```bash
npm run build
# Archivos generados en /dist
```

## 🤝 Contribución

### Estructura de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `style:` Cambios de estilo/CSS
- `refactor:` Refactoring de código
- `docs:` Documentación

### Testing (Futuro)
- Jest para lógica de juego
- React Testing Library para componentes
- Cypress para E2E

## 📈 Futuras Mejoras

### Funcionalidades
- [ ] Sistema de sonido completo
- [ ] Diferentes mazos/temas de cartas
- [ ] Estadísticas de jugadas
- [ ] Modo multijugador
- [ ] Guardado de progreso

### Optimizaciones
- [ ] Service Worker para offline
- [ ] Preloading de recursos
- [ ] Compresión de assets
- [ ] Análisis de bundle size

### UX/UI
- [ ] Tutorial interactivo
- [ ] Más efectos visuales
- [ ] Personalización de temas
- [ ] Accesibilidad mejorada
