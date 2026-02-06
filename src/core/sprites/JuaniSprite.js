import { BaseSprite } from './BaseSprite.js'

/**
 * JuaniSprite - Sprite del personaje Juani
 */
export class JuaniSprite extends BaseSprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'juani_sprite_1', {
      scale: config.scale || 0.6,
      originX: 0.5,
      originY: 1.0,
      physics: config.physics !== false,
      hitboxWidth: null,
      hitboxHeight: null,
      hitboxOffsetX: 0,
      hitboxOffsetY: 0,
      bounce: 0,
      collideWorldBounds: false,
      ...config
    })

    this.setupAnimations()
  }

  /**
   * Configura las animaciones de Juani
   */
  setupAnimations() {
    // Verificar que estamos usando la textura correcta antes de crear animaciones
    const currentTexture = this.phaserSprite.texture.key
    console.log(`JuaniSprite.setupAnimations() - Current texture: ${currentTexture}`)
    
    // Asegurarse de que el sprite tenga la textura correcta
    if (currentTexture !== 'juani_sprite_1' && this.scene.textures.exists('juani_sprite_1')) {
      console.log(`Correcting Juani texture from ${currentTexture} to juani_sprite_1`)
      this.phaserSprite.setTexture('juani_sprite_1')
    }

    // Animación IDLE
    if (this.scene.textures.exists('juani_sprite_1')) {
      this.registerAnimation('juani_idle', {
        frames: [{ key: 'juani_sprite_1' }],
        frameRate: 10,
        repeat: -1
      })
    }

    // Animación WALK (si hay sprites de caminar)
    const walkFrames = []
    for (let i = 2; i <= 5; i++) {
      if (this.scene.textures.exists(`juani_sprite_${i}`)) {
        walkFrames.push({ key: `juani_sprite_${i}` })
      }
    }
    if (walkFrames.length > 0) {
      this.registerAnimation('juani_walk', {
        frames: walkFrames,
        frameRate: 8,
        repeat: -1
      })
    }

    // Reproducir animación inicial (usar nombre único para evitar conflictos)
    if (this.scene.anims.exists('juani_idle')) {
      this.playAnimation('juani_idle', true)
    } else {
      // Si la animación no existe, asegurarse de que la textura sea correcta
      this.phaserSprite.setTexture('juani_sprite_1')
    }
  }

  /**
   * Actualiza la animación basada en el estado
   */
  updateAnimation(isMoving, isOnGround = true) {
    // Si está en modo de interacción (sprite_5), no cambiar la animación
    if (this.phaserSprite.texture.key === 'juani_sprite_5') {
      return // Mantener sprite_5 sin cambios
    }
    
    if (isMoving && this.animations.has('juani_walk')) {
      this.playAnimation('juani_walk', true)
    } else if (this.animations.has('juani_idle')) {
      this.playAnimation('juani_idle', true)
    }
  }

  /**
   * Cambia a sprite de interacción (sprite_5)
   */
  setInteractionSprite() {
    if (this.scene.textures.exists('juani_sprite_5')) {
      this.phaserSprite.setTexture('juani_sprite_5')
      // Detener cualquier animación que pueda estar reproduciéndose
      if (this.phaserSprite.anims) {
        this.phaserSprite.anims.stop()
      }
    }
  }
}
