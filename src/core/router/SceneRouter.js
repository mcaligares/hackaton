/**
 * SceneRouter - Gestor de escenas y flujo del juego
 * 
 * Maneja:
 * - Orden de las escenas
 * - Transiciones entre escenas
 * - Estado del juego
 * - Persistencia del progreso
 */
export class SceneRouter {
  constructor(config) {
    this.scenes = config.scenes || []
    this.currentSceneIndex = 0
    this.gameState = config.initialState || {}
    this.onSceneChange = config.onSceneChange || null
  }

  /**
   * Obtiene la escena actual
   */
  getCurrentScene() {
    return this.scenes[this.currentSceneIndex]
  }

  /**
   * Avanza a la siguiente escena
   * @param {Object} data - Datos a pasar a la siguiente escena
   */
  nextScene(data = {}) {
    if (this.currentSceneIndex < this.scenes.length - 1) {
      this.currentSceneIndex++
      const nextScene = this.getCurrentScene()
      
      if (this.onSceneChange) {
        this.onSceneChange(nextScene, data)
      }

      return nextScene
    }
    return null
  }

  /**
   * Retrocede a la escena anterior
   */
  previousScene() {
    if (this.currentSceneIndex > 0) {
      this.currentSceneIndex--
      return this.getCurrentScene()
    }
    return null
  }

  /**
   * Va a una escena específica por índice
   * @param {number} index - Índice de la escena
   */
  goToScene(index) {
    if (index >= 0 && index < this.scenes.length) {
      this.currentSceneIndex = index
      return this.getCurrentScene()
    }
    return null
  }

  /**
   * Va a una escena específica por clave
   * @param {string} sceneKey - Clave de la escena
   */
  goToSceneByKey(sceneKey) {
    const index = this.scenes.findIndex(s => s.key === sceneKey)
    if (index !== -1) {
      return this.goToScene(index)
    }
    return null
  }

  /**
   * Obtiene el progreso del juego (0-1)
   */
  getProgress() {
    return this.scenes.length > 0 
      ? (this.currentSceneIndex + 1) / this.scenes.length 
      : 0
  }

  /**
   * Guarda el estado del juego
   */
  saveState() {
    const state = {
      currentSceneIndex: this.currentSceneIndex,
      gameState: this.gameState,
      timestamp: Date.now()
    }
    localStorage.setItem('hackaton-game-state', JSON.stringify(state))
  }

  /**
   * Carga el estado del juego
   */
  loadState() {
    const saved = localStorage.getItem('hackaton-game-state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        this.currentSceneIndex = state.currentSceneIndex || 0
        this.gameState = state.gameState || {}
        return state
      } catch (e) {
        console.error('Error loading game state:', e)
      }
    }
    return null
  }

  /**
   * Resetea el estado del juego
   */
  resetState() {
    this.currentSceneIndex = 0
    this.gameState = {}
    localStorage.removeItem('hackaton-game-state')
  }

  /**
   * Actualiza el estado del juego
   * @param {string} key - Clave del estado
   * @param {any} value - Valor del estado
   */
  updateState(key, value) {
    this.gameState[key] = value
    this.saveState()
  }

  /**
   * Obtiene un valor del estado del juego
   * @param {string} key - Clave del estado
   * @param {any} defaultValue - Valor por defecto
   */
  getState(key, defaultValue = null) {
    return this.gameState[key] !== undefined ? this.gameState[key] : defaultValue
  }
}
