/**
 * BaseScene - Clase base para todas las escenas del juego
 * 
 * Proporciona funcionalidad común para:
 * - Carga de assets
 * - Configuración de física
 * - Manejo de entrada
 * - Transiciones entre escenas
 */
export class BaseScene extends Phaser.Scene {
  constructor(key, config = {}) {
    super({ key })
    this.config = {
      physics: config.physics !== false,
      gravity: config.gravity || { x: 0, y: 800 },
      ...config
    }
  }

  /**
   * Preload - Carga de assets
   * Debe ser sobrescrito por las subclases
   */
  preload() {
    // Cargar assets comunes si es necesario
    this.loadCommonAssets()
  }

  /**
   * Carga assets comunes a todas las escenas
   */
  loadCommonAssets() {
    // Puede ser sobrescrito para cargar assets compartidos
  }

  /**
   * Create - Inicialización de la escena
   * Debe ser sobrescrito por las subclases
   */
  create() {
    // Configurar física si está habilitada
    if (this.config.physics && this.physics) {
      this.physics.world.gravity.y = this.config.gravity.y
      this.physics.world.gravity.x = this.config.gravity.x
    }

    // Configurar entrada común
    this.setupInput()
  }

  /**
   * Configura el sistema de entrada común
   */
  setupInput() {
    // Teclas comunes (pueden ser extendidas)
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D')
  }

  /**
   * Update - Loop principal
   * Debe ser sobrescrito por las subclases
   */
  update() {
    // Implementación base vacía
  }

  /**
   * Transición a otra escena
   * @param {string} sceneKey - Clave de la escena destino
   * @param {Object} data - Datos a pasar a la escena destino
   */
  transitionTo(sceneKey, data = {}) {
    this.scene.start(sceneKey, data)
  }

  /**
   * Pausa la escena actual y lanza otra encima
   * @param {string} sceneKey - Clave de la escena a lanzar
   * @param {Object} data - Datos a pasar
   */
  launchScene(sceneKey, data = {}) {
    this.scene.launch(sceneKey, data)
  }

  /**
   * Detiene la escena actual
   */
  stopScene() {
    this.scene.stop()
  }
}
