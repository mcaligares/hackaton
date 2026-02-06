/**
 * PhysicsConfig - Configuración del sistema de física
 * 
 * Permite configurar diferentes tipos de física según el tipo de escenario:
 * - Horizontal / Plataformas (side-scroller)
 * - Vista satélite (top-down)
 * - Isométrico
 */
export class PhysicsConfig {
  /**
   * Configuración para escenario horizontal/plataformas
   */
  static horizontal() {
    return {
      gravity: { x: 0, y: 800 },
      worldBounds: true,
      debug: false
    }
  }

  /**
   * Configuración para vista satélite (top-down)
   */
  static topDown() {
    return {
      gravity: { x: 0, y: 0 },
      worldBounds: true,
      debug: false
    }
  }

  /**
   * Configuración para vista isométrica
   */
  static isometric() {
    return {
      gravity: { x: 0, y: 0 },
      worldBounds: true,
      debug: false
    }
  }

  /**
   * Configuración personalizada
   */
  static custom(config) {
    return {
      gravity: config.gravity || { x: 0, y: 800 },
      worldBounds: config.worldBounds !== false,
      debug: config.debug || false,
      ...config
    }
  }
}
