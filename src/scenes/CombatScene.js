import { ChallengeScene } from '../core/scenes/ChallengeScene.js'
import { PlayerSprite } from '../core/sprites/PlayerSprite.js'
import { EnemySprite } from '../core/sprites/EnemySprite.js'
import { MovementAction } from '../core/actions/MovementAction.js'
import { AttackAction } from '../core/actions/AttackAction.js'
import { PhysicsConfig } from '../core/physics/PhysicsConfig.js'

/**
 * CombatScene - Escena de combate
 */
export class CombatScene extends ChallengeScene {
  constructor() {
    super('Combat', {
      physics: true,
      gravity: PhysicsConfig.horizontal().gravity
    })
  }

  init(data) {
    this.difficulty = data.difficulty || 'facil'
  }

  preload() {
    super.preload()
    
    // Cargar sprites
    for (let i = 1; i <= 17; i++) {
      this.load.image(`sprite_${i}`, `/assets/sprite_${i}.png`)
    }
  }

  create() {
    super.create()

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x2c3e50)

    // Título
    this.add.text(400, 50, `Combate - Nivel: ${this.difficulty.toUpperCase()}`, {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5)

    // Crear plataformas
    this.createPlatforms()

    // Crear jugador y enemigo
    this.createPlayer()
    this.createEnemy()

    // Configurar dificultad
    this.setupDifficulty()

    // Configurar acciones
    this.setupActions()

    // UI de salud
    this.createHealthBars()

    // Configurar objetivo
    this.addObjective({
      id: 'defeat_enemy',
      description: 'Derrota al enemigo',
      condition: () => this.enemyHP <= 0,
      onComplete: () => {
        this.onChallengeComplete()
      }
    })

    // Colisión para ataque
    this.physics.add.overlap(
      this.player.phaserSprite,
      this.enemy.phaserSprite,
      this.handleCollision,
      null,
      this
    )
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
      const ground = this.add.rectangle(400, 550, 800, 100, 0x8B4513)
      this.physics.add.existing(ground, true)
      ground.body.setSize(800, 100)
      this.platforms.add(ground)
    }
  }

  createPlayer() {
    this.player = new PlayerSprite(this, 150, 0)
    this.physics.add.collider(this.player.phaserSprite, this.platforms)
    
    this.player.phaserSprite.body.setAllowGravity(false)
    this.time.delayedCall(150, () => {
      this.player.phaserSprite.body.setAllowGravity(true)
    })
  }

  createEnemy() {
    this.enemy = new EnemySprite(this, 650, 0)
    this.physics.add.collider(this.enemy.phaserSprite, this.platforms)
    
    this.enemy.phaserSprite.body.setAllowGravity(false)
    this.time.delayedCall(150, () => {
      this.enemy.phaserSprite.body.setAllowGravity(true)
    })

    // IA básica del enemigo
    this.enemyDirection = -1
    this.enemyAttackTimer = 0
  }

  setupDifficulty() {
    const difficulties = {
      facil: {
        playerMaxHP: 100,
        enemyMaxHP: 50,
        enemySpeed: 50,
        enemyDamage: 10,
        playerDamage: 20
      },
      intermedio: {
        playerMaxHP: 80,
        enemyMaxHP: 80,
        enemySpeed: 100,
        enemyDamage: 15,
        playerDamage: 15
      }
    }

    const config = difficulties[this.difficulty] || difficulties.facil
    this.playerMaxHP = config.playerMaxHP
    this.enemyMaxHP = config.enemyMaxHP
    this.enemySpeed = config.enemySpeed
    this.enemyDamage = config.enemyDamage
    this.playerDamage = config.playerDamage

    this.playerHP = this.playerMaxHP
    this.enemyHP = this.enemyMaxHP
  }

  setupActions() {
    this.movementAction = new MovementAction({
      speed: 200,
      jumpSpeed: -500
    })

    this.attackAction = new AttackAction({
      damage: this.playerDamage,
      cooldown: 30,
      attackKey: 'SPACE',
      range: 50
    })

    this.player.addAction('move', (sprite, keys, isOnGround) => {
      return this.movementAction.execute(sprite, keys, isOnGround)
    })
  }

  createHealthBars() {
    this.playerHealthBarBg = this.add.rectangle(150, 30, 200, 20, 0x333333)
    this.playerHealthBar = this.add.rectangle(150, 30, 200, 20, 0x2ecc71)
    this.playerHealthText = this.add.text(150, 30, `HP: ${this.playerHP}/${this.playerMaxHP}`, {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5)

    this.enemyHealthBarBg = this.add.rectangle(650, 30, 200, 20, 0x333333)
    this.enemyHealthBar = this.add.rectangle(650, 30, 200, 20, 0xe74c3c)
    this.enemyHealthText = this.add.text(650, 30, `HP: ${this.enemyHP}/${this.enemyMaxHP}`, {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5)
  }

  updateHealthBars() {
    const playerHealthPercent = this.playerHP / this.playerMaxHP
    this.playerHealthBar.width = 200 * playerHealthPercent
    this.playerHealthBar.x = 150 - (200 * (1 - playerHealthPercent) / 2)
    this.playerHealthText.setText(`HP: ${this.playerHP}/${this.playerMaxHP}`)

    const enemyHealthPercent = this.enemyHP / this.enemyMaxHP
    this.enemyHealthBar.width = 200 * enemyHealthPercent
    this.enemyHealthBar.x = 650 - (200 * (1 - enemyHealthPercent) / 2)
    this.enemyHealthText.setText(`HP: ${this.enemyHP}/${this.enemyMaxHP}`)
  }

  handleCollision(playerSprite, enemySprite) {
    // Ataque del jugador (saltando sobre el enemigo)
    if (this.player.phaserSprite.body.velocity.y > 0 && 
        this.player.y < this.enemy.y - 20 && 
        this.attackAction.canAttack) {
      this.enemyHP -= this.playerDamage
      this.attackAction.currentCooldown = this.attackAction.config.cooldown
      
      // Efecto visual
      this.enemy.phaserSprite.setTint(0xff0000)
      this.time.delayedCall(100, () => {
        this.enemy.phaserSprite.clearTint()
      })

      // Rebote
      this.player.phaserSprite.setVelocityY(-300)
    }
    // Ataque del enemigo
    else if (this.enemy.phaserSprite.body.velocity.y > 0 && 
             this.enemy.y < this.player.y - 20) {
      this.playerHP -= this.enemyDamage
      
      // Efecto visual
      this.player.phaserSprite.setTint(0xff0000)
      this.time.delayedCall(100, () => {
        this.player.phaserSprite.clearTint()
      })
    }

    // Verificar condiciones de victoria/derrota
    if (this.enemyHP <= 0) {
      this.completeObjective('defeat_enemy')
    } else if (this.playerHP <= 0) {
      this.failChallenge()
    }
  }

  updateEnemyAI() {
    const distanceToPlayer = this.enemy.x - this.player.x
    const isOnGround = this.enemy.phaserSprite.body.touching.down

    if (Math.abs(distanceToPlayer) > 50) {
      if (distanceToPlayer > 0) {
        this.enemy.phaserSprite.setVelocityX(-this.enemySpeed)
        this.enemyDirection = -1
        this.enemy.phaserSprite.setFlipX(true)
      } else {
        this.enemy.phaserSprite.setVelocityX(this.enemySpeed)
        this.enemyDirection = 1
        this.enemy.phaserSprite.setFlipX(false)
      }

      if (this.enemy.updateAnimation) {
        this.enemy.updateAnimation(true, isOnGround, this.enemy.phaserSprite.body.velocity.x)
      }
    } else {
      this.enemy.phaserSprite.setVelocityX(0)
      if (this.enemy.updateAnimation) {
        this.enemy.updateAnimation(false, isOnGround)
      }
    }

    if (!isOnGround && this.enemy.updateAnimation) {
      this.enemy.updateAnimation(false, false)
    }

    // Ataque del enemigo (solo en nivel intermedio)
    if (this.difficulty === 'intermedio') {
      this.enemyAttackTimer++
      if (this.enemyAttackTimer > 120 && Math.abs(distanceToPlayer) < 100 && isOnGround) {
        this.enemy.phaserSprite.setVelocityY(-400)
        this.enemy.phaserSprite.setVelocityX(this.enemyDirection * 150)
        this.enemyAttackTimer = 0
      }
    }
  }

  onChallengeComplete() {
    super.onChallengeComplete()
    
    const victoryText = this.add.text(400, 300, '¡VICTORIA!', {
      fontSize: '48px',
      fill: '#2ecc71'
    }).setOrigin(0.5)

    this.add.text(400, 350, 'Presiona ESPACIO para continuar', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', () => {
      this.transitionTo('Achievement2')
    })
  }

  onChallengeFailed() {
    super.onChallengeFailed()
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#e74c3c'
    }).setOrigin(0.5)

    this.add.text(400, 350, 'Presiona ESPACIO para reintentar', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart()
    })
  }

  update() {
    if (!this.player || !this.enemy) return

    const keys = {
      left: this.cursors.left,
      right: this.cursors.right,
      up: this.cursors.up,
      space: this.input.keyboard.addKey('SPACE')
    }

    const isOnGround = this.player.phaserSprite.body.touching.down
    const movementState = this.player.executeAction('move', keys, isOnGround)

    if (this.player.updateAnimation) {
      this.player.updateAnimation(
        movementState.isMoving,
        isOnGround,
        movementState.velocityX
      )
    }

    // Actualizar IA del enemigo
    this.updateEnemyAI()

    // Actualizar cooldown de ataque
    this.attackAction.update()

    // Actualizar barras de salud
    this.updateHealthBars()
  }
}
