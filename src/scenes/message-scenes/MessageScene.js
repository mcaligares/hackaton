import { PresentationScene } from '../../core/scenes/PresentationScene.js'

/**
 * MessageScene - Escena configurable para mostrar mensajes de información o error
 * 
 * Configuración disponible a través de init():
 * - title: Título del mensaje
 * - description: Descripción del mensaje
 * - actionButtonText: Texto del botón de acción (default: "Continuar")
 * - nextScene: Nombre de la escena siguiente a la que transicionar
 * - backgroundColor: Color de fondo (default: 0x1a1a1a)
 * - titleColor: Color del título (default: '#ffffff')
 * - descriptionColor: Color de la descripción (default: '#cccccc')
 * - buttonColor: Color del botón (default: 0x3498db)
 * - buttonHoverColor: Color del botón al hacer hover (default: 0x2980b9)
 */
export class MessageScene extends PresentationScene {
  constructor(key) {
    super(key, {
      physics: false
    })

    // Valores por defecto
    this.config = {
      title: '',
      description: '',
      actionButtonText: 'Continuar',
      nextScene: null,
      backgroundColor: 0x1a1a1a,
      titleColor: '#ffffff',
      descriptionColor: '#cccccc',
      buttonColor: 0x3498db,
      buttonHoverColor: 0x2980b9,
      titleFontSize: '48px',
      descriptionFontSize: '18px',
      buttonFontSize: '24px'
    }
  }

  /**
   * Inicializa la escena con la configuración proporcionada
   * @param {Object} data - Configuración del mensaje
   */
  init(data = {}) {
    // Actualizar configuración con los datos proporcionados
    this.config = {
      ...this.config,
      ...data
    }
  }

  create() {
    super.create()

    const { width, height } = this.cameras.main
    const centerX = width / 2
    const centerY = height / 2

    // Fondo
    this.add.rectangle(centerX, centerY, width, height, this.config.backgroundColor)

    // Título
    if (this.config.title) {
      this.add.text(centerX, centerY - 150, this.config.title, {
        fontSize: this.config.titleFontSize,
        fill: this.config.titleColor,
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5)
    }

    // Descripción
    if (this.config.description) {
      this.add.text(centerX, centerY, this.config.description, {
        fontSize: this.config.descriptionFontSize,
        fill: this.config.descriptionColor,
        align: 'center',
        wordWrap: { width: width - 100 }
      }).setOrigin(0.5)
    }

    // Botón de acción
    const buttonWidth = 200
    const buttonHeight = 60
    const buttonY = centerY + 150

    const actionButton = this.add.rectangle(
      centerX,
      buttonY,
      buttonWidth,
      buttonHeight,
      this.config.buttonColor
    )
    actionButton.setInteractive({ useHandCursor: true })

    const buttonText = this.add.text(centerX, buttonY, this.config.actionButtonText, {
      fontSize: this.config.buttonFontSize,
      fill: '#ffffff'
    })
    buttonText.setOrigin(0.5)

    // Eventos del botón
    actionButton.on('pointerdown', () => {
      if (this.config.nextScene) {
        this.transitionTo(this.config.nextScene)
      } else {
        console.warn('MessageScene: No nextScene configured')
      }
    })

    actionButton.on('pointerover', () => {
      actionButton.setFillStyle(this.config.buttonHoverColor)
    })

    actionButton.on('pointerout', () => {
      actionButton.setFillStyle(this.config.buttonColor)
    })

    // También permitir avanzar con ESPACIO
    this.input.keyboard.once('keydown-SPACE', () => {
      if (this.config.nextScene) {
        this.transitionTo(this.config.nextScene)
      }
    })
  }
}
