import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * TutorialScene - Enseña controles básicos
 */
export class TutorialScene extends PresentationScene {
  constructor() {
    super('Tutorial')
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x34495e)

    // Título
    this.add.text(400, 100, 'CONTROLES', {
      fontSize: '36px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Instrucciones
    const instructions = [
      'Flechas o WASD: Mover',
      'ESPACIO o W: Saltar',
      'E: Interactuar con objetos',
      'Salta sobre enemigos para atacar'
    ]

    instructions.forEach((text, index) => {
      this.add.text(400, 200 + (index * 50), text, {
        fontSize: '20px',
        fill: '#ecf0f1'
      }).setOrigin(0.5)
    })

    // Botón para continuar
    const continueText = this.add.text(400, 500, 'Presiona ESPACIO para continuar', {
      fontSize: '18px',
      fill: '#3498db'
    }).setOrigin(0.5)

    // Animación de parpadeo
    this.tweens.add({
      targets: continueText,
      alpha: { from: 1, to: 0.3 },
      duration: 1000,
      repeat: -1,
      yoyo: true
    })

    // Continuar con ESPACIO
    this.input.keyboard.once('keydown-SPACE', () => {
      this.transitionTo('Exploration')
    })
  }
}
