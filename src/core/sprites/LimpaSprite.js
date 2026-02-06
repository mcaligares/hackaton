import { BaseSprite } from './BaseSprite.js'

/**
 * LimpaSprite - Sprite del personaje Limpa
 */
export class LimpaSprite extends BaseSprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'limpa_sprite_1', {
      scale: config.scale || 0.5,
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
   * Configura las animaciones de Limpa
   */
  setupAnimations() {
    // Verificar que estamos usando la textura correcta antes de crear animaciones
    const currentTexture = this.phaserSprite.texture.key
    console.log(`LimpaSprite.setupAnimations() - Current texture: ${currentTexture}`)
    
    // Asegurarse de que el sprite tenga la textura correcta
    if (currentTexture !== 'limpa_sprite_1' && this.scene.textures.exists('limpa_sprite_1')) {
      console.log(`Correcting Limpa texture from ${currentTexture} to limpa_sprite_1`)
      this.phaserSprite.setTexture('limpa_sprite_1')
    }

    // Animación IDLE
    if (this.scene.textures.exists('limpa_sprite_1')) {
      this.registerAnimation('limpa_idle', {
        frames: [{ key: 'limpa_sprite_1' }],
        frameRate: 10,
        repeat: -1
      })
    }

    // Animación WALK
    const walkFrames = []
    for (let i = 2; i <= 4; i++) {
      if (this.scene.textures.exists(`limpa_sprite_${i}`)) {
        walkFrames.push({ key: `limpa_sprite_${i}` })
      }
    }
    if (walkFrames.length > 0) {
      this.registerAnimation('limpa_walk', {
        frames: walkFrames,
        frameRate: 8,
        repeat: -1
      })
    }

    // Animación INTERACCIÓN (sprites 6-11)
    const interactionFrames = []
    for (let i = 6; i <= 11; i++) {
      if (this.scene.textures.exists(`limpa_sprite_${i}`)) {
        interactionFrames.push({ key: `limpa_sprite_${i}` })
      }
    }
    if (interactionFrames.length > 0) {
      this.registerAnimation('limpa_interact', {
        frames: interactionFrames,
        frameRate: 8,
        repeat: 0 // No repetir, solo una vez
      })
    }

    // Reproducir animación inicial (usar nombre único para evitar conflictos)
    if (this.scene.anims.exists('limpa_idle')) {
      this.playAnimation('limpa_idle', true)
    } else {
      // Si la animación no existe, asegurarse de que la textura sea correcta
      this.phaserSprite.setTexture('limpa_sprite_1')
    }
  }

  /**
   * Actualiza la animación basada en el estado
   */
  updateAnimation(isMoving, isOnGround = true, isInteracting = false) {
    if (isInteracting && this.animations.has('limpa_interact')) {
      this.playAnimation('limpa_interact', false)
    } else if (isMoving && this.animations.has('limpa_walk')) {
      this.playAnimation('limpa_walk', true)
    } else if (this.animations.has('limpa_idle')) {
      this.playAnimation('limpa_idle', true)
    }
  }

  /**
   * Reproduce la animación de interacción
   */
  playInteraction() {
    if (this.animations.has('limpa_interact')) {
      this.playAnimation('limpa_interact', false)
    }
  }
}
