import { PresentationScene } from '../core/scenes/PresentationScene.js'
import { LimpaSprite } from '../core/sprites/LimpaSprite.js'
import { RobertSprite } from '../core/sprites/RobertSprite.js'

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

  preload() {
    super.preload()

    // Cargar sprites de Limpa
    for (let i = 1; i <= 11; i++) {
      const key = `limpa_sprite_${i}`
      const path = `/assets/sprites/characters/limpa/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de Robert
    for (let i = 1; i <= 15; i++) {
      const key = `robert_sprite_${i}`
      const path = `/assets/sprites/characters/robert/sprite_${i}.png`
      this.load.image(key, path)
    }
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x2c3e50)

    // Crear botón SKIP (temporal)
    this.createSkipButton()

    // Crear personajes
    this.createCharacters()

    // Agregar diálogos
    this.addDialog({
      text: 'Dos decadas pasadas, un foro de gaming Allí todo puede suceder o… encontrarse',
      speaker: 'Narrador',
      duration: 4000
    })

    this.addDialog({
      text: 'Robert. Limpa. Un hardware tentador.',
      speaker: 'Narrador',
      duration: 3000
    })

    this.addDialog({
      text: 'Un mensaje. Una conexión. Una idea compartida.',
      speaker: 'Narrador',
      duration: 3500
    })

    this.addDialog({
      text: 'Tenían todas las de perder: Sin planes grandes. Sin agencia formal.',
      speaker: 'Narrador',
      duration: 4000
    })

    this.addDialog({
      text: 'Pero algo los empujaba sin importar los limites: Ganas de crear.',
      speaker: 'Narrador',
      duration: 4000
    })

    this.addDialog({
      text: 'Proyecto tras proyecto… aprendieron, fallaron…. y ….',
      speaker: 'Narrador',
      duration: 4000
    })

    // Iniciar secuencia: Limpa corre, se detiene, luego diálogos
    this.startSequence()

    // Configurar entrada para avanzar manualmente
    this.setupDialogInput()

    // Auto-transición después de todos los diálogos
    this.time.delayedCall(30000, () => {
      this.transitionTo('Valor1Challenge')
    })
  }

  createCharacters() {
    // Posición inicial de Limpa (fuera de la pantalla a la izquierda)
    const limpaStartX = -200
    const limpaY = 400

    // Posición final de Limpa (lado izquierdo de la pantalla)
    const limpaTargetX = 200
    const limpaTargetY = 400

    // Posición de Robert (lado derecho)
    const robertX = 650
    const robertY = 400

    // Verificar que las texturas estén cargadas
    if (!this.textures.exists('limpa_sprite_1')) {
      console.error('❌ Error: limpa_sprite_1 no encontrado')
      return
    }

    if (!this.textures.exists('robert_sprite_1')) {
      console.error('❌ Error: robert_sprite_1 no encontrado')
      return
    }

    // Crear Limpa (sin física)
    this.limpa = new LimpaSprite(this, limpaStartX, limpaY, {
      physics: false
    })
    // Asegurar que Limpa esté por encima del fondo pero debajo de los diálogos
    if (this.limpa.phaserSprite) {
      this.limpa.phaserSprite.setDepth(10)
    }

    // Crear Robert (sin física)
    this.robert = new RobertSprite(this, robertX, robertY, {
      physics: false
    })
    // Asegurar que Robert esté por encima del fondo pero debajo de los diálogos
    if (this.robert.phaserSprite) {
      this.robert.phaserSprite.setDepth(10)
    }

    // Asegurar que estén en el suelo visualmente
    this.limpa.y = limpaY
    this.robert.y = robertY

    // Guardar posiciones objetivo
    this.limpaTargetX = limpaTargetX
    this.limpaTargetY = limpaTargetY
  }

  startSequence() {
    // Iniciar movimiento de Limpa
    this.time.delayedCall(500, () => {
      this.startLimpaMovement()
    })
  }

  startLimpaMovement() {
    // Activar animación de caminar/correr
    if (this.limpa.updateAnimation) {
      this.limpa.updateAnimation(true, true, false)
    }

    // Mover Limpa hacia su posición objetivo
    const distance = Math.abs(this.limpaTargetX - this.limpa.x)
    const movementDuration = 2000 // 2 segundos para llegar

    this.tweens.add({
      targets: this.limpa.phaserSprite,
      x: this.limpaTargetX,
      duration: movementDuration,
      ease: 'Power1',
      onComplete: () => {
        // Cuando llegue, cambiar a animación idle
        if (this.limpa.updateAnimation) {
          this.limpa.updateAnimation(false, true, false)
        }

        // Esperar unos segundos antes de iniciar diálogos
        this.time.delayedCall(2000, () => {
          this.startDialogs()
        })
      }
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
    // Detener todos los diálogos, timers y animaciones
    this.tweens.killAll()
    this.time.removeAllEvents()
    
    // Si Limpa está moviéndose, detenerlo y ponerlo en idle
    if (this.limpa && this.limpa.updateAnimation) {
      this.limpa.updateAnimation(false, true, false)
    }
    
    // Transicionar directamente al desafío Valor1Challenge
    this.transitionTo('Valor1Challenge')
  }
}
