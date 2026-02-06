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

    // Crear botón SKIP (temporal)
    this.createSkipButton()

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
      this.transitionTo('Valor1Challenge')
    })
  }

  onDialogsComplete() {
    super.onDialogsComplete()
    this.transitionTo('Valor1Challenge')
  }

  createSkipButton() {
    // Botón SKIP en la esquina superior derecha
    const skipButtonBg = this.add.rectangle(750, 30, 80, 35, 0x666666, 0.7)
    skipButtonBg.setInteractive({ useHandCursor: true })
    skipButtonBg.setDepth(300)
    skipButtonBg.setStrokeStyle(1, 0xffffff, 0.5)

    const skipButtonText = this.add.text(750, 30, 'SKIP', {
      fontSize: '14px',
      fill: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    })
    skipButtonText.setOrigin(0.5)
    skipButtonText.setDepth(301)

    // Efecto hover
    skipButtonBg.on('pointerover', () => {
      skipButtonBg.setFillStyle(0x888888, 0.9)
      skipButtonBg.setScale(1.05)
    })

    skipButtonBg.on('pointerout', () => {
      skipButtonBg.setFillStyle(0x666666, 0.7)
      skipButtonBg.setScale(1)
    })

    // Click para saltar diálogos
    skipButtonBg.on('pointerdown', () => {
      this.skipDialogs()
    })

    // También permitir saltar con tecla S
    this.input.keyboard.once('keydown-S', () => {
      this.skipDialogs()
    })

    this.skipButton = skipButtonBg
    this.skipButtonText = skipButtonText
  }

  skipDialogs() {
    // Detener todos los diálogos y timers
    this.tweens.killAll()
    this.time.removeAllEvents()
    
    // Transicionar directamente al desafío Valor1Challenge
    this.transitionTo('Valor1Challenge')
  }
}
