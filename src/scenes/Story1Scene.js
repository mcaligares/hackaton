import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * Story1Scene - Primera escena de historia
 */
export class Story1Scene extends PresentationScene {
  constructor() {
    super('Story1', {
      autoAdvance: true,
      advanceDelay: 4000
    })
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x34495e)

    // Agregar diálogos
    this.addDialog({
      text: 'Has encontrado el cofre del guardián...',
      speaker: 'Narrador',
      duration: 3000
    })

    this.addDialog({
      text: 'Ahora debes enfrentarte al guardián del templo.',
      speaker: 'Narrador',
      duration: 3000
    })

    this.addDialog({
      text: '¡Prepárate para el combate!',
      speaker: 'Narrador',
      duration: 2000
    })

    // Iniciar diálogos
    this.startDialogs()

    // Configurar entrada para avanzar manualmente
    this.setupDialogInput()

    // Auto-transición después de todos los diálogos
    this.time.delayedCall(9000, () => {
      this.transitionTo('Combat', { difficulty: 'facil' })
    })
  }

  onDialogsComplete() {
    super.onDialogsComplete()
    this.transitionTo('Combat', { difficulty: 'facil' })
  }
}
