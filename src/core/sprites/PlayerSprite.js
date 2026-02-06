import { BaseSprite } from './BaseSprite.js'

/**
 * PlayerSprite - Sprite del jugador principal
 * 
 * Ejemplo de herencia de BaseSprite para crear un personaje específico
 */
export class PlayerSprite extends BaseSprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'sprite_1', {
      scale: 0.4,
      originX: 0.5,
      originY: 1.0,
      physics: true,
      hitboxWidth: null, // Se calculará automáticamente
      hitboxHeight: null,
      hitboxOffsetX: 0,
      hitboxOffsetY: 100,
      bounce: 0.2,
      collideWorldBounds: true,
      ...config
    })

    this.setupAnimations()
  }

  /**
   * Configura las animaciones del jugador
   */
  setupAnimations() {
    // Animación IDLE
    this.registerAnimation('idle', {
      frames: [{ key: 'sprite_1' }],
      frameRate: 10,
      repeat: -1
    })

    // Animación WALK
    const walkFrames = []
    for (let i = 2; i <= 4; i++) {
      if (this.scene.textures.exists(`sprite_${i}`)) {
        walkFrames.push({ key: `sprite_${i}` })
      }
    }
    if (walkFrames.length > 0) {
      this.registerAnimation('walk', {
        frames: walkFrames,
        frameRate: 10,
        repeat: -1
      })
    }

    // Animación RUN
    const runFrames = []
    if (this.scene.textures.exists('sprite_5')) {
      runFrames.push({ key: 'sprite_5' })
    }
    for (let i = 6; i <= 8; i++) {
      if (this.scene.textures.exists(`sprite_${i}`)) {
        runFrames.push({ key: `sprite_${i}` })
      }
    }
    if (runFrames.length > 0) {
      this.registerAnimation('run', {
        frames: runFrames,
        frameRate: 15,
        repeat: -1
      })
    }

    // Animación JUMP
    const jumpSprites = [8, 7, 6] // Prioridad de sprites para salto
    for (const spriteNum of jumpSprites) {
      if (this.scene.textures.exists(`sprite_${spriteNum}`)) {
        this.registerAnimation('jump', {
          frames: [{ key: `sprite_${spriteNum}` }],
          frameRate: 10,
          repeat: 0
        })
        break
      }
    }

    // Reproducir animación inicial
    this.playAnimation('idle', true)
  }

  /**
   * Actualiza la animación basada en el estado del jugador
   * @param {boolean} isMoving - Si el jugador se está moviendo
   * @param {boolean} isOnGround - Si el jugador está en el suelo
   * @param {number} velocityX - Velocidad horizontal
   * @param {number} speedThreshold - Umbral de velocidad para correr
   */
  updateAnimation(isMoving, isOnGround, velocityX = 0, speedThreshold = 160) {
    if (!isOnGround) {
      // En el aire
      if (this.animations.has('jump')) {
        this.playAnimation('jump', true)
      }
    } else if (isMoving) {
      // Moviéndose en el suelo
      if (Math.abs(velocityX) > speedThreshold && this.animations.has('run')) {
        this.playAnimation('run', true)
      } else if (this.animations.has('walk')) {
        this.playAnimation('walk', true)
      }
    } else {
      // Quieto
      this.playAnimation('idle', true)
    }
  }
}
