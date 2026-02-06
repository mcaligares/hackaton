import { BaseSprite } from './BaseSprite.js'

/**
 * DesignerSprite - Sprite del personaje Designer
 * Estados:
 * - idle: sprite_1
 * - select: sprite_2
 * - selected: sprite_4
 */
export class DesignerSprite extends BaseSprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'designer_sprite_1', {
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
   * Configura las animaciones de Designer
   */
  setupAnimations() {
    // Verificar que estamos usando la textura correcta antes de crear animaciones
    const currentTexture = this.phaserSprite.texture.key
    console.log(`DesignerSprite.setupAnimations() - Current texture: ${currentTexture}`)
    
    // Asegurarse de que el sprite tenga la textura correcta (idle = sprite_1)
    if (currentTexture !== 'designer_sprite_1' && this.scene.textures.exists('designer_sprite_1')) {
      console.log(`Correcting Designer texture from ${currentTexture} to designer_sprite_1`)
      this.phaserSprite.setTexture('designer_sprite_1')
    }

    // Animación IDLE (sprite_1)
    if (this.scene.textures.exists('designer_sprite_1')) {
      this.registerAnimation('designer_idle', {
        frames: [{ key: 'designer_sprite_1' }],
        frameRate: 10,
        repeat: -1
      })
    }

    // Reproducir animación inicial (idle)
    if (this.scene.anims.exists('designer_idle')) {
      this.playAnimation('designer_idle', true)
    } else {
      // Si la animación no existe, asegurarse de que la textura sea correcta
      this.phaserSprite.setTexture('designer_sprite_1')
    }
  }

  /**
   * Cambia al estado idle (sprite_1)
   */
  setIdle() {
    if (this.scene.textures.exists('designer_sprite_1')) {
      this.phaserSprite.setTexture('designer_sprite_1')
      if (this.phaserSprite.anims) {
        this.phaserSprite.anims.stop()
      }
    }
  }

  /**
   * Cambia al estado select (sprite_2)
   */
  setSelect() {
    if (this.scene.textures.exists('designer_sprite_2')) {
      this.phaserSprite.setTexture('designer_sprite_2')
      if (this.phaserSprite.anims) {
        this.phaserSprite.anims.stop()
      }
    }
  }

  /**
   * Cambia al estado selected (sprite_4)
   */
  setSelected() {
    if (this.scene.textures.exists('designer_sprite_4')) {
      this.phaserSprite.setTexture('designer_sprite_4')
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
