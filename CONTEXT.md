# Contexto del Proyecto - Hackaton Game

## Stack Tecnológico

- **React 18.2.0**: Framework UI
- **Phaser 3.90.0**: Motor de juego 2D
- **Vite 5.0.8**: Build tool y dev server
- **JavaScript ES6+**: Lenguaje de programación

## Arquitectura General

### Estructura de Carpetas

```
hackaton-game/
├── src/
│   ├── core/              # Sistemas base del juego
│   │   ├── sprites/       # Sistema de sprites
│   │   ├── actions/       # Sistema de acciones
│   │   ├── scenes/        # Sistema de escenas
│   │   ├── router/        # Router de escenas
│   │   └── physics/       # Configuración de física
│   ├── scenes/            # Escenas del juego
│   ├── hooks/             # React hooks personalizados
│   └── App.jsx            # Componente principal
├── public/
│   └── assets/            # Recursos del juego
└── docs/                  # Documentación
```

## Patrones Utilizados

### 1. Programación Orientada a Objetos (OOP)

#### Herencia de Clases
- **BaseSprite**: Clase base para todos los sprites
  - `PlayerSprite` extiende `BaseSprite`
  - `EnemySprite` extiende `BaseSprite`
  
- **BaseScene**: Clase base para todas las escenas
  - `ChallengeScene` extiende `BaseScene`
  - `PresentationScene` extiende `BaseScene`

#### Polimorfismo
- Los sprites pueden tener diferentes implementaciones de `updateAnimation()`
- Las escenas pueden sobrescribir métodos como `onChallengeComplete()`

### 2. Sistema de Acciones Desacoplado

Las acciones son clases independientes que pueden ser aplicadas a cualquier sprite:

```javascript
// Crear acción
const movementAction = new MovementAction({ speed: 200 })

// Asociar a sprite
player.addAction('move', (sprite, keys, isOnGround) => {
  return movementAction.execute(sprite, keys, isOnGround)
})

// Ejecutar acción
player.executeAction('move', keys, isOnGround)
```

### 3. Router de Escenas

El router maneja el flujo del juego mediante configuración:

```javascript
// En sceneConfig.js
scenes: [
  { key: 'MainMenu', type: 'presentation', nextScene: 'IntroStory' },
  { key: 'Exploration', type: 'challenge', nextScene: 'Achievement1' }
]
```

## Convenciones del Proyecto

### Crear Nueva Escena

1. **Escena de Desafío**:
```javascript
import { ChallengeScene } from '../core/scenes/ChallengeScene.js'

export class MyChallengeScene extends ChallengeScene {
  constructor() {
    super('MyChallenge')
  }

  create() {
    super.create()
    // Tu código aquí
  }

  onChallengeComplete() {
    super.onChallengeComplete()
    this.transitionTo('NextScene')
  }
}
```

2. **Escena Presentacional**:
```javascript
import { PresentationScene } from '../core/scenes/PresentationScene.js'

export class MyPresentationScene extends PresentationScene {
  constructor() {
    super('MyPresentation')
  }

  create() {
    super.create()
    // Tu código aquí
  }
}
```

3. **Registrar en App.jsx**:
```javascript
import { MyChallengeScene } from './scenes/MyChallengeScene.js'

// Agregar a la lista de escenas en config
scene: [..., MyChallengeScene]
```

4. **Agregar a sceneConfig.js**:
```javascript
scenes: [
  // ... otras escenas
  {
    key: 'MyChallenge',
    type: 'challenge',
    nextScene: 'NextScene'
  }
]
```

### Crear Nuevo Personaje

1. **Heredar de BaseSprite**:
```javascript
import { BaseSprite } from '../core/sprites/BaseSprite.js'

export class MyCharacter extends BaseSprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'sprite_key', {
      scale: 0.4,
      physics: true,
      ...config
    })
    
    this.setupAnimations()
  }

  setupAnimations() {
    this.registerAnimation('idle', {
      frames: [{ key: 'sprite_1' }],
      frameRate: 10,
      repeat: -1
    })
  }
}
```

