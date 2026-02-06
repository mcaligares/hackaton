/**
 * MovementAction - Acción de movimiento reutilizable
 * 
 * Maneja el movimiento horizontal y vertical de cualquier sprite
 * Puede ser aplicada a jugadores, enemigos, NPCs, etc.
 */
export class MovementAction {
  constructor(config = {}) {
    this.config = {
      speed: config.speed || 200,
      jumpSpeed: config.jumpSpeed || -500,
      allowJump: config.allowJump !== false,
      ...config
    }
  }

  /**
   * Ejecuta el movimiento basado en inputs
   * @param {BaseSprite} sprite - Sprite al que aplicar el movimiento
   * @param {Object} keys - Objeto con las teclas presionadas
   * @param {boolean} isOnGround - Si el sprite está en el suelo
   * @returns {Object} Estado del movimiento { velocityX, velocityY, isMoving, direction }
   */
  execute(sprite, keys, isOnGround = true) {
    // Verificar que el sprite y su phaserSprite existan
    if (!sprite || !sprite.phaserSprite || !sprite.phaserSprite.body) {
      return {
        velocityX: 0,
        velocityY: 0,
        isMoving: false,
        direction: 0,
        isOnGround: true
      }
    }

    const { left, right, up, down, space } = keys
    const isLeftPressed = left?.isDown || false
    const isRightPressed = right?.isDown || false
    const isJumpPressed = up?.isDown || space?.isDown || false

    let velocityX = 0
    let velocityY = 0
    let isMoving = false
    let direction = 0 // -1 izquierda, 1 derecha

    // Movimiento horizontal
    if (isLeftPressed) {
      velocityX = -this.config.speed
      isMoving = true
      direction = -1
      sprite.phaserSprite.setFlipX(true)
    } else if (isRightPressed) {
      velocityX = this.config.speed
      isMoving = true
      direction = 1
      sprite.phaserSprite.setFlipX(false)
    }

    // Salto (solo si está en el suelo y está permitido)
    if (this.config.allowJump && isJumpPressed && isOnGround) {
      velocityY = this.config.jumpSpeed
    }

    // Aplicar velocidades
    sprite.phaserSprite.setVelocityX(velocityX)
    if (velocityY !== 0) {
      sprite.phaserSprite.setVelocityY(velocityY)
    }

    return {
      velocityX,
      velocityY,
      isMoving,
      direction,
      isOnGround
    }
  }

  /**
   * Establece la velocidad de movimiento
   */
  setSpeed(speed) {
    this.config.speed = speed
  }

  /**
   * Establece la velocidad de salto
   */
  setJumpSpeed(jumpSpeed) {
    this.config.jumpSpeed = jumpSpeed
  }
}
