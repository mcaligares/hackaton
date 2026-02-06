import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * IntroStoryScene - Historia introductoria
 */
export class IntroStoryScene extends PresentationScene {
  constructor() {
    super('IntroStory', {
      autoAdvance: true,
      advanceDelay: 4000
    })
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x2c3e50)

    // Agregar diálogos
    this.addDialog({
      text: 'Bienvenido al mundo de Hackaton...',
      speaker: 'Narrador',
      duration: 3000
    })

    this.addDialog({
      text: 'Tu misión es explorar y derrotar a los guardianes.',
      speaker: 'Narrador',
      duration: 3000
    })

    this.addDialog({
      text: '¡Buena suerte!',
      speaker: 'Narrador',
      duration: 2000
    })

    // Iniciar diálogos
    this.startDialogs()

    // Configurar entrada para avanzar manualmente
    this.setupDialogInput()

    // Auto-transición después de todos los diálogos
    this.time.delayedCall(10000, () => {
      this.transitionTo('Tutorial')
    })
  }

  onDialogsComplete() {
    super.onDialogsComplete()
    this.transitionTo('Tutorial')
  }
}
