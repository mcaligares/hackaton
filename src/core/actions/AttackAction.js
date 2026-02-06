/**
 * AttackAction - Acción de ataque reutilizable
 * 
 * Maneja el sistema de combate para cualquier sprite
 */
export class AttackAction {
  constructor(config = {}) {
    this.config = {
      damage: config.damage || 10,
      cooldown: config.cooldown || 30, // frames
      attackKey: config.attackKey || 'SPACE',
      attackType: config.attackType || 'melee', // 'melee', 'ranged', 'area'
      range: config.range || 50, // Para ataques melee
      ...config
    }

    this.currentCooldown = 0
    this.canAttack = true
  }

  /**
   * Ejecuta un ataque
   * @param {BaseSprite} attacker - Sprite que ataca
   * @param {BaseSprite|Array<BaseSprite>} target - Sprite(s) objetivo
   * @param {Object} keys - Teclas presionadas
   * @returns {Object|null} Resultado del ataque o null si no se puede atacar
   */
  execute(attacker, target, keys = {}) {
    // Verificar cooldown
    if (this.currentCooldown > 0) {
      this.currentCooldown--
      this.canAttack = false
      return null
    }

    this.canAttack = true

    // Verificar si se presionó la tecla de ataque
    const attackKey = keys[this.config.attackKey] || keys.space
    if (!attackKey) {
      return null
    }
    
    // Verificar si la tecla fue presionada en este frame
    // Nota: Esto debe ser manejado por la escena usando Phaser.Input.Keyboard.JustDown
    // Por ahora, verificamos si la tecla está presionada
    if (!attackKey.isDown) {
      return null
    }

    // Calcular daño
    const targets = Array.isArray(target) ? target : [target]
    const hitTargets = []

    for (const t of targets) {
      if (this.isInRange(attacker, t)) {
        const damage = this.calculateDamage(attacker, t)
        hitTargets.push({
          target: t,
          damage: damage
        })
      }
    }

    if (hitTargets.length > 0) {
      this.currentCooldown = this.config.cooldown
      this.onAttackHit(attacker, hitTargets)
      return {
        success: true,
        targets: hitTargets
      }
    }

    return null
  }

  /**
   * Verifica si el objetivo está en rango
   */
  isInRange(attacker, target) {
    if (!attacker.phaserSprite || !target.phaserSprite) {
      return false
    }

    // Calcular distancia manualmente (sin depender de Phaser global)
    const dx = attacker.x - target.x
    const dy = attacker.y - target.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance <= this.config.range
  }

  /**
   * Calcula el daño del ataque
   * Puede ser sobrescrito para diferentes tipos de ataque
   */
  calculateDamage(attacker, target) {
    return this.config.damage
  }

  /**
   * Callback cuando un ataque impacta
   */
  onAttackHit(attacker, hitTargets) {
    // Efecto visual por defecto
    hitTargets.forEach(({ target }) => {
      if (target.phaserSprite) {
        const originalTint = target.phaserSprite.tint
        target.phaserSprite.setTint(0xff0000)
        attacker.scene.time.delayedCall(100, () => {
          target.phaserSprite.clearTint()
        })
      }
    })
  }

  /**
   * Actualiza el cooldown (debe llamarse cada frame)
   */
  update() {
    if (this.currentCooldown > 0) {
      this.currentCooldown--
    } else {
      this.canAttack = true
    }
  }

  /**
   * Resetea el cooldown
   */
  resetCooldown() {
    this.currentCooldown = 0
    this.canAttack = true
  }
}
