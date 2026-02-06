import { PresentationScene } from '../core/scenes/PresentationScene.js'
import { LimpaSprite } from '../core/sprites/LimpaSprite.js'
import { RobertSprite } from '../core/sprites/RobertSprite.js'

/**
 * AerolabIntroScene - Escena introductoria que cuenta la historia de Aerolab
 * 
 * Limpa se mueve hacia Robert mientras aparece el texto narrativo progresivamente
 */
export class AerolabIntroScene extends PresentationScene {
  constructor() {
    super('AerolabIntro', {
      physics: false // No necesitamos física para esta escena
    })
  }

  preload() {
    super.preload()

    // Cargar sprites de Limpa (1-5 para movimiento, 6-11 para interacción)
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

    // Verificar carga completa
    this.load.on('complete', () => {
      console.log('✅ All sprites loaded')
      const limpaTextures = Object.keys(this.textures.list).filter(k => k.startsWith('limpa_'))
      const robertTextures = Object.keys(this.textures.list).filter(k => k.startsWith('robert_'))
      console.log('Limpa textures:', limpaTextures)
      console.log('Robert textures:', robertTextures)
    })
  }

  create() {
    super.create()

    // Fondo oscuro elegante
    this.add.rectangle(400, 300, 800, 600, 0x0a0a0a)

    // Crear botón SKIP (temporal, se quitará después)
    this.createSkipButton()

    // Crear personajes
    this.createCharacters()

    // Textos narrativos
    this.narrativeTexts = [
      'En un foro de gaming…',
      'dos jugadores estaban a punto de cambiarlo todo.',
      'Limpa buscaba llevar su hardware al límite.',
      'Robert tenía la respuesta.',
      'Un mensaje.',
      'Una conexión.',
      'Una idea compartida.',
      'Sin planes grandes.',
      'Sin agencia formal.',
      'Solo ganas de crear.',
      'Proyecto tras proyecto…',
      'aprendieron, fallaron y crecieron juntos.',
      'Hasta que entendieron algo:',
      'Esto recién empezaba.',
      'Así nació Aerolab.'
    ]

    // Iniciar secuencia
    this.startSequence()
  }

  createCharacters() {
    // Posición inicial de Limpa (izquierda)
    const limpaStartX = 50
    const limpaY = 400

    // Posición de Robert (derecha)
    const robertX = 650
    const robertY = 400

    // Verificar que las texturas estén cargadas antes de crear los sprites
    if (!this.textures.exists('limpa_sprite_1')) {
      console.error('❌ Error: limpa_sprite_1 no encontrado')
      console.log('Texturas disponibles:', Object.keys(this.textures.list))
      return
    }

    if (!this.textures.exists('robert_sprite_1')) {
      console.error('❌ Error: robert_sprite_1 no encontrado')
      console.log('Texturas disponibles:', Object.keys(this.textures.list))
      return
    }

    console.log('✅ Texturas verificadas correctamente')
    console.log('limpa_sprite_1 existe:', this.textures.exists('limpa_sprite_1'))
    console.log('robert_sprite_1 existe:', this.textures.exists('robert_sprite_1'))

    // Crear Limpa (sin física para esta escena)
    console.log('Creating Limpa sprite...')
    this.limpa = new LimpaSprite(this, limpaStartX, limpaY, {
      physics: false
    })
    console.log('Limpa created with texture:', this.limpa.phaserSprite.texture.key)

    // Crear Robert (sin física) - asegurarse de usar la clave correcta
    console.log('Creating Robert sprite...')
    this.robert = new RobertSprite(this, robertX, robertY, {
      physics: false
    })
    console.log('Robert created with texture:', this.robert.phaserSprite.texture.key)

    // Verificar que los sprites se crearon correctamente
    console.log('✅ Sprites creados:')
    console.log('  Limpa sprite key:', this.limpa.phaserSprite.texture.key)
    console.log('  Robert sprite key:', this.robert.phaserSprite.texture.key)
    
    // Verificar que están usando las texturas correctas y corregir si es necesario
    if (this.limpa.phaserSprite.texture.key !== 'limpa_sprite_1') {
      console.warn('⚠️ Limpa está usando una textura incorrecta:', this.limpa.phaserSprite.texture.key)
      this.limpa.phaserSprite.setTexture('limpa_sprite_1')
      console.log('✅ Limpa texture corrected to: limpa_sprite_1')
    }
    if (this.robert.phaserSprite.texture.key !== 'robert_sprite_1') {
      console.warn('⚠️ Robert está usando una textura incorrecta:', this.robert.phaserSprite.texture.key)
      console.log('Forcing Robert to use robert_sprite_1...')
      this.robert.phaserSprite.setTexture('robert_sprite_1')
      console.log('✅ Robert texture corrected to:', this.robert.phaserSprite.texture.key)
    }

    // Asegurar que estén en el suelo visualmente
    this.limpa.y = limpaY
    this.robert.y = robertY
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

    // Click para saltar intro
    skipButtonBg.on('pointerdown', () => {
      this.skipIntro()
    })

    // También permitir saltar con tecla S
    this.input.keyboard.once('keydown-S', () => {
      this.skipIntro()
    })

    this.skipButton = skipButtonBg
    this.skipButtonText = skipButtonText
  }

