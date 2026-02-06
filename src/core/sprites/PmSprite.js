import { BaseSprite } from './BaseSprite.js'

/**
 * PmSprite - Sprite del personaje PM
 * Estados:
 * - idle: sprite_4
 * - select: sprite_1
 * - selected: sprite_4
 */
export class PmSprite extends BaseSprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'pm_sprite_4', {
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
   * Configura las animaciones de PM
   */
  setupAnimations() {
    // Verificar que estamos usando la textura correcta antes de crear animaciones
    const currentTexture = this.phaserSprite.texture.key
    console.log(`PmSprite.setupAnimations() - Current texture: ${currentTexture}`)
    
    // Asegurarse de que el sprite tenga la textura correcta (idle = sprite_4)
    if (currentTexture !== 'pm_sprite_4' && this.scene.textures.exists('pm_sprite_4')) {
      console.log(`Correcting PM texture from ${currentTexture} to pm_sprite_4`)
      this.phaserSprite.setTexture('pm_sprite_4')
    }

    // Animación IDLE (sprite_4)
    if (this.scene.textures.exists('pm_sprite_4')) {
      this.registerAnimation('pm_idle', {
        frames: [{ key: 'pm_sprite_4' }],
        frameRate: 10,
        repeat: -1
      })
    }

    // Reproducir animación inicial (idle)
    if (this.scene.anims.exists('pm_idle')) {
      this.playAnimation('pm_idle', true)
    } else {
      // Si la animación no existe, asegurarse de que la textura sea correcta
      this.phaserSprite.setTexture('pm_sprite_4')
    }
  }

  /**
   * Cambia al estado idle (sprite_4)
   */
  setIdle() {
    if (this.scene.textures.exists('pm_sprite_4')) {
      this.phaserSprite.setTexture('pm_sprite_4')
      if (this.phaserSprite.anims) {
        this.phaserSprite.anims.stop()
      }
    }
  }

  /**
   * Cambia al estado select (sprite_1)
   */
  setSelect() {
    if (this.scene.textures.exists('pm_sprite_1')) {
      this.phaserSprite.setTexture('pm_sprite_1')
      if (this.phaserSprite.anims) {
        this.phaserSprite.anims.stop()
      }
    }
  }

  /**
   * Cambia al estado selected (sprite_4)
   */
  setSelected() {
    if (this.scene.textures.exists('pm_sprite_4')) {
      this.phaserSprite.setTexture('pm_sprite_4')
      if (this.phaserSprite.anims) {
        this.phaserSprite.anims.stop()
      }
    }
  }

  /**
   * Actualiza la animación basada en el estado
   */
  updateAnimation(isMoving, isOnGround = true) {
    // Mantener estado actual sin cambios automáticos
    // Los estados se cambian manualmente con setIdle(), setSelect(), setSelected()
  }

  /**
   * Cambia a sprite de interacción (usa selected)
   */
  setInteractionSprite() {
    this.setSelected()
  }
}
