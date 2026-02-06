import { PresentationScene } from '../core/scenes/PresentationScene.js'

/**
 * Achievement4Scene - Escena de logro del Valor 4
 * "We aren't afraid to fuck up"
 */
export class Achievement4Scene extends PresentationScene {
  constructor() {
    super('Achievement4')
  }

  init(data) {
    this.achievementData = data || {
      title: '¡Valor Desbloqueado!',
      valorName: 'We aren\'t afraid to fuck up',
      description: 'Aprendiste que el fracaso es parte del camino al éxito.\nCada error es una oportunidad de aprendizaje.',
      message: 'Failure is part of learning. Keep going.'
    }
  }

  create() {
    super.create()

    // Fondo con gradiente rojo/naranja (colores de fuego/determinación)
    const graphics = this.add.graphics()
    for (let i = 0; i < 600; i++) {
      const ratio = i / 600
      const r = Math.floor(60 - (30 * ratio))
      const g = Math.floor(20 - (10 * ratio))
      const b = Math.floor(30 - (15 * ratio))
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, i, 800, 1)
    }

    // Efecto de glow central (rojo/naranja)
    const glow = this.add.circle(400, 280, 180, 0xff6b6b, 0.2)
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.2, to: 0.4 },
      scale: { from: 1, to: 1.3 },
      duration: 1500,
      repeat: -1,
      yoyo: true
    })

    // Segundo glow más pequeño
    const glow2 = this.add.circle(400, 280, 100, 0xffd700, 0.3)
    this.tweens.add({
      targets: glow2,
      alpha: { from: 0.3, to: 0.5 },
      scale: { from: 1, to: 1.2 },
      duration: 1000,
      repeat: -1,
      yoyo: true,
      delay: 500
    })

    // Icono de trofeo/logro
    const trophyText = this.add.text(400, 100, '🏆', {
      fontSize: '64px'
    }).setOrigin(0.5)

    // Animación del trofeo
    this.tweens.add({
      targets: trophyText,
      y: 90,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Título principal
    const title = this.add.text(400, 170, this.achievementData.title, {
      fontSize: '32px',
      fill: '#ffd700',
      fontFamily: 'Impact, Arial Black, sans-serif',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    // Animación de entrada del título
    title.setAlpha(0)
    title.setScale(0.5)
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut'
    })

    // Nombre del valor
    const valorName = this.add.text(400, 240, `"${this.achievementData.valorName}"`, {
      fontSize: '28px',
      fill: '#ff6b6b',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold italic',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5)

    valorName.setAlpha(0)
    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: valorName,
        alpha: 1,
        duration: 600
      })
    })

    // Descripción
    const description = this.add.text(400, 330, this.achievementData.description, {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: 600 }
    }).setOrigin(0.5)

    description.setAlpha(0)
    this.time.delayedCall(700, () => {
      this.tweens.add({
        targets: description,
        alpha: 1,
        duration: 500
      })
    })

    // Mensaje motivacional
    const messageBox = this.add.rectangle(400, 420, 500, 50, 0x000000, 0.5)
    messageBox.setStrokeStyle(2, 0xffd700)

    const message = this.add.text(400, 420, `💡 "${this.achievementData.message}"`, {
      fontSize: '18px',
      fill: '#ffcc00',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic'
    }).setOrigin(0.5)

    messageBox.setAlpha(0)
    message.setAlpha(0)
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: [messageBox, message],
        alpha: 1,
        duration: 500
      })
    })

    // Botón para continuar
    const continueText = this.add.text(400, 520, '[ ESPACIO para continuar ]', {
      fontSize: '16px',
      fill: '#3498db',
      fontFamily: 'Arial'
    }).setOrigin(0.5)

    continueText.setAlpha(0)
    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: continueText,
        alpha: 1,
        duration: 500
      })

      // Animación de parpadeo
      this.tweens.add({
        targets: continueText,
        alpha: { from: 1, to: 0.4 },
        duration: 800,
        repeat: -1,
        yoyo: true
      })
    })

    // Crear partículas de celebración
    this.createCelebrationParticles()

    // Continuar con ESPACIO - ir a la siguiente escena del juego
    this.input.keyboard.once('keydown-SPACE', () => {
      // Transicionar a la siguiente escena (puede ser el siguiente desafío o historia)
      this.transitionTo('Valor5Intro') // O la escena que corresponda
    })
  }

  createCelebrationParticles() {
    // Crear texturas de partículas
    const colors = [0xff6b6b, 0xffd700, 0xff8c00, 0xffcc00]
    
    colors.forEach((color, index) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false })
      graphics.fillStyle(color, 1)
      graphics.fillCircle(4, 4, 4)
      graphics.generateTexture(`celebration_${index}`, 8, 8)
      graphics.destroy()
    })

    // Emitters de partículas
    colors.forEach((_, index) => {
      this.add.particles(0, 0, `celebration_${index}`, {
        x: { min: 0, max: 800 },
        y: -10,
        lifespan: 5000,
        speedY: { min: 50, max: 100 },
        speedX: { min: -30, max: 30 },
        scale: { start: 0.8, end: 0.2 },
        alpha: { start: 0.8, end: 0 },
        frequency: 300,
        blendMode: 'ADD'
      }).setDepth(100)
    })
  }
}
