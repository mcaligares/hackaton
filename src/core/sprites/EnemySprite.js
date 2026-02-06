import { BaseSprite } from './BaseSprite.js'

/**
 * EnemySprite - Sprite de enemigo
 * 
 * Ejemplo de herencia para crear un enemigo con comportamiento específico
 */
export class EnemySprite extends BaseSprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'sprite_1', {
      scale: 0.4,
      originX: 0.5,
      originY: 1.0,
      physics: true,
      hitboxWidth: null,
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
   * Configura las animaciones del enemigo
   * Similar a PlayerSprite pero con prefijo 'enemy_'
   */
  setupAnimations() {
    // Animación IDLE
    this.registerAnimation('enemy_idle', {
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
      this.registerAnimation('enemy_walk', {
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
      this.registerAnimation('enemy_run', {
        frames: runFrames,
        frameRate: 15,
        repeat: -1
      })
    }

    // Animación JUMP
    const jumpSprites = [8, 7, 6]
    for (const spriteNum of jumpSprites) {
      if (this.scene.textures.exists(`sprite_${spriteNum}`)) {
        this.registerAnimation('enemy_jump', {
          frames: [{ key: `sprite_${spriteNum}` }],
          frameRate: 10,
          repeat: 0
        })
        break
      }
    }

    // Reproducir animación inicial
    this.playAnimation('enemy_idle', true)
  }

  /**
   * Actualiza la animación del enemigo
   */
  updateAnimation(isMoving, isOnGround, velocityX = 0, speedThreshold = 160) {
    if (!isOnGround) {
      if (this.animations.has('enemy_jump')) {
        this.playAnimation('enemy_jump', true)
      }
    } else if (isMoving) {
      if (Math.abs(velocityX) > speedThreshold && this.animations.has('enemy_run')) {
        this.playAnimation('enemy_run', true)
      } else if (this.animations.has('enemy_walk')) {
        this.playAnimation('enemy_walk', true)
      }
    } else {
      this.playAnimation('enemy_idle', true)
    }
  }
}
