import { ChallengeScene } from '../core/scenes/ChallengeScene.js'
import { PlayerSprite } from '../core/sprites/PlayerSprite.js'
import { MovementAction } from '../core/actions/MovementAction.js'
import { InteractionAction } from '../core/actions/InteractionAction.js'
import { PhysicsConfig } from '../core/physics/PhysicsConfig.js'

/**
 * ExplorationScene - Escena de exploración con plataformas
 */
export class ExplorationScene extends ChallengeScene {
  constructor() {
    super('Exploration', {
      physics: true,
      gravity: PhysicsConfig.horizontal().gravity
    })
  }

  preload() {
    super.preload()
    
    // Cargar sprites del personaje
    for (let i = 1; i <= 17; i++) {
      this.load.image(`sprite_${i}`, `/assets/sprite_${i}.png`)
    }
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB)

    // Crear plataformas
    this.createPlatforms()

    // Crear jugador
    this.createPlayer()

    // Crear cofre interactivo
    this.createChest()

    // Configurar acciones
    this.setupActions()

    // Configurar objetivo
    this.addObjective({
      id: 'open_chest',
      description: 'Abre el cofre para continuar',
      condition: () => this.chestOpened,
      onComplete: () => {
        console.log('Cofre abierto!')
      }
    })

    // Crear tecla de interacción
    this.interactKey = this.input.keyboard.addKey('E')
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup()
    const groundTileKey = 'sprite_17'

    if (this.textures.exists(groundTileKey)) {
      const tileTexture = this.textures.get(groundTileKey)
      const tileWidth = tileTexture.getSourceImage().width
      const tileHeight = tileTexture.getSourceImage().height
      const tilesNeeded = Math.ceil(800 / tileWidth)
      const groundY = 600 - (tileHeight / 2)

      for (let i = 0; i < tilesNeeded; i++) {
        const tile = this.add.sprite(i * tileWidth + tileWidth/2, groundY, groundTileKey)
        this.physics.add.existing(tile, true)
        tile.body.setSize(tileWidth, tileHeight)
        this.platforms.add(tile)
      }
    } else {
      // Fallback: rectángulo
      const ground = this.add.rectangle(400, 568, 800, 64, 0x8B4513)
      this.physics.add.existing(ground, true)
      ground.body.setSize(800, 64)
      this.platforms.add(ground)
    }

    // Plataformas adicionales
    this.createAdditionalPlatforms()
  }

  createAdditionalPlatforms() {
    const platforms = [
      { x: 250, y: 480, width: 150 },
      { x: 400, y: 400, width: 150 },
      { x: 550, y: 320, width: 150 },
      { x: 700, y: 240, width: 150 }
    ]

    platforms.forEach(platform => {
      const groundTileKey = 'sprite_17'
      if (this.textures.exists(groundTileKey)) {
        const tileTexture = this.textures.get(groundTileKey)
        const tileWidth = tileTexture.getSourceImage().width
        const tileHeight = tileTexture.getSourceImage().height
        const tilesNeeded = Math.ceil(platform.width / tileWidth)

        for (let i = 0; i < tilesNeeded; i++) {
          const tile = this.add.sprite(
            platform.x - platform.width/2 + (i * tileWidth) + tileWidth/2,
            platform.y,
            groundTileKey
          )
          this.physics.add.existing(tile, true)
          tile.body.setSize(tileWidth, tileHeight)
          this.platforms.add(tile)
        }
      } else {
        const platformObj = this.add.rectangle(platform.x, platform.y, platform.width, 64, 0x8B4513)
        this.physics.add.existing(platformObj, true)
        platformObj.body.setSize(platform.width, 64)
        this.platforms.add(platformObj)
      }
    })
  }

  createPlayer() {
    this.player = new PlayerSprite(this, 50, 0)
    this.physics.add.collider(this.player.phaserSprite, this.platforms)
    
    // Desactivar gravedad temporalmente para posicionamiento
    this.player.phaserSprite.body.setAllowGravity(false)
    this.time.delayedCall(150, () => {
      this.player.phaserSprite.body.setAllowGravity(true)
    })
  }

  createChest() {
    // Crear cofre visual
    const chestGraphics = this.add.graphics()
    chestGraphics.fillStyle(0x8B4513, 1)
    chestGraphics.fillRect(0, 0, 60, 40)
    chestGraphics.lineStyle(2, 0x654321, 1)
    chestGraphics.strokeRect(0, 0, 60, 40)
    chestGraphics.lineStyle(3, 0x654321, 1)
    chestGraphics.lineBetween(0, 20, 60, 20)
    chestGraphics.fillStyle(0xFFD700, 1)
    chestGraphics.fillRect(5, 5, 50, 10)
    chestGraphics.fillRect(5, 25, 50, 10)
    chestGraphics.fillCircle(30, 20, 5)
    chestGraphics.generateTexture('chest', 60, 40)
    chestGraphics.destroy()

    this.chest = this.add.sprite(700, 200, 'chest')
    this.chest.setDepth(100)

    // Objeto interactuable
    this.chestInteractable = {
      sprite: this.chest,
      x: 700,
      y: 200,
      hintMessage: 'Presiona E para abrir',
      onInteract: (sprite, interactable) => {
        this.openChest()
        return { success: true }
      }
    }

    this.chestOpened = false
  }

  setupActions() {
    // Acción de movimiento
    this.movementAction = new MovementAction({
      speed: 200,
      jumpSpeed: -500
    })

    // Acción de interacción
    this.interactionAction = new InteractionAction({
      interactionKey: 'E',
      interactionRange: 80
    })

    // Asociar acciones al jugador
    this.player.addAction('move', (sprite, keys, isOnGround) => {
      return this.movementAction.execute(sprite, keys, isOnGround)
    })

    this.player.addAction('interact', (sprite, interactables, keys) => {
      return this.interactionAction.execute(sprite, interactables, keys)
    })
  }

  openChest() {
    if (this.chestOpened) return

    this.chestOpened = true
    
    // Animación
    this.tweens.add({
      targets: this.chest,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.completeObjective('open_chest')
        this.time.delayedCall(1000, () => {
          this.transitionTo('Achievement1')
        })
      }
    })
  }

  update() {
    if (!this.player) return

    const keys = {
      left: this.cursors.left,
      right: this.cursors.right,
      up: this.cursors.up,
      space: this.cursors.space || this.input.keyboard.addKey('SPACE'),
      e: this.interactKey
    }

    const isOnGround = this.player.phaserSprite.body.touching.down
    const movementState = this.player.executeAction('move', keys, isOnGround)

    // Actualizar animación
    if (this.player.updateAnimation) {
      this.player.updateAnimation(
        movementState.isMoving,
        isOnGround,
        movementState.velocityX
      )
    }

    // Interacción (solo si no está abierto)
    if (!this.chestOpened && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const result = this.player.executeAction('interact', [this.chestInteractable], keys)
      if (result && result.success) {
        // La interacción fue exitosa
      }
    }

    // Actualizar hint de interacción
    if (!this.chestOpened) {
      this.interactionAction.updateHint(this.player, this.chestInteractable)
    } else if (this.interactionAction.hintText) {
      this.interactionAction.hintText.setVisible(false)
    }
  }
}
