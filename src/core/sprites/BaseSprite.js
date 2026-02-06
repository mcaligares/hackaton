/**
 * BaseSprite - Clase base para todos los sprites del juego
 * 
 * Esta clase proporciona una interfaz común para crear sprites con:
 * - Carga de spritesheets o sprites individuales
 * - Sistema de animaciones
 * - Asociación de acciones
 * - Propiedades físicas configurables
 * 
 * Uso:
 *   class Player extends BaseSprite {
 *     constructor(scene, x, y) {
 *       super(scene, x, y, 'player', {
 *         spriteKey: 'player',
 *         scale: 0.4,
 *         physics: true
 *       })
 *     }
 *   }
 */
export class BaseSprite {
  constructor(scene, x, y, spriteKey, config = {}) {
    this.scene = scene
    this.config = {
      spriteKey: spriteKey,
      scale: config.scale || 1,
      physics: config.physics !== false, // Por defecto activa física
      originX: config.originX ?? 0.5,
      originY: config.originY ?? 1.0,
      hitboxWidth: config.hitboxWidth || null, // null = usar tamaño del sprite
      hitboxHeight: config.hitboxHeight || null,
      hitboxOffsetX: config.hitboxOffsetX || 0,
      hitboxOffsetY: config.hitboxOffsetY || 0,
      bounce: config.bounce || 0.2,
      collideWorldBounds: config.collideWorldBounds !== false,
      ...config
    }

    // Verificar que la textura existe antes de crear el sprite
    if (!scene.textures.exists(spriteKey)) {
      console.warn(`⚠️ Texture "${spriteKey}" not found. Available textures:`, Object.keys(scene.textures.list))
      // Intentar usar una textura temporal si no existe
      if (!scene.textures.exists('missing')) {
        const graphics = scene.add.graphics()
        graphics.fillStyle(0xff0000, 1)
        graphics.fillRect(0, 0, 32, 48)
        graphics.generateTexture('missing', 32, 48)
        graphics.destroy()
      }
      spriteKey = 'missing'
    } else {
      console.log(`✅ Creating sprite with texture: "${spriteKey}"`)
    }

    // Crear sprite con o sin física
    if (this.config.physics) {
      this.sprite = scene.physics.add.sprite(x, y, spriteKey)
    } else {
      this.sprite = scene.add.sprite(x, y, spriteKey)
    }
    
    // Verificar que el sprite se creó con la textura correcta
    if (this.sprite.texture.key !== spriteKey) {
      console.error(`❌ Sprite created with wrong texture! Expected: "${spriteKey}", Got: "${this.sprite.texture.key}"`)
      // Forzar la textura correcta
      this.sprite.setTexture(spriteKey)
    }

    // Configurar propiedades básicas
    this.sprite.setScale(this.config.scale)
    this.sprite.setOrigin(this.config.originX, this.config.originY)

    // Configurar hitbox si hay física
    if (this.config.physics && this.sprite.body) {
      this.setupPhysics()
    }

    // Sistema de acciones asociadas
    this.actions = new Map()

    // Sistema de animaciones
    this.animations = new Map()
  }

  /**
   * Configura las propiedades físicas del sprite
   */
  setupPhysics() {
    const spriteWidth = this.sprite.width * this.sprite.scaleX
    const spriteHeight = this.sprite.height * this.sprite.scaleY

    const hitboxWidth = this.config.hitboxWidth || spriteWidth * 0.7
    const hitboxHeight = this.config.hitboxHeight || spriteHeight * 0.8
    const offsetX = this.config.hitboxOffsetX || (spriteWidth - hitboxWidth) / 2
    const offsetY = this.config.hitboxOffsetY || 0

    this.sprite.body.setSize(hitboxWidth, hitboxHeight)
    this.sprite.body.setOffset(offsetX, offsetY)
    this.sprite.setBounce(this.config.bounce)
    this.sprite.setCollideWorldBounds(this.config.collideWorldBounds)
  }

  /**
   * Asocia una acción al sprite
   * @param {string} actionName - Nombre de la acción
   * @param {Function} actionCallback - Función que ejecuta la acción
   */
  addAction(actionName, actionCallback) {
    this.actions.set(actionName, actionCallback)
  }

  /**
   * Ejecuta una acción asociada
   * @param {string} actionName - Nombre de la acción
   * @param {...any} args - Argumentos para la acción
   */
  executeAction(actionName, ...args) {
    const action = this.actions.get(actionName)
    if (action) {
      return action(this, ...args)
    }
    console.warn(`Action "${actionName}" not found for sprite`)
    return null
  }

  /**
   * Registra una animación
   * @param {string} animKey - Clave de la animación
   * @param {Object} animConfig - Configuración de la animación
   */
  registerAnimation(animKey, animConfig) {
    this.animations.set(animKey, animConfig)
    
    // Crear animación en Phaser si no existe
    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: animConfig.frames,
        frameRate: animConfig.frameRate || 10,
        repeat: animConfig.repeat !== undefined ? animConfig.repeat : -1
      })
    }
  }

  /**
   * Reproduce una animación
   * @param {string} animKey - Clave de la animación
   * @param {boolean} ignoreIfPlaying - Si true, no interrumpe si ya está reproduciendo
   */
  playAnimation(animKey, ignoreIfPlaying = false) {
    if (this.animations.has(animKey) && this.scene.anims.exists(animKey)) {
      this.sprite.anims.play(animKey, ignoreIfPlaying)
    } else {
      console.warn(`⚠️ Animation "${animKey}" not found for sprite with texture "${this.sprite.texture.key}"`)
    }
  }

  /**
   * Obtiene la posición X del sprite
   */
  get x() {
    return this.sprite.x
  }

  /**
   * Establece la posición X del sprite
   */
  set x(value) {
    this.sprite.x = value
  }

  /**
   * Obtiene la posición Y del sprite
   */
  get y() {
    return this.sprite.y
  }

  /**
   * Establece la posición Y del sprite
   */
  set y(value) {
    this.sprite.y = value
  }

  /**
   * Obtiene el sprite de Phaser (para acceso directo si es necesario)
   */
  get phaserSprite() {
    return this.sprite
  }

  /**
   * Destruye el sprite y limpia recursos
   */
  destroy() {
    this.actions.clear()
    this.animations.clear()
    if (this.sprite) {
      this.sprite.destroy()
    }
  }
}
