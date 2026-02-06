import { BaseScene } from './BaseScene.js'

/**
 * ChallengeScene - Escena base para desafíos del juego
 * 
 * Escenas de desafío incluyen:
 * - Combate
 * - Exploración
 * - Plataformas
 * - Puzzles
 * 
 * Características comunes:
 * - Sistema de objetivos/completitud
 * - Sistema de recompensas
 * - Condiciones de victoria/derrota
 */
export class ChallengeScene extends BaseScene {
  constructor(key, config = {}) {
    super(key, {
      physics: true,
      gravity: { x: 0, y: 800 },
      ...config
    })

    this.objectives = []
    this.completedObjectives = []
    this.rewards = []
    this.isCompleted = false
    this.isFailed = false
  }

  /**
   * Agrega un objetivo a la escena
   * @param {Object} objective - Objetivo con { id, description, condition, onComplete }
   */
  addObjective(objective) {
    this.objectives.push(objective)
  }

  /**
   * Marca un objetivo como completado
   * @param {string} objectiveId - ID del objetivo
   */
  completeObjective(objectiveId) {
    const objective = this.objectives.find(obj => obj.id === objectiveId)
    if (objective && !this.completedObjectives.includes(objectiveId)) {
      this.completedObjectives.push(objectiveId)
      if (objective.onComplete) {
        objective.onComplete()
      }
      this.checkCompletion()
    }
  }

  /**
   * Verifica si todos los objetivos están completados
   */
  checkCompletion() {
    if (this.objectives.length > 0 && 
        this.completedObjectives.length === this.objectives.length) {
      this.onChallengeComplete()
    }
  }

  /**
   * Callback cuando el desafío se completa
   * Debe ser sobrescrito por las subclases
   */
  onChallengeComplete() {
    this.isCompleted = true
    console.log('Challenge completed!')
  }

  /**
   * Marca el desafío como fallido
   */
  failChallenge() {
    this.isFailed = true
    this.onChallengeFailed()
  }

  /**
   * Callback cuando el desafío falla
   * Debe ser sobrescrito por las subclases
   */
  onChallengeFailed() {
    console.log('Challenge failed!')
  }

  /**
   * Agrega una recompensa
   * @param {Object} reward - Recompensa con { type, value }
   */
  addReward(reward) {
    this.rewards.push(reward)
  }

  /**
   * Obtiene todas las recompensas
   */
  getRewards() {
    return this.rewards
  }
}
