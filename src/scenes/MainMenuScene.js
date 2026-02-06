import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * MainMenuScene - Pantalla de inicio del juego
 */
export class MainMenuScene extends PresentationScene {
  constructor() {
    super('MainMenu')
    
    // Variable para activar/desactivar atajos de escenas (para desarrollo/testing)
    // Cambia a true para mostrar botones de acceso rápido a todas las escenas
    this.SHOW_SCENE_SHORTCUTS = false
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

    // Mostrar atajos de escenas si está activado
    if (this.SHOW_SCENE_SHORTCUTS) {
      this.createSceneShortcuts()
    }
  }

  /**
   * Crea botones de acceso rápido a todas las escenas disponibles
   * Útil para desarrollo y testing
   */
  createSceneShortcuts() {
    // Lista de todas las escenas disponibles
    const allScenes = [
      'MainMenu',
      'AerolabIntro',
      'IntroStory',
      'Valor1Challenge',
      'Tutorial',
      'Exploration',
      'Achievement1',
      'Achievement2',
      'Achievement4',
      'Story1',
      'Combat',
      'EndGame',
      'Valor4Challenge',
      'Valor5Scene',
      'Valor5Intro',
      'Valor5Failed',
      'Valor5Completed'
    ]

    // Guardar referencias a todos los elementos creados
    this.shortcutElements = []

    // Crear fondo semi-transparente para los atajos
    const shortcutsBg = this.add.rectangle(400, 300, 750, 550, 0x000000, 0.85)
    shortcutsBg.setStrokeStyle(2, 0x3498db)
    shortcutsBg.setDepth(1000)
    this.shortcutElements.push(shortcutsBg)

    // Título
    const shortcutsTitle = this.add.text(400, 50, '🔧 ATAJOS DE ESCENAS (DEV MODE)', {
      fontSize: '24px',
      fill: '#3498db',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setDepth(1001)
    this.shortcutElements.push(shortcutsTitle)

    // Crear grid de botones (4 columnas)
    const columns = 4
    const buttonWidth = 160
    const buttonHeight = 40
    const startX = 100
    const startY = 120
    const spacingX = 180
    const spacingY = 50

    allScenes.forEach((sceneKey, index) => {
      const col = index % columns
      const row = Math.floor(index / columns)
      
      const x = startX + (col * spacingX)
      const y = startY + (row * spacingY)

      // Botón
      const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x2c3e50)
      button.setStrokeStyle(1, 0x3498db)
      button.setInteractive({ useHandCursor: true })
      button.setDepth(1001)
      this.shortcutElements.push(button)

      // Texto del botón
      const buttonText = this.add.text(x, y, sceneKey, {
        fontSize: '12px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: buttonWidth - 10 }
      }).setOrigin(0.5).setDepth(1002)
      this.shortcutElements.push(buttonText)

      // Hover effects
      button.on('pointerover', () => {
        button.setFillStyle(0x3498db)
        button.setScale(1.05)
        buttonText.setScale(1.05)
      })

      button.on('pointerout', () => {
        button.setFillStyle(0x2c3e50)
        button.setScale(1)
        buttonText.setScale(1)
      })

      // Click para ir a la escena
      button.on('pointerdown', () => {
        this.transitionTo(sceneKey)
      })
    })

    // Botón para cerrar los atajos
    const closeButton = this.add.rectangle(400, 520, 150, 40, 0xe74c3c)
    closeButton.setStrokeStyle(2, 0xffffff)
    closeButton.setInteractive({ useHandCursor: true })
    closeButton.setDepth(1001)
    this.shortcutElements.push(closeButton)

    const closeText = this.add.text(400, 520, 'CERRAR', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setDepth(1002)
    this.shortcutElements.push(closeText)

    closeButton.on('pointerover', () => {
      closeButton.setFillStyle(0xc0392b)
      closeButton.setScale(1.05)
      closeText.setScale(1.05)
    })

    closeButton.on('pointerout', () => {
      closeButton.setFillStyle(0xe74c3c)
      closeButton.setScale(1)
      closeText.setScale(1)
    })

    closeButton.on('pointerdown', () => {
      // Destruir todos los elementos de atajos
      this.shortcutElements.forEach(element => {
        if (element && element.destroy) {
          element.destroy()
        }
      })
      this.shortcutElements = []
    })
  }
}
