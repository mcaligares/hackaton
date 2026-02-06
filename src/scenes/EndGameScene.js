import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * EndGameScene - Escena final del juego
 */
export class EndGameScene extends PresentationScene {
  constructor() {
    super('EndGame')
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x1a1a1a)

    // Título
    const title = this.add.text(400, 200, '¡FELICIDADES!', {
      fontSize: '48px',
      fill: '#2ecc71',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)
    
    // Animación
    title.setAlpha(0)
    title.setScale(0.5)
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 1000,
      ease: 'Back.easeOut'
    })

    // Mensaje
    const message = this.add.text(400, 300, 'Has completado el juego', {
      fontSize: '24px',
      fill: '#ffffff'
    })
    message.setOrigin(0.5)
    message.setAlpha(0)
    
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: message,
        alpha: 1,
        duration: 500
      })
    })

    // Opciones
    const restartText = this.add.text(400, 450, 'Presiona R para reiniciar', {
      fontSize: '18px',
      fill: '#3498db'
    })
    restartText.setOrigin(0.5)
    restartText.setAlpha(0)
    
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: restartText,
        alpha: 1,
        duration: 500
      })
    })

    // Reiniciar juego
    this.input.keyboard.once('keydown-R', () => {
      // Resetear estado y volver al menú
      if (this.scene.scene.router) {
        this.scene.scene.router.resetState()
      }
      this.transitionTo('MainMenu')
    })

    // También permitir reinicio con ESPACIO después de un delay
    this.time.delayedCall(5000, () => {
      const spaceText = this.add.text(400, 500, 'Presiona ESPACIO para volver al menú', {
        fontSize: '16px',
        fill: '#888888'
      })
      spaceText.setOrigin(0.5)
      
      this.input.keyboard.once('keydown-SPACE', () => {
        if (this.scene.scene.router) {
          this.scene.scene.router.resetState()
        }
        this.transitionTo('MainMenu')
      })
    })
  }
}
