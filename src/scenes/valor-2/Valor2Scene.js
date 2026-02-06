import { ChallengeScene } from '../../core/scenes/ChallengeScene.js'
import { RobertSprite } from '../../core/sprites/RobertSprite.js'
import { LimpaSprite } from '../../core/sprites/LimpaSprite.js'

/**
 * Valor2Scene - Escena 2D estilo Mario Bros
 * 
 * El jugador controla a Robert que está fijo en el centro de la pantalla.
 * Solo puede caminar hacia adelante o hacia atrás (sin saltos), y el entorno se mueve.
 * Debe encontrar e interactuar con 10 personajes Limpa distribuidos en el mismo nivel.
 */
export class Valor2Scene extends ChallengeScene {
  constructor() {
    super('Valor2', {
      physics: true,
      gravity: { x: 0, y: 0 } // Sin gravedad ya que no hay saltos
    })

    this.interactedLimpas = new Set()
    this.totalLimpas = 10
    this.interactionRange = 100
    this.interactionHintText = null
    
    // Velocidad de movimiento del entorno
    this.currentSpeed = 0
    this.baseSpeed = 200
  }

  preload() {
    super.preload()
    
    // Cargar sprites de Robert
    for (let i = 1; i <= 15; i++) {
      const key = `robert_sprite_${i}`
      const path = `/assets/sprites/characters/robert/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de Limpa
    for (let i = 1; i <= 11; i++) {
      const key = `limpa_sprite_${i}`
      const path = `/assets/sprites/characters/limpa/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprite de plataforma
    this.load.image('sprite_17', '/assets/sprite_17.png')
  }

  create() {
    super.create()

    // Fondo azul cielo
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB)

    // Crear suelo (única plataforma)
    this.createGround()

    // Crear jugador (Robert) fijo en el centro
    this.createPlayer()

    // Crear 10 personajes Limpa distribuidos por el mapa
    this.createLimpas()

    // Configurar acciones
    this.setupActions()

    // Configurar teclas
    this.interactKey = this.input.keyboard.addKey('E')

    // Configurar objetivo
    this.setupObjectives()

    // Texto de hint de interacción
    this.interactionHintText = this.add.text(400, 50, '', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      fontFamily: 'Arial'
    })
    this.interactionHintText.setOrigin(0.5)
    this.interactionHintText.setVisible(false)
    this.interactionHintText.setDepth(1000)
  }

  createGround() {
    this.platforms = this.physics.add.staticGroup()
    const groundTileKey = 'sprite_17'
    const groundY = 568
    const tileWidth = this.textures.exists(groundTileKey) 
      ? this.textures.get(groundTileKey).getSourceImage().width 
      : 800
    const tileHeight = this.textures.exists(groundTileKey)
      ? this.textures.get(groundTileKey).getSourceImage().height
      : 64

    // Crear suelo principal (visible en pantalla)
    if (this.textures.exists(groundTileKey)) {
      this.ground = this.add.image(400, groundY, groundTileKey)
    } else {
      this.ground = this.add.rectangle(400, groundY, 800, 64, 0x8B4513)
    }
    
    this.physics.add.existing(this.ground, true)
    this.ground.body.setSize(tileWidth, tileHeight)
    this.platforms.add(this.ground)

    // Crear tiles de suelo extendidos para el movimiento
    this.groundTiles = []
    const totalDistance = 5000 // Distancia total del mapa
    const tilesNeeded = Math.ceil(totalDistance / tileWidth) + 2
    
    for (let i = 0; i < tilesNeeded; i++) {
      let tile
      if (this.textures.exists(groundTileKey)) {
        tile = this.add.image(
          i * tileWidth + tileWidth/2,
          groundY,
          groundTileKey
        )
      } else {
        tile = this.add.rectangle(
          i * tileWidth + tileWidth/2,
          groundY,
          tileWidth,
          tileHeight,
          0x8B4513
        )
      }
      this.groundTiles.push(tile)
    }
  }


  createPlayer() {
    // Personaje fijo en X (centro de la pantalla) y en Y (suelo)
    const playerX = 400 // Centro horizontal
    const playerY = 518 // Posición en el suelo (568 - altura del sprite/2)
    
    this.player = new RobertSprite(this, playerX, playerY, { scale: 0.3, originY: 0.2 })
    
    // Sin física ya que no hay saltos ni colisiones necesarias
    // El personaje está fijo en posición
    
    // Asegurar que el sprite mire hacia la derecha (adelante) inicialmente
    this.player.phaserSprite.setFlipX(false)
  }

  createLimpas() {
    this.limpas = []
    
    // Todos los Limpas están en el mismo nivel (suelo)
    const groundY = 518 // Mismo nivel que el personaje principal
    const limpaPositions = [
      { x: 600 },
      { x: 1200 },
      { x: 1800 },
      { x: 2400 },
      { x: 3000 },
      { x: 3600 },
      { x: 4200 },
      { x: 4800 },
      { x: 5400 },
      { x: 6000 }
    ]

    limpaPositions.forEach((pos, index) => {
      const limpa = new LimpaSprite(this, pos.x, groundY, { scale: 0.4, originY: 0.2 })
      
      // Sin física necesaria ya que están fijos
      
      // Crear objeto interactuable
      const limpaInteractable = {
        id: `limpa_${index}`,
        sprite: limpa.phaserSprite,
        limpaSprite: limpa,
        x: pos.x,
        y: groundY,
        hintMessage: 'Presiona E para interactuar',
        onInteract: (sprite, interactable) => {
          this.interactWithLimpa(interactable)
          return { success: true }
        }
      }
      
      this.limpas.push(limpaInteractable)
    })
  }

  setupActions() {
    // No necesitamos MovementAction ya que el personaje no se mueve físicamente
    // Solo controlamos el movimiento del entorno
  }

  /**
   * Maneja el movimiento del entorno basado en las teclas presionadas
   */
  handleMovement(keys) {
    const { left, right } = keys
    const isLeftPressed = left?.isDown || false
    const isRightPressed = right?.isDown || false

    // El personaje NO se mueve físicamente, solo controla el movimiento del entorno
    if (isLeftPressed) {
      // Mover entorno hacia la derecha (personaje retrocede visualmente)
      this.currentSpeed = -this.baseSpeed
      this.player.phaserSprite.setFlipX(true) // Mirar hacia atrás
    } else if (isRightPressed) {
      // Mover entorno hacia la izquierda (personaje avanza visualmente)
      this.currentSpeed = this.baseSpeed
      this.player.phaserSprite.setFlipX(false) // Mirar hacia adelante
    } else {
      // Decaer velocidad gradualmente hasta detenerse
      if (this.currentSpeed > 0) {
        this.currentSpeed = Math.max(0, this.currentSpeed - 10)
      } else if (this.currentSpeed < 0) {
        this.currentSpeed = Math.min(0, this.currentSpeed + 10)
      }
    }
  }

  /**
   * Mueve el entorno basado en la velocidad actual
   */
  updateEnvironmentMovement() {
    if (this.currentSpeed === 0) return

    const movement = this.currentSpeed / 60 // Por frame (60 FPS)

    // Mover tiles de suelo
    this.groundTiles.forEach(tile => {
      tile.x -= movement
      
      // Reposicionar tiles que salen de pantalla
      if (tile.x < -400) {
        tile.x += this.groundTiles.length * 800
      } else if (tile.x > 1200) {
        tile.x -= this.groundTiles.length * 800
      }
    })

    // Mover Limpas
    this.limpas.forEach(limpa => {
      limpa.sprite.x -= movement
      limpa.x -= movement // Actualizar posición almacenada
    })
  }

  setupObjectives() {
    // Objetivo: Interactuar con todos los Limpas
    this.addObjective({
      id: 'interact_all_limpas',
      description: `Interactúa con todos los personajes (${this.interactedLimpas.size}/${this.totalLimpas})`,
      condition: () => this.interactedLimpas.size >= this.totalLimpas,
      onComplete: () => {
        this.onChallengeComplete()
      }
    })
  }

  /**
   * Encuentra el Limpa más cercano al jugador
   */
  findNearestLimpa() {
    if (!this.player || !this.player.phaserSprite) return null

    const playerX = this.player.phaserSprite.x // Siempre 400 (centro)
    const playerY = this.player.phaserSprite.y

    let nearest = null
    let nearestDistance = Infinity

    this.limpas.forEach(limpa => {
      // Solo considerar Limpas que no han sido interactuados
      if (this.interactedLimpas.has(limpa.id)) return

      // Calcular distancia considerando que el Limpa puede estar fuera de pantalla
      const distanceX = Math.abs(limpa.x - playerX)
      const distanceY = Math.abs(limpa.y - playerY)
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance <= this.interactionRange && distance < nearestDistance) {
        nearest = limpa
        nearestDistance = distance
      }
    })

    return nearest
  }

  /**
   * Interactúa con un Limpa
   */
  interactWithLimpa(limpaInteractable) {
    if (this.interactedLimpas.has(limpaInteractable.id)) return

    // Marcar como interactuado
    this.interactedLimpas.add(limpaInteractable.id)

    // Reproducir animación de interacción del Limpa
    if (limpaInteractable.limpaSprite && limpaInteractable.limpaSprite.playInteraction) {
      limpaInteractable.limpaSprite.playInteraction()
    }

    // Efecto visual
    this.tweens.add({
      targets: limpaInteractable.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true
    })

    // Actualizar objetivo
    this.updateObjectiveDescription()

    // Verificar si se completó el desafío
    if (this.interactedLimpas.size >= this.totalLimpas) {
      this.completeObjective('interact_all_limpas')
    }
  }

  /**
   * Actualiza la descripción del objetivo
   */
  updateObjectiveDescription() {
    const objective = this.objectives.find(obj => obj.id === 'interact_all_limpas')
    if (objective) {
      objective.description = `Interactúa con todos los personajes (${this.interactedLimpas.size}/${this.totalLimpas})`
    }
  }

  onChallengeComplete() {
    super.onChallengeComplete()
    
    // Mostrar mensaje de éxito
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8)
    overlay.setDepth(1000)

    const successText = this.add.text(400, 250, '¡Felicidades!', {
      fontSize: '36px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    successText.setOrigin(0.5)
    successText.setDepth(1001)

    const messageText = this.add.text(400, 300, 'Has interactuado con todos los personajes', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    })
    messageText.setOrigin(0.5)
    messageText.setDepth(1001)

    // Transición después de 2 segundos
    this.time.delayedCall(2000, () => {
      this.transitionTo('Valor2Completed')
    })
  }

  update() {
    if (!this.player || !this.player.phaserSprite) return

    const keys = {
      left: this.cursors.left,
      right: this.cursors.right,
      e: this.interactKey
    }

    // Manejar movimiento del entorno
    this.handleMovement(keys)

    // Actualizar animación del jugador basada en si se está moviendo
    const isMoving = this.currentSpeed !== 0
    if (this.player.updateAnimation) {
      this.player.updateAnimation(
        isMoving,
        true // Siempre "en el suelo" ya que no hay saltos
      )
    }

    // Mover el entorno basado en el movimiento del jugador
    this.updateEnvironmentMovement()

    // Verificar interacción con Limpas
    const nearestLimpa = this.findNearestLimpa()
    
    if (nearestLimpa) {
      // Mostrar hint en la posición del Limpa (ajustar si está fuera de pantalla)
      const screenX = nearestLimpa.x
      const screenY = nearestLimpa.y
      
      // Solo mostrar si está en pantalla
      if (screenX >= 0 && screenX <= 800) {
        this.interactionHintText.setText(nearestLimpa.hintMessage)
        this.interactionHintText.setPosition(screenX, screenY - 50)
        this.interactionHintText.setVisible(true)
      } else {
        this.interactionHintText.setVisible(false)
      }

      // Verificar si se presiona E
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.interactWithLimpa(nearestLimpa)
      }
    } else {
      // Ocultar hint
      this.interactionHintText.setVisible(false)
    }
  }
}
