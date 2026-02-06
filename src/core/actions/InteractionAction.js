/**
 * InteractionAction - Acción de interacción reutilizable
 * 
 * Maneja interacciones con objetos del mundo (cofres, NPCs, puertas, etc.)
 */
export class InteractionAction {
  constructor(config = {}) {
    this.config = {
      interactionKey: config.interactionKey || 'E',
      interactionRange: config.interactionRange || 80,
      showHint: config.showHint !== false,
      ...config
    }

    this.currentInteractable = null
    this.hintText = null
  }

  /**
   * Verifica si hay objetos interactuables cerca
   * @param {BaseSprite} sprite - Sprite que intenta interactuar
   * @param {Array} interactables - Lista de objetos interactuables
   * @returns {Object|null} Objeto interactuable más cercano o null
   */
  findInteractable(sprite, interactables) {
    if (!interactables || interactables.length === 0) {
      return null
    }

    let closest = null
    let closestDistance = Infinity

    for (const interactable of interactables) {
      const distance = Phaser.Math.Distance.Between(
        sprite.x,
        sprite.y,
        interactable.x || interactable.sprite?.x || 0,
        interactable.y || interactable.sprite?.y || 0
      )

      if (distance <= this.config.interactionRange && distance < closestDistance) {
        closest = interactable
        closestDistance = distance
      }
    }

    return closest
  }

  /**
   * Ejecuta la interacción
   * @param {BaseSprite} sprite - Sprite que interactúa
   * @param {Array} interactables - Lista de objetos interactuables
   * @param {Object} keys - Teclas presionadas
   * @returns {Object|null} Resultado de la interacción
   */
  execute(sprite, interactables, keys = {}) {
    const interactable = this.findInteractable(sprite, interactables)

    // Mostrar/ocultar hint
    if (this.config.showHint) {
      this.updateHint(sprite, interactable)
    }

    // Verificar si se presionó la tecla de interacción
    const interactionKey = keys[this.config.interactionKey] || keys.e
    if (!interactionKey) {
      return null
    }
    
    // Nota: La verificación de JustDown debe hacerse en la escena
    // Por ahora verificamos si la tecla está presionada
    if (!interactionKey.isDown) {
      return null
    }

    if (interactable) {
      // Ejecutar callback de interacción si existe
      if (interactable.onInteract) {
        return interactable.onInteract(sprite, interactable)
      }

      return {
        success: true,
        interactable: interactable
      }
    }

    return null
  }

  /**
   * Actualiza el texto de hint
   */
  updateHint(sprite, interactable) {
    if (interactable && sprite.scene) {
      if (!this.hintText) {
        this.hintText = sprite.scene.add.text(0, 0, '', {
          fontSize: '16px',
          fill: '#ffff00',
          backgroundColor: '#000000',
          padding: { x: 5, y: 3 }
        })
        this.hintText.setOrigin(0.5)
        this.hintText.setDepth(1000)
      }

      const hintMessage = interactable.hintMessage || `Presiona ${this.config.interactionKey}`
      this.hintText.setText(hintMessage)
      this.hintText.setPosition(
        interactable.x || interactable.sprite?.x || sprite.x,
        (interactable.y || interactable.sprite?.y || sprite.y) - 50
      )
      this.hintText.setVisible(true)
    } else if (this.hintText) {
      this.hintText.setVisible(false)
    }
  }

  /**
   * Limpia los recursos de hint
   */
  destroy() {
    if (this.hintText) {
      this.hintText.destroy()
      this.hintText = null
    }
  }
}