2. **Usar en escena**:
```javascript
this.character = new MyCharacter(this, 100, 100)
```

### Crear Nueva Acción

1. **Crear clase de acción**:
```javascript
export class MyAction {
  constructor(config = {}) {
    this.config = { ...config }
  }

  execute(sprite, ...args) {
    // Lógica de la acción
    return result
  }
}
```

2. **Guardar en `src/core/actions/`**

3. **Exportar en `src/core/actions/index.js`**

4. **Usar en escena**:
```javascript
import { MyAction } from '../core/actions/MyAction.js'

this.myAction = new MyAction({ /* config */ })
this.player.addAction('myAction', (sprite, ...args) => {
  return this.myAction.execute(sprite, ...args)
})
```

### Importar Sprites y Recursos

1. **Cargar en preload()**:
```javascript
preload() {
  // Sprites individuales
  this.load.image('sprite_key', '/assets/sprites/characters/player/sprite.png')
  
  // Spritesheets
  this.load.spritesheet('character', '/assets/sprites/characters/player/sheet.png', {
    frameWidth: 32,
    frameHeight: 48
  })
}
```

2. **Usar en create()**:
```javascript
create() {
  // Verificar que el sprite existe
  if (this.textures.exists('sprite_key')) {
    this.sprite = this.add.sprite(100, 100, 'sprite_key')
  }
}
```

## Sistema de Estado

El estado del juego se persiste automáticamente usando:

- **localStorage**: Para persistencia entre sesiones
- **React hooks**: Para acceso desde componentes React
- **SceneRouter**: Para gestión del estado del juego

### Acceder al Estado

```javascript
// En React component
const [gameState, updateGameState] = useGameState()

// Actualizar estado
updateGameState('key', value)

// En Phaser Scene
// El router maneja el estado automáticamente
```

## Sistema de Física

La física se configura mediante `PhysicsConfig`:

```javascript
import { PhysicsConfig } from '../core/physics/PhysicsConfig.js'

// Horizontal/Plataformas
const config = PhysicsConfig.horizontal()

// Top-down
const config = PhysicsConfig.topDown()

// Personalizado
const config = PhysicsConfig.custom({
  gravity: { x: 0, y: 500 }
})
```

## Flujo del Juego

El flujo está definido en `sceneConfig.js`:

1. **Pantalla de inicio** → MainMenu
2. **Historia introductoria** → IntroStory
3. **Tutorial** → Tutorial
4. **Desafío** → Exploration / Combat
5. **Logro** → Achievement
6. **Historia** → Story
7. **Repetir** hasta finalizar

Las transiciones se manejan automáticamente mediante el router.

## Assets Temporales

Durante el desarrollo se usan placeholders:

- `sprite_1.png` a `sprite_17.png`: Sprites temporales
- Estos deben ser reemplazados por assets finales

### Reemplazar Assets

1. Colocar nuevos assets en `public/assets/`
2. Actualizar rutas en `preload()` de las escenas
3. Verificar que los nombres de las claves coincidan

## Extensibilidad

El proyecto está diseñado para ser fácilmente extensible:

- **Nuevas escenas**: Heredar de ChallengeScene o PresentationScene
- **Nuevos personajes**: Heredar de BaseSprite
- **Nuevas acciones**: Crear clase siguiendo el patrón de Actions
- **Nuevos tipos de física**: Agregar métodos a PhysicsConfig

## Notas Importantes

1. **Siempre llamar `super.create()`** en escenas que extienden BaseScene
2. **Verificar existencia de texturas** antes de usarlas: `this.textures.exists('key')`
3. **Usar el router** para transiciones entre escenas: `this.transitionTo('SceneKey')`
4. **Documentar clases públicas** con JSDoc
5. **Mantener acciones desacopladas** para reutilización

## Próximos Pasos

1. Completar escenas faltantes (Achievement, EndGame)
2. Agregar más tipos de enemigos
3. Implementar sistema de logros
4. Reemplazar assets temporales
5. Agregar sonido y música
