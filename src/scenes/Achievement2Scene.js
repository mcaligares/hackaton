import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * Achievement2Scene - Segunda escena de logro
 */
export class Achievement2Scene extends PresentationScene {
  constructor() {
    super('Achievement2')
  }

  init(data) {
    this.achievementData = data || {
      title: '¡Victoria!',
      description: 'Has derrotado al guardián',
      reward: null
    }
  }

  create() {
    super.create()

    // Fondo con efecto
    this.add.rectangle(400, 300, 800, 600, 0x1a1a1a)
    
    const glow = this.add.circle(400, 300, 200, 0x2ecc71, 0.3)
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.3, to: 0.6 },
      scale: { from: 1, to: 1.2 },
      duration: 1000,
      repeat: -1,
      yoyo: true
    })

    // Título del logro
    const title = this.add.text(400, 200, this.achievementData.title, {
      fontSize: '36px',
      fill: '#2ecc71',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)
    
    // Animación de entrada
    title.setAlpha(0)
    title.setScale(0.5)
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    })

    // Descripción
    const description = this.add.text(400, 300, this.achievementData.description, {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: 600 }
    })
    description.setOrigin(0.5)
    description.setAlpha(0)
    
    this.time.delayedCall(300, () => {
      this.tweens.add({
        targets: description,
        alpha: 1,
        duration: 500
      })
    })

    // Botón para continuar
    const continueText = this.add.text(400, 450, 'Presiona ESPACIO para continuar', {
      fontSize: '18px',
      fill: '#3498db'
    })
    continueText.setOrigin(0.5)
    continueText.setAlpha(0)
    
    this.time.delayedCall(800, () => {
      this.tweens.add({
        targets: continueText,
        alpha: 1,
        duration: 500
      })
      
      // Animación de parpadeo
      this.tweens.add({
        targets: continueText,
        alpha: { from: 1, to: 0.3 },
        duration: 1000,
        repeat: -1,
        yoyo: true
      })
    })

    // Continuar con ESPACIO
    this.input.keyboard.once('keydown-SPACE', () => {
      this.transitionTo('EndGame')
    })
  }
}
