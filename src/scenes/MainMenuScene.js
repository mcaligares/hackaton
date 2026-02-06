import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * MainMenuScene - Pantalla de inicio del juego
 */
export class MainMenuScene extends PresentationScene {
  constructor() {
    super('MainMenu')
  }

  preload() {
    super.preload()
    
    // Cargar sprite de Aero
    this.load.image('sprite_aero', '/assets/sprite_aero.png')
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x1a1a1a)

    // Sprite de Aero arriba del título
    if (this.textures.exists('sprite_aero')) {
      const aeroSprite = this.add.sprite(400, 80, 'sprite_aero')
      aeroSprite.setOrigin(0.5)
      // Ajustar escala si es necesario
      aeroSprite.setScale(0.2)
    }

    // Título
    this.add.text(400, 180, 'Aerolab Onboarding', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Descripción
    const description = 'Sabemos que empezar un nuevo trabajo puede traer inquietudes, por eso hemos creado este pequeño juego para que conozcas la historia de Aero y los valores que representa.\n\nTe deseamos suerte y que lo disfrutes!'
    
    this.add.text(400, 280, description, {
      fontSize: '18px',
      fill: '#cccccc',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5)

    // Botón de inicio
    const startButton = this.add.rectangle(400, 420, 200, 60, 0x3498db)
    startButton.setInteractive({ useHandCursor: true })
    
    const startText = this.add.text(400, 420, 'INICIAR', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5)

    startButton.on('pointerdown', () => {
      this.transitionTo('Valor2Intro')
    })

    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x2980b9)
    })

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x3498db)
    })

    // Instrucciones
    this.add.text(400, 520, 'Presiona ESPACIO o haz clic en INICIAR', {
      fontSize: '16px',
      fill: '#888888'
    }).setOrigin(0.5)

    // También permitir inicio con ESPACIO
    this.input.keyboard.once('keydown-SPACE', () => {
      this.transitionTo('Valor2Intro')
    })
  }
}
