import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * MainMenuScene - Pantalla de inicio del juego
 */
export class MainMenuScene extends PresentationScene {
  constructor() {
    super('MainMenu')
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x1a1a1a)

    // Título
    this.add.text(400, 150, 'HACKATON GAME', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Botón de inicio
    const startButton = this.add.rectangle(400, 300, 200, 60, 0x3498db)
    startButton.setInteractive({ useHandCursor: true })
    
    const startText = this.add.text(400, 300, 'INICIAR', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5)

    startButton.on('pointerdown', () => {
      this.transitionTo('IntroStory')
    })

    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x2980b9)
    })

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x3498db)
    })

    // Instrucciones
    this.add.text(400, 450, 'Presiona ESPACIO o haz clic en INICIAR', {
      fontSize: '16px',
      fill: '#888888'
    }).setOrigin(0.5)

    // También permitir inicio con ESPACIO
    this.input.keyboard.once('keydown-SPACE', () => {
      this.transitionTo('IntroStory')
    })
  }
}