  skipIntro() {
    // Detener todas las animaciones y timers
    this.tweens.killAll()
    this.time.removeAllEvents()
    
    // Transicionar directamente al desafío Valor1Challenge
    this.transitionTo('Valor1Challenge')
  }

  startSequence() {
    this.currentTextIndex = 0
    this.textDisplayed = false
    this.movementStarted = false
    this.movementComplete = false

    // Crear texto narrativo (inicialmente invisible)
    this.narrativeText = this.add.text(400, 150, '', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: 700 },
      fontFamily: 'Arial, sans-serif'
    })
    this.narrativeText.setOrigin(0.5)
    this.narrativeText.setAlpha(0)
    this.narrativeText.setDepth(100)

    // Iniciar movimiento después de un breve delay
    // Los textos aparecerán progresivamente durante el movimiento
    this.time.delayedCall(500, () => {
      this.startMovement()
    })
  }

  showNextText() {
    if (this.currentTextIndex >= this.narrativeTexts.length) {
      return
    }

    const text = this.narrativeTexts[this.currentTextIndex]
    
    // Fade out del texto anterior si existe
    if (this.currentTextIndex > 0 && this.narrativeText.alpha > 0) {
      this.tweens.add({
        targets: this.narrativeText,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.narrativeText.setText(text)
          this.fadeInText()
        }
      })
    } else {
      // Primer texto o texto nuevo
      this.narrativeText.setText(text)
      this.fadeInText()
    }
  }

  fadeInText() {
    this.tweens.add({
      targets: this.narrativeText,
      alpha: 1,
      duration: 600,
      ease: 'Power2'
    })
  }

  startMovement() {
    if (this.movementStarted) return
    
    this.movementStarted = true
    const targetX = this.robert.x - 100 // Detenerse antes de Robert
    const distance = Math.abs(targetX - this.limpa.x)
    
    // Configurar tiempos de lectura para cada texto
    const totalTexts = this.narrativeTexts.length
    const minTimePerText = 1800 // 2 segundos por texto
    const totalTextDuration = totalTexts * minTimePerText
    
    // Limpa llega más rápido (en 60% del tiempo total de textos)
    const movementDuration = totalTextDuration * 0.6 // Llega más rápido
    const speed = (distance / (movementDuration / 1000))

    // Actualizar animación de Limpa a walk
    if (this.limpa.updateAnimation) {
      this.limpa.updateAnimation(true, true, false)
    }

    // Programar aparición de textos con tiempo adecuado de lectura
    for (let i = 0; i < totalTexts; i++) {
      const delay = i * minTimePerText
      this.time.delayedCall(delay, () => {
        if (i < totalTexts) {
          this.currentTextIndex = i
          this.showNextText()
        }
      })
    }

    // Variable para controlar si Robert ya reaccionó
    this.robertReacted = false
    const robertX = this.robert.x
    const limpaStartX = this.limpa.x
    const totalDistance = Math.abs(robertX - limpaStartX)
    const distanceToReact = totalDistance * 0.8 // Reaccionar cuando falte 60% del camino (más temprano)

    // Mover Limpa hacia Robert (más rápido)
    this.tweens.add({
      targets: this.limpa.phaserSprite,
      x: targetX,
      duration: movementDuration,
      ease: 'Power1',
      onUpdate: () => {
        // Detectar cuando Limpa está cerca de Robert
        const currentDistance = Math.abs(robertX - this.limpa.phaserSprite.x)
        if (!this.robertReacted && currentDistance <= distanceToReact) {
          this.robertReacted = true
          // Robert ve a Limpa y reacciona - permanece viéndolo
          if (this.robert.setInteractionSprite) {
            this.robert.setInteractionSprite()
          }
        }
      },
      onComplete: () => {
        // Cuando Limpa llega a Robert, esperar un momento para que Robert lo "vea"
        // antes de iniciar la interacción completa
        this.time.delayedCall(800, () => {
          this.startInteraction()
        })
      }
    })
  }


  startInteraction() {
    this.movementComplete = true
    
    // Posiciones iniciales
    const limpaStartX = this.limpa.x
    const robertStartX = this.robert.x
    const centerX = (limpaStartX + robertStartX) / 2
    const startY = this.limpa.y

    // Cambiar a animación de interacción de Limpa
    if (this.limpa.playInteraction) {
      this.limpa.playInteraction()
    } else if (this.limpa.updateAnimation) {
      this.limpa.updateAnimation(false, true, true)
    }

    // Asegurar que Robert esté en sprite_5 (interacción) si no lo está ya
    if (this.robert.phaserSprite.texture.key !== 'robert_sprite_5') {
      if (this.robert.setInteractionSprite) {
        this.robert.setInteractionSprite()
      }
    }

    // SECUENCIA DE INTERACCIÓN DINÁMICA
    
    // 1. Saltar juntos hacia arriba
    this.tweens.add({
      targets: [this.limpa.phaserSprite, this.robert.phaserSprite],
      y: startY - 50,
      duration: 400,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        // 2. Moverse hacia el centro juntos
        this.tweens.add({
          targets: this.limpa.phaserSprite,
          x: centerX - 70,
          duration: 500,
          ease: 'Power2'
        })
        
        this.tweens.add({
          targets: this.robert.phaserSprite,
          x: centerX + 30,
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            // 3. Saltar juntos otra vez cuando se encuentran
            this.tweens.add({
              targets: [this.limpa.phaserSprite, this.robert.phaserSprite],
              y: startY - 60,
              duration: 500,
              ease: 'Power2',
              yoyo: true,
              onComplete: () => {
                // 4. Correr juntos hacia la derecha
                const runDistance = 100
                const runDuration = 800
                
                // Limpa corre
                if (this.limpa.updateAnimation) {
                  this.limpa.updateAnimation(true, true, false)
                }
                this.limpa.phaserSprite.setFlipX(false)
                
                // Robert NO cambia animación aquí - mantiene sprite_5 durante la carrera
                // Solo voltear hacia la derecha
                this.robert.phaserSprite.setFlipX(false)
                
                this.tweens.add({
                  targets: this.limpa.phaserSprite,
                  x: centerX - 30 + runDistance,
                  duration: runDuration,
                  ease: 'Power1'
                })
                
                this.tweens.add({
                  targets: this.robert.phaserSprite,
                  x: centerX + 30 + runDistance,
                  duration: runDuration,
                  ease: 'Power1',
                  onComplete: () => {
                    // 5. Volver al centro y saltar juntos una última vez
                    this.tweens.add({
                      targets: this.limpa.phaserSprite,
                      x: centerX - 30,
                      duration: 800,
                      ease: 'Power2'
                    })
                    
                    this.tweens.add({
                      targets: this.robert.phaserSprite,
                      x: centerX + 30,
                      duration: 600,
                      ease: 'Power2',
                      onComplete: () => {
                        // Saltar juntos final
                        this.tweens.add({
                          targets: [this.limpa.phaserSprite, this.robert.phaserSprite],
                          y: startY - 40,
                          duration: 600,
                          ease: 'Power2',
                          yoyo: true,
                          onComplete: () => {
                            // Volver a idle después de la interacción
                            if (this.limpa.updateAnimation) {
                              this.limpa.updateAnimation(false, true, false)
                            }
                            // Robert puede volver a idle después de la interacción completa
                            // pero solo si no está en modo de interacción
                            if (this.robert.phaserSprite.texture.key !== 'robert_sprite_5') {
                              if (this.robert.updateAnimation) {
                                this.robert.updateAnimation(false, true)
                              }
                            }
                            
                            // Esperar un momento antes de mostrar el botón continuar
                            this.time.delayedCall(6000, () => {
                              this.showContinueButton()
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  showContinueButton() {
    // Crear botón continuar
      const buttonBg = this.add.rectangle(400, 500, 250, 60, 0x3498db)
      buttonBg.setInteractive({ useHandCursor: true })
      buttonBg.setAlpha(0)
      buttonBg.setDepth(200)

      const buttonText = this.add.text(400, 500, 'CONTINUAR', {
        fontSize: '24px',
        fill: '#ffffff',
        fontStyle: 'bold'
      })
      buttonText.setOrigin(0.5)
      buttonText.setAlpha(0)
      buttonText.setDepth(201)

      // Animación de aparición del botón
      this.tweens.add({
        targets: [buttonBg, buttonText],
        alpha: 1,
        duration: 500,
        ease: 'Power2'
      })

      // Efecto hover
      buttonBg.on('pointerover', () => {
        this.tweens.add({
          targets: buttonBg,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200
        })
      })

      buttonBg.on('pointerout', () => {
        this.tweens.add({
          targets: buttonBg,
          scaleX: 1,
          scaleY: 1,
          duration: 200
        })
      })

      // Click para continuar
      buttonBg.on('pointerdown', () => {
        this.transitionTo('Valor1Challenge')
      })

      // También permitir continuar con ESPACIO
      this.input.keyboard.once('keydown-SPACE', () => {
        this.transitionTo('Valor1Challenge')
      })

      this.continueButton = buttonBg
      this.continueButtonText = buttonText
  }
}
