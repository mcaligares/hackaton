import { ChallengeScene } from '../core/scenes/ChallengeScene.js'
import { RobertSprite } from '../core/sprites/RobertSprite.js'
import { LimpaSprite } from '../core/sprites/LimpaSprite.js'
import { MovementAction } from '../core/actions/MovementAction.js'
import { PhysicsConfig } from '../core/physics/PhysicsConfig.js'

/**
 * Valor4ChallengeScene - "We aren't afraid to fuck up"
 * 
 * FAIL FORWARD ARENA
 * 
 * Mecánica principal:
 * - El jugador DEBE perder la primera vez (Limpa tiene arma, Robert no)
 * - Pantalla de derrota con mensaje motivacional
 * - En el segundo intento, ambos tienen armas
 * - Victoria desbloqueada tras superar el miedo al fracaso
 * 
 * Mensaje: "Failure is part of learning. Keep going."
 */
export class Valor4ChallengeScene extends ChallengeScene {
  constructor() {
    super('Valor4Challenge', {
      physics: true,
      gravity: PhysicsConfig.horizontal().gravity
    })

    // Estado del juego
    this.attemptNumber = 1
    this.isFirstAttempt = true
    this.gameOver = false
    this.victory = false
    this.combatStarted = false
    
    // Configuración de combate
    this.playerHP = 100
    this.playerMaxHP = 100
    this.enemyHP = 100
    this.enemyMaxHP = 100
    
    // Velocidades y daños
    this.playerSpeed = 200
    this.enemySpeed = 120
    this.playerDamage = 25
    this.enemyDamage = 35
    
    // Cooldowns de ataque
    this.playerAttackCooldown = 0
    this.enemyAttackCooldown = 0
    this.attackCooldownTime = 60 // frames
    
    // Weapons
    this.playerWeapon = null
    this.enemyWeapon = null
    
    // Partículas y efectos
    this.hitParticles = null
  }

  init(data) {
    // Recuperar el número de intento si viene de un reinicio
    this.attemptNumber = data.attemptNumber || 1
    this.isFirstAttempt = this.attemptNumber === 1
    
    // Resetear estados
    this.gameOver = false
    this.victory = false
    this.combatStarted = false
    this.playerAttackCooldown = 0
    this.enemyAttackCooldown = 0
    
    // AJUSTAR DIFICULTAD SEGÚN INTENTO
    if (this.isFirstAttempt) {
      // Primer intento: Limpa es MUY fuerte, Robert débil (debe perder)
      this.playerHP = 100
      this.playerMaxHP = 100
      this.enemyHP = 150
      this.enemyMaxHP = 150
      this.playerDamage = 15
      this.enemyDamage = 50  // Daño muy alto
      this.playerSpeed = 180
      this.enemySpeed = 160  // Limpa rápida
      this.attackCooldownTime = 60
    } else {
      // Segundo intento+: Robert empoderado, Limpa más débil (puede ganar)
      this.playerHP = 150
      this.playerMaxHP = 150
      this.enemyHP = 80
      this.enemyMaxHP = 80
      this.playerDamage = 35  // Daño alto
      this.enemyDamage = 15   // Daño bajo
      this.playerSpeed = 250  // Boost de velocidad
      this.enemySpeed = 100   // Limpa más lenta
      this.attackCooldownTime = 40  // Ataque más rápido
    }
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

    // Cargar sprites de weapons
    for (let i = 1; i <= 18; i++) {
      const key = `weapon_sprite_${i}`
      const path = `/assets/sprites/weapons/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de burbujas
    for (let i = 1; i <= 7; i++) {
      const key = `bubble_sprite_${i}`
      const path = `/assets/sprites/burbujas/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprite de plataforma
    this.load.image('sprite_17', '/assets/sprite_17.png')
  }

  create() {
    super.create()

    // 1. Crear fondo de arena épico
    this.createArenaBackground()

    // 2. Crear plataforma de combate
    this.createArenaPlatform()

    // 3. Crear jugador (Robert)
    this.createPlayer()

    // 4. Crear enemigo (Limpa)
    this.createEnemy()

    // 5. Crear armas según el intento
    this.createWeapons()

    // 6. Crear UI
    this.createUI()

    // 7. Configurar acciones
    this.setupActions()

    // 8. Mostrar intro según intento
    this.showAttemptIntro()

    // 9. Configurar colisiones
    this.setupCollisions()

    // 10. Configurar objetivo
    this.addObjective({
      id: 'defeat_limpa',
      description: 'Derrota a Limpa en la arena',
      condition: () => this.enemyHP <= 0,
      onComplete: () => {
        this.showVictory()
      }
    })
  }

  createArenaBackground() {
    // Fondo degradado oscuro para arena de combate
    const graphics = this.add.graphics()
    
    // Degradado de fondo (rojo oscuro a negro)
    for (let i = 0; i < 600; i++) {
      const ratio = i / 600
      const r = Math.floor(40 + (20 * (1 - ratio)))
      const g = Math.floor(15 + (10 * (1 - ratio)))
      const b = Math.floor(25 + (15 * (1 - ratio)))
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, i, 800, 1)
    }

    // Agregar efecto de partículas de fuego/chispas en el fondo
    this.createBackgroundParticles()

    // Título de la arena
    const titleText = this.add.text(400, 30, 'FAIL FORWARD ARENA', {
      fontSize: '28px',
      fill: '#ff6b6b',
      fontFamily: 'Impact, Arial Black, sans-serif',
      stroke: '#000000',
      strokeThickness: 4
    })
    titleText.setOrigin(0.5)
    titleText.setDepth(100)

    // Subtítulo con el valor
    const subtitleText = this.add.text(400, 60, 'Valor 4: We aren\'t afraid to fuck up', {
      fontSize: '14px',
      fill: '#ffcc00',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    })
    subtitleText.setOrigin(0.5)
    subtitleText.setDepth(100)
  }

  createBackgroundParticles() {
    // Crear partículas de chispas en el fondo
    const sparkGraphics = this.make.graphics({ x: 0, y: 0, add: false })
    sparkGraphics.fillStyle(0xff6600, 1)
    sparkGraphics.fillCircle(4, 4, 4)
    sparkGraphics.generateTexture('spark', 8, 8)
    sparkGraphics.destroy()

    // Emitter de partículas
    this.backgroundEmitter = this.add.particles(0, 0, 'spark', {
      x: { min: 0, max: 800 },
      y: 600,
      lifespan: 3000,
      speedY: { min: -100, max: -50 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      frequency: 200,
      blendMode: 'ADD'
    })
    this.backgroundEmitter.setDepth(0)
  }

  createArenaPlatform() {
    this.platforms = this.physics.add.staticGroup()
    
    // Posición Y donde empiezan los tiles visuales del suelo (parte superior del tile)
    this.groundTileY = 440
    // Los personajes deben caminar sobre la parte superior del césped (groundTileY)
    this.groundLevel = this.groundTileY

    // Obtener altura del tile para calcular el cuerpo físico
    let tileHeight = 50 // altura por defecto
    const groundTileKey = 'sprite_17'
    if (this.textures.exists(groundTileKey)) {
      const tileTexture = this.textures.get(groundTileKey)
      tileHeight = tileTexture.getSourceImage().height
    }

    // Cuerpo físico del suelo — su parte superior debe estar en groundTileY
    // El cuerpo se posiciona desde su centro, así que: centro = groundTileY + (altura/2)
    const groundBody = this.add.zone(400, this.groundTileY + (tileHeight / 2), 800, tileHeight)
    this.physics.add.existing(groundBody, true) // true = static body
    groundBody.body.setSize(800, tileHeight)
    groundBody.body.setOffset(0, 0)
    this.platforms.add(groundBody)
    
    // DEBUG: Mostrar el hitbox del suelo (quitar después)
    // const debugRect = this.add.rectangle(400, this.groundLevel + 50, 800, 100, 0xff0000, 0.3)
    // debugRect.setDepth(1000)
    
    // Guardar referencia al suelo principal
    this.mainGround = groundBody

    // Agregar tiles visuales en el nivel del suelo
    if (this.textures.exists(groundTileKey)) {
      const tileTexture = this.textures.get(groundTileKey)
      const tileWidth = tileTexture.getSourceImage().width
      const tilesNeeded = Math.ceil(800 / tileWidth) + 1

      for (let i = 0; i < tilesNeeded; i++) {
        const tile = this.add.sprite(i * tileWidth, this.groundTileY, groundTileKey)
        tile.setOrigin(0, 0)
        tile.setDepth(1)
      }
    } else {
      // Fallback visual si no hay tiles
      const visualGround = this.add.rectangle(400, this.groundTileY + 25, 800, 50, 0x4a3728)
      visualGround.setStrokeStyle(2, 0x2d1f14)
      visualGround.setDepth(1)
    }

    // Agregar decoración de arena (bordes)
    this.add.rectangle(0, 300, 20, 600, 0x2d1f14).setOrigin(0, 0.5)
    this.add.rectangle(800, 300, 20, 600, 0x2d1f14).setOrigin(1, 0.5)
  }

  setupCharacterPhysics(sprite) {
    // Con origin(0.5, 1.0) — centro horizontal, parte inferior (pies) como referencia
    const hitboxW = sprite.width * sprite.scaleX * 0.6
    const hitboxH = sprite.height * sprite.scaleY * 0.9
    sprite.body.setSize(hitboxW, hitboxH)
    
    // Offset en coords sin escalar
    // X: centrado horizontalmente
    const offsetX = (sprite.width - hitboxW / sprite.scaleX) / 2
    // Y: desde la parte inferior del sprite (origin 1.0) hasta la parte inferior del hitbox
    // El hitbox debe estar centrado verticalmente en el sprite
    // Con origin (0.5, 1.0), el offset Y es la distancia desde los pies hasta la parte inferior del hitbox
    // Centro del sprite desde abajo: sprite.height / 2
    // Centro del hitbox desde abajo: (hitboxH / sprite.scaleY) / 2
    // Parte inferior del hitbox: centro_sprite - centro_hitbox
    const hitboxHUnscaled = hitboxH / sprite.scaleY
    const offsetY = (sprite.height / 2) - (hitboxHUnscaled / 2)
    sprite.body.setOffset(offsetX, offsetY)

    sprite.setDepth(5)
    sprite.body.setCollideWorldBounds(true)
    sprite.body.setBounce(0)
    sprite.body.setAllowGravity(false)
    sprite.body.setVelocity(0, 0)
  }

  createPlayer() {
    this.player = new RobertSprite(this, 150, this.groundLevel, { scale: 0.5, hitboxOffsetY: 0 })
    const sprite = this.player.phaserSprite
    sprite.setOrigin(0.5, 1.0) // Origin en el centro horizontal y parte inferior (pies)
    // Posicionar para que los pies estén en groundLevel (parte superior del césped)
    sprite.y = this.groundLevel
    this.setupCharacterPhysics(sprite)
    this.playerCollider = this.physics.add.collider(sprite, this.platforms)
  }

  createEnemy() {
    this.enemy = new LimpaSprite(this, 650, this.groundLevel, { scale: 0.4, hitboxOffsetY: 0 })
    const sprite = this.enemy.phaserSprite
    sprite.setOrigin(0.5, 1.0) // Origin en el centro horizontal y parte inferior (pies)
    // Posicionar para que los pies estén en groundLevel (parte superior del césped)
    sprite.y = this.groundLevel
    this.setupCharacterPhysics(sprite)
    this.enemyCollider = this.physics.add.collider(sprite, this.platforms)
    sprite.setFlipX(true)
  }

  createWeapons() {
    // En el primer intento: SOLO Limpa tiene arma (Robert está desarmado)
    // En intentos posteriores: AMBOS tienen armas
    
    if (this.isFirstAttempt) {
      // Primer intento: Robert SIN arma, Limpa CON espada de diamante
      this.createEnemyWeapon()
      // El mensaje de advertencia se muestra en startCombat()
    } else {
      // Segundo intento en adelante: AMBOS con armas
      this.createPlayerWeapon()
      this.createEnemyWeapon()
    }
  }

  createPlayerWeapon() {
    // Robert obtiene la espada dorada (sprite_2)
    this.playerWeapon = this.add.sprite(0, 0, 'weapon_sprite_2')
    this.playerWeapon.setScale(0.4)
    this.playerWeapon.setDepth(10)
    // Empieza mirando a la derecha (origen a la izquierda, filo a la derecha)
    this.playerWeapon.setOrigin(0, 0.5)
    this.playerWeapon.setFlipX(false)
    
    // Efecto de brillo dorado
    this.tweens.add({
      targets: this.playerWeapon,
      alpha: { from: 0.8, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1
    })
  }

  createEnemyWeapon() {
    // Limpa tiene la espada de diamante/hielo (sprite_3) - más poderosa visualmente
    this.enemyWeapon = this.add.sprite(0, 0, 'weapon_sprite_3')
    this.enemyWeapon.setScale(0.4)
    this.enemyWeapon.setDepth(10)
    // Empieza mirando a la izquierda (hacia Robert)
    this.enemyWeapon.setOrigin(1, 0.5)
    this.enemyWeapon.setFlipX(true)
    
    // Efecto de brillo cyan
    this.tweens.add({
      targets: this.enemyWeapon,
      alpha: { from: 0.8, to: 1 },
      tint: { from: 0x88ffff, to: 0xffffff },
      duration: 400,
      yoyo: true,
      repeat: -1
    })
  }

  createUI() {
    // Barra de vida del jugador (Robert) — borde izquierdo en x=50
    this.playerHealthBarBg = this.add.rectangle(150, 90, 200, 20, 0x333333)
    this.playerHealthBarBg.setStrokeStyle(2, 0xffffff)
    this.playerHealthBar = this.add.rectangle(52, 90, 196, 16, 0x27ae60)
    this.playerHealthBar.setOrigin(0, 0.5) // crece desde la izquierda
    this.playerHealthText = this.add.text(150, 90, `ROBERT: ${this.playerHP}`, {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5)

    // Barra de vida del enemigo (Limpa) — borde izquierdo en x=550
    this.enemyHealthBarBg = this.add.rectangle(650, 90, 200, 20, 0x333333)
    this.enemyHealthBarBg.setStrokeStyle(2, 0xffffff)
    this.enemyHealthBar = this.add.rectangle(552, 90, 196, 16, 0xe74c3c)
    this.enemyHealthBar.setOrigin(0, 0.5) // crece desde la izquierda
    this.enemyHealthText = this.add.text(650, 90, `LIMPA: ${this.enemyHP}`, {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5)

    // Indicador de intento
    const attemptText = this.add.text(400, 570, `Intento #${this.attemptNumber}`, {
      fontSize: '16px',
      fill: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5)

    // Instrucciones de control
    const controlsText = this.add.text(400, 590, '← → Mover | ↑ Saltar | ESPACIO Atacar', {
      fontSize: '12px',
      fill: '#666666',
      fontFamily: 'Arial'
    }).setOrigin(0.5)

    // Profundidad de UI
    this.playerHealthBarBg.setDepth(100)
    this.playerHealthBar.setDepth(101)
    this.playerHealthText.setDepth(102)
    this.enemyHealthBarBg.setDepth(100)
    this.enemyHealthBar.setDepth(101)
    this.enemyHealthText.setDepth(102)
  }

  setupActions() {
    // Acción de movimiento para Robert
    this.movementAction = new MovementAction({
      speed: this.playerSpeed,
      jumpSpeed: -450
    })

    // Teclas de ataque (E y clic)
    this.attackKeyE = this.input.keyboard.addKey('E')
    
    // Asociar movimiento al jugador
    this.player.addAction('move', (sprite, keys, isOnGround) => {
      return this.movementAction.execute(sprite, keys, isOnGround)
    })
  }

  setupCollisions() {
    // Colisión entre jugador y enemigo para combate cuerpo a cuerpo
    this.physics.add.overlap(
      this.player.phaserSprite,
      this.enemy.phaserSprite,
      this.handleCombatCollision,
      null,
      this
    )
  }

  showAttemptIntro() {
    if (this.isFirstAttempt) {
      // Primer intento: mostrar intro dramática
      this.showFirstAttemptIntro()
    } else {
      // Segundo intento: mostrar mensaje de empoderamiento
      this.showSecondAttemptIntro()
    }
  }

  showFirstAttemptIntro() {
    // Overlay oscuro
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9)
    overlay.setDepth(200)
    overlay.setInteractive() // Para capturar clics

    // Texto de intro dramático
    const introTitle = this.add.text(400, 80, '¡PREPARATE PARA EL COMBATE!', {
      fontSize: '28px',
      fill: '#ff6b6b',
      fontFamily: 'Impact, Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(201)

    // VS dramático
    const vsText = this.add.text(400, 140, 'ROBERT  vs  LIMPA', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Impact, Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(201)

    // Comparación de armas (muestra la desventaja)
    const weaponCompare = this.add.text(400, 190, 'Puños desnudos    vs    Espada de Hielo', {
      fontSize: '14px',
      fill: '#ffcc00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setDepth(201)

    // Mensaje de advertencia
    const warningText = this.add.text(400, 240, 'Limpa tiene ventaja... ¿Podrás sobrevivir?', {
      fontSize: '16px',
      fill: '#ff8888',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setDepth(201)

    // CONTROLES - Box
    const controlsBox = this.add.rectangle(400, 370, 500, 180, 0x333333, 0.8)
    controlsBox.setStrokeStyle(2, 0x666666)
    controlsBox.setDepth(201)

    const controlsTitle = this.add.text(400, 295, 'CONTROLES', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setDepth(202)

    const controlsText = this.add.text(400, 370, 
      '← → o A D     Mover\n' +
      '↑ o W o ESPACIO     Saltar\n' +
      'E o CLIC     Atacar', {
      fontSize: '16px',
      fill: '#aaffaa',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 12
    }).setOrigin(0.5).setDepth(202)

    // Tip para saltar
    const skipText = this.add.text(400, 480, '[ ESPACIO o CLIC para comenzar ]', {
      fontSize: '16px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(201)

    // Parpadeo del texto de skip
    this.tweens.add({
      targets: skipText,
      alpha: { from: 1, to: 0.4 },
      duration: 600,
      yoyo: true,
      repeat: -1
    })

    // Guardar referencias para destruir
    const introElements = [overlay, introTitle, vsText, weaponCompare, warningText, controlsBox, controlsTitle, controlsText, skipText]
    let introClosed = false

    // Función para cerrar intro y comenzar
    const closeIntroAndStart = () => {
      if (introClosed || this.combatStarted) return // Evitar doble llamada
      introClosed = true
      
      // Remover listeners
      this.input.keyboard.off('keydown-SPACE', closeIntroAndStart)
      overlay.off('pointerdown', closeIntroAndStart)
      
      this.tweens.add({
        targets: introElements,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          introElements.forEach(el => {
            if (el && el.destroy) el.destroy()
          })
          this.startCombat()
        }
      })
    }

    // Permitir saltar con ESPACIO (usando evento global)
    this.input.keyboard.on('keydown-SPACE', closeIntroAndStart)

    // Permitir saltar con CLIC
    overlay.on('pointerdown', closeIntroAndStart)

    // Auto-cerrar después de 3 segundos si no se salta
    this.time.delayedCall(3000, () => {
      if (!introClosed && !this.combatStarted) {
        closeIntroAndStart()
      }
    })
  }

  showSecondAttemptIntro() {
    // Overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9)
    overlay.setDepth(200)
    overlay.setInteractive()

    // Texto de empoderamiento
    const introTitle = this.add.text(400, 80, '¡AHORA ESTÁS LISTO!', {
      fontSize: '28px',
      fill: '#27ae60',
      fontFamily: 'Impact, Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(201)

    const introText = this.add.text(400, 150, 'El fracaso te enseñó.\nAhora tienes tu ESPADA DORADA.\n¡Demuestra lo que aprendiste!', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(201)

    // Power-up indicator
    const powerUpText = this.add.text(400, 230, '⚡ POWER-UP: Respawn + Boost de velocidad ⚡', {
      fontSize: '14px',
      fill: '#ffcc00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(201)

    // CONTROLES - Box
    const controlsBox = this.add.rectangle(400, 350, 500, 160, 0x333333, 0.8)
    controlsBox.setStrokeStyle(2, 0x27ae60)
    controlsBox.setDepth(201)

    const controlsTitle = this.add.text(400, 280, '🎮 CONTROLES', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setDepth(202)

    const controlsText = this.add.text(400, 350, 
      '← → o A D     Mover\n' +
      '↑ o W o ESPACIO     Saltar\n' +
      'E o CLIC     Atacar', {
      fontSize: '16px',
      fill: '#aaffaa',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 12
    }).setOrigin(0.5).setDepth(202)

    // Tip para saltar
    const skipText = this.add.text(400, 470, '[ ESPACIO o CLIC para comenzar ]', {
      fontSize: '16px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(201)

    // Parpadeo del texto de skip
    this.tweens.add({
      targets: skipText,
      alpha: { from: 1, to: 0.4 },
      duration: 600,
      yoyo: true,
      repeat: -1
    })

    // Aplicar boost de velocidad
    this.playerSpeed = 250 // Velocidad aumentada

    // Guardar referencias
    const introElements = [overlay, introTitle, introText, powerUpText, controlsBox, controlsTitle, controlsText, skipText]
    let introClosed = false

    // Función para cerrar intro y comenzar
    const closeIntroAndStart = () => {
      if (introClosed || this.combatStarted) return
      introClosed = true
      
      // Remover listeners
      this.input.keyboard.off('keydown-SPACE', closeIntroAndStart)
      overlay.off('pointerdown', closeIntroAndStart)
      
      this.tweens.add({
        targets: introElements,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          introElements.forEach(el => {
            if (el && el.destroy) el.destroy()
          })
          this.startCombat()
        }
      })
    }

    // Permitir saltar con ESPACIO (usando evento global)
    this.input.keyboard.on('keydown-SPACE', closeIntroAndStart)

    // Permitir saltar con CLIC
    overlay.on('pointerdown', closeIntroAndStart)

    // Auto-cerrar después de 2.5 segundos
    this.time.delayedCall(2500, () => {
      if (!introClosed && !this.combatStarted) {
        closeIntroAndStart()
      }
    })
  }

  showWarningMessage() {
    // Mensaje de advertencia cuando Robert no tiene arma
    const warningText = this.add.text(400, 150, '⚠️ ¡NO TIENES ARMA! ⚠️', {
      fontSize: '24px',
      fill: '#ff0000',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(150)

    // Parpadeo
    this.tweens.add({
      targets: warningText,
      alpha: { from: 1, to: 0.3 },
      duration: 300,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        warningText.destroy()
      }
    })
  }

  startCombat() {
    this.combatStarted = true
    
    // Activar física del jugador
    if (this.player && this.player.phaserSprite && this.player.phaserSprite.body) {
      this.player.phaserSprite.body.setAllowGravity(true)
    }
    
    // Activar física del enemigo
    if (this.enemy && this.enemy.phaserSprite && this.enemy.phaserSprite.body) {
      this.enemy.phaserSprite.body.setAllowGravity(true)
    }
    
    // Configurar clic para atacar
    this.input.on('pointerdown', () => {
      if (this.combatStarted && !this.gameOver) {
        this.playerAttack()
      }
    })
    
    // Mostrar mensaje de advertencia si es el primer intento (sin arma)
    if (this.isFirstAttempt) {
      this.time.delayedCall(1000, () => {
        if (!this.gameOver) {
          this.showWarningMessage()
        }
      })
    }
  }

  handleCombatCollision() {
    // No hacer nada si el combate no ha empezado o ya terminó
    if (!this.combatStarted || this.gameOver || this.victory) return

    // Verificar si el enemigo puede atacar (siempre tiene arma)
    if (this.enemyAttackCooldown <= 0) {
      this.enemyAttack()
    }
  }

  playerAttack() {
    if (!this.playerWeapon || this.playerAttackCooldown > 0 || this.gameOver) return

    // SIEMPRE hacer la animación de ataque
    const facingLeft = this.player.phaserSprite.flipX
    const rotationAmount = facingLeft ? -1.5 : 1.5
    
    const originalRotation = this.playerWeapon.rotation
    this.tweens.add({
      targets: this.playerWeapon,
      rotation: originalRotation + rotationAmount,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    })
    
    // Cooldown siempre se aplica
    this.playerAttackCooldown = this.attackCooldownTime

    // SOLO aplicar daño si está cerca del enemigo
    const distance = Math.abs(this.player.phaserSprite.x - this.enemy.phaserSprite.x)
    const attackRange = 100
    
    if (distance <= attackRange) {
      // Aplicar daño
      this.enemyHP -= this.playerDamage

      // Efecto visual de daño
      this.showDamageEffect(this.enemy.phaserSprite, this.playerDamage)

      // Knockback al enemigo
      const knockbackDir = this.player.phaserSprite.x < this.enemy.phaserSprite.x ? 1 : -1
      this.enemy.phaserSprite.setVelocityX(knockbackDir * 200)

      // Verificar muerte
      if (this.enemyHP <= 0) {
        this.enemyHP = 0
        this.showWinningBubble()
      }
    }
  }

  enemyAttack() {
    if (this.gameOver || this.victory) return

    // Verificar distancia al jugador
    const distance = Math.abs(this.player.phaserSprite.x - this.enemy.phaserSprite.x)
    if (distance > 80) return // Muy lejos

    // Animación de ataque del enemigo - rotar en la dirección correcta
    const facingLeft = this.enemy.phaserSprite.flipX
    const rotationAmount = facingLeft ? -1.5 : 1.5
    
    const originalRotation = this.enemyWeapon.rotation
    this.tweens.add({
      targets: this.enemyWeapon,
      rotation: originalRotation + rotationAmount,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    })

    // Daño aumentado si el jugador no tiene arma (primer intento)
    const damage = this.isFirstAttempt ? this.enemyDamage * 2 : this.enemyDamage

    // Aplicar daño
    this.playerHP -= damage
    this.enemyAttackCooldown = this.attackCooldownTime

    // Efecto visual de daño
    this.showDamageEffect(this.player.phaserSprite, damage)

    // Knockback al jugador
    const knockbackDir = this.enemy.phaserSprite.x < this.player.phaserSprite.x ? 1 : -1
    this.player.phaserSprite.setVelocityX(knockbackDir * 250)

    // Verificar muerte
    if (this.playerHP <= 0) {
      this.playerHP = 0
      this.showDefeat()
    }
  }

  showDamageEffect(sprite, damage) {
    // Flash rojo
    sprite.setTint(0xff0000)
    this.time.delayedCall(100, () => {
      sprite.clearTint()
    })

    // Texto de daño flotante
    const damageText = this.add.text(sprite.x, sprite.y - 50, `-${damage}`, {
      fontSize: '24px',
      fill: '#ff0000',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(150)

    this.tweens.add({
      targets: damageText,
      y: sprite.y - 100,
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy()
    })

    // Shake de cámara
    this.cameras.main.shake(100, 0.01)
  }

  showDefeat() {
    this.gameOver = true

    // Detener al jugador
    if (this.player && this.player.phaserSprite && this.player.phaserSprite.body) {
      this.player.phaserSprite.body.setVelocity(0, 0)
    }

    // Overlay oscuro
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85)
    overlay.setDepth(300)

    // Texto de derrota
    const defeatTitle = this.add.text(400, 180, '¡PERDISTE!', {
      fontSize: '48px',
      fill: '#ff4444',
      fontFamily: 'Impact, Arial Black',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(301)

    // Mensaje motivacional (clave del valor)
    const messageText = this.add.text(400, 280, 'Failure is part of learning.\nKeep going!', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5).setDepth(301)

    // Explicación
    const explanationText = this.add.text(400, 370, 'Aprendiste de tu error.\nAhora tendrás un arma para defenderte.', {
      fontSize: '16px',
      fill: '#aaaaaa',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(301)

    // Botón de reintentar
    const retryButton = this.add.rectangle(400, 460, 250, 60, 0xe74c3c)
    retryButton.setStrokeStyle(3, 0xffffff)
    retryButton.setInteractive({ useHandCursor: true })
    retryButton.setDepth(301)

    const retryText = this.add.text(400, 460, 'VOLVER A INTENTAR', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setDepth(302)

    // Hover effects
    retryButton.on('pointerover', () => {
      retryButton.setFillStyle(0xc0392b)
      retryButton.setScale(1.05)
      retryText.setScale(1.05)
    })

    retryButton.on('pointerout', () => {
      retryButton.setFillStyle(0xe74c3c)
      retryButton.setScale(1)
      retryText.setScale(1)
    })

    retryButton.on('pointerdown', () => {
      // Reiniciar con el siguiente intento
      this.scene.restart({ attemptNumber: this.attemptNumber + 1 })
    })

    // Animación de entrada
    this.tweens.add({
      targets: [defeatTitle, messageText, explanationText],
      alpha: { from: 0, to: 1 },
      y: '+=20',
      duration: 500,
      ease: 'Power2'
    })
  }

  showWinningBubble() {
    // Detener a todos
    if (this.player && this.player.phaserSprite && this.player.phaserSprite.body) {
      this.player.phaserSprite.body.setVelocity(0, 0)
    }
    if (this.enemy && this.enemy.phaserSprite && this.enemy.phaserSprite.body) {
      this.enemy.phaserSprite.body.setVelocity(0, 0)
    }

    // Seleccionar un sprite de bubble aleatorio (1-7)
    const bubbleIndex = Math.floor(Math.random() * 7) + 1
    const bubbleKey = `bubble_sprite_${bubbleIndex}`

    // Crear el bubble sprite sobre Robert
    const bubbleSprite = this.add.sprite(
      this.player.phaserSprite.x,
      this.player.phaserSprite.y - 80,
      bubbleKey
    )
    bubbleSprite.setScale(0)
    bubbleSprite.setDepth(200)

    // Crear el texto dentro del bubble
    const bubbleText = this.add.text(
      this.player.phaserSprite.x,
      this.player.phaserSprite.y - 80,
      'Hahaha..... AI',
      {
        fontSize: '16px',
        fill: '#000000',
        fontFamily: 'Arial Black',
        align: 'center'
      }
    )
    bubbleText.setOrigin(0.5)
    bubbleText.setDepth(201)
    bubbleText.setAlpha(0)

    // Animación de entrada del bubble
    this.tweens.add({
      targets: bubbleSprite,
      scale: 0.6,
      duration: 300,
      ease: 'Back.easeOut'
    })

    this.tweens.add({
      targets: bubbleText,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    })

    // Después de mostrar el bubble, hacer desaparecer a Limpa y completar el objetivo
    this.time.delayedCall(2000, () => {
      // Hacer desaparecer a Limpa
      this.tweens.add({
        targets: this.enemy.phaserSprite,
        alpha: 0,
        y: this.enemy.phaserSprite.y + 50,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          // Destruir el bubble y el texto
          bubbleSprite.destroy()
          bubbleText.destroy()
          // Completar el objetivo
          this.completeObjective('defeat_limpa')
        }
      })
    })
  }

  showVictory() {
    this.victory = true
    this.gameOver = true

    // Detener a todos
    if (this.player && this.player.phaserSprite && this.player.phaserSprite.body) {
      this.player.phaserSprite.body.setVelocity(0, 0)
    }
    if (this.enemy && this.enemy.phaserSprite && this.enemy.phaserSprite.body) {
      this.enemy.phaserSprite.body.setVelocity(0, 0)
    }

    // Si Limpa ya está desapareciendo (alpha < 1), no hacer nada más
    // Si no, hacer desaparecer a Limpa (por si se llama directamente sin pasar por showWinningBubble)
    if (this.enemy && this.enemy.phaserSprite && this.enemy.phaserSprite.alpha >= 1) {
      this.tweens.add({
        targets: this.enemy.phaserSprite,
        alpha: 0,
        y: this.enemy.phaserSprite.y + 50,
        duration: 1000,
        ease: 'Power2'
      })
    }

    // Delay antes de mostrar pantalla de victoria
    this.time.delayedCall(1500, () => {
      this.showVictoryScreen()
    })
  }

  showVictoryScreen() {
    // Overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9)
    overlay.setDepth(300)

    // Confetti effect
    this.createConfetti()

    // Título de victoria
    const victoryTitle = this.add.text(400, 120, '🏆 ¡COMPLETASTE EL DESAFÍO! 🏆', {
      fontSize: '32px',
      fill: '#ffd700',
      fontFamily: 'Impact, Arial Black',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(301)

    // Mensaje del logro
    const achievementTitle = this.add.text(400, 200, 'Desbloqueaste tu valor Aerolaber:', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(301)

    // El valor desbloqueado
    const valorText = this.add.text(400, 260, '"We aren\'t afraid to fuck up"', {
      fontSize: '28px',
      fill: '#ff6b6b',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold italic'
    }).setOrigin(0.5).setDepth(301)

    // Explicación
    const explanationText = this.add.text(400, 340, 'Aprendiste que el fracaso es parte del proceso.\nCada error es una oportunidad de crecer.\n\n¡Eso es ser un verdadero Aerolaber!', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(301)

    // Estadísticas
    const statsText = this.add.text(400, 440, `Intentos necesarios: ${this.attemptNumber}`, {
      fontSize: '14px',
      fill: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(301)

    // Botón continuar
    const continueButton = this.add.rectangle(400, 510, 200, 50, 0x27ae60)
    continueButton.setStrokeStyle(3, 0xffffff)
    continueButton.setInteractive({ useHandCursor: true })
    continueButton.setDepth(301)

    const continueText = this.add.text(400, 510, 'CONTINUAR', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setDepth(302)

    // Hover effects
    continueButton.on('pointerover', () => {
      continueButton.setFillStyle(0x2ecc71)
      continueButton.setScale(1.05)
      continueText.setScale(1.05)
    })

    continueButton.on('pointerout', () => {
      continueButton.setFillStyle(0x27ae60)
      continueButton.setScale(1)
      continueText.setScale(1)
    })

    continueButton.on('pointerdown', () => {
      // Transicionar a la escena de logro
      this.transitionTo('Achievement4')
    })

    // Animación de entrada
    this.tweens.add({
      targets: [victoryTitle, achievementTitle, valorText, explanationText, statsText],
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: 'Power2'
    })
  }

  createConfetti() {
    // Crear textura de confetti
    const confettiColors = [0xff6b6b, 0xffd700, 0x27ae60, 0x3498db, 0xe74c3c, 0x9b59b6]
    
    confettiColors.forEach((color, index) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false })
      graphics.fillStyle(color, 1)
      graphics.fillRect(0, 0, 10, 10)
      graphics.generateTexture(`confetti_${index}`, 10, 10)
      graphics.destroy()
    })

    // Emitter de confetti
    for (let i = 0; i < confettiColors.length; i++) {
      this.add.particles(0, 0, `confetti_${i}`, {
        x: { min: 0, max: 800 },
        y: -20,
        lifespan: 4000,
        speedY: { min: 100, max: 200 },
        speedX: { min: -50, max: 50 },
        rotate: { min: 0, max: 360 },
        scale: { start: 1, end: 0.5 },
        alpha: { start: 1, end: 0.5 },
        frequency: 100,
        quantity: 2
      }).setDepth(350)
    }
  }

  updateHealthBars() {
    // Actualizar barra del jugador (origin 0,0.5 — solo cambiar width)
    const playerHealthPercent = Math.max(0, this.playerHP / this.playerMaxHP)
    this.playerHealthBar.width = 196 * playerHealthPercent
    this.playerHealthText.setText(`ROBERT: ${Math.max(0, this.playerHP)}`)

    // Color de barra según HP
    if (playerHealthPercent < 0.3) {
      this.playerHealthBar.setFillStyle(0xe74c3c)
    } else if (playerHealthPercent < 0.6) {
      this.playerHealthBar.setFillStyle(0xf39c12)
    } else {
      this.playerHealthBar.setFillStyle(0x27ae60)
    }

    // Actualizar barra del enemigo (origin 0,0.5 — solo cambiar width)
    const enemyHealthPercent = Math.max(0, this.enemyHP / this.enemyMaxHP)
    this.enemyHealthBar.width = 196 * enemyHealthPercent
    this.enemyHealthText.setText(`LIMPA: ${Math.max(0, this.enemyHP)}`)
  }

  updateWeaponPositions() {
    // Con origin(0.5, 1.0), sprite.y = parte inferior del personaje (pies)
    // Las manos están aproximadamente a 45% de la altura del sprite desde los pies

    // Actualizar posición del arma del jugador (Robert)
    if (this.playerWeapon && this.player && this.player.phaserSprite) {
      const sprite = this.player.phaserSprite
      const spriteH = sprite.height * sprite.scaleY
      const facingLeft = sprite.flipX

      if (facingLeft) {
        this.playerWeapon.x = sprite.x - 20
        this.playerWeapon.setFlipX(true)
        this.playerWeapon.setOrigin(1, 0.5)
      } else {
        this.playerWeapon.x = sprite.x + 20
        this.playerWeapon.setFlipX(false)
        this.playerWeapon.setOrigin(0, 0.5)
      }
      // Manos aproximadamente a 45% de la altura desde los pies
      this.playerWeapon.y = sprite.y - spriteH * 0.45
    }

    // Actualizar posición del arma del enemigo (Limpa)
    if (this.enemyWeapon && this.enemy && this.enemy.phaserSprite) {
      const sprite = this.enemy.phaserSprite
      const spriteH = sprite.height * sprite.scaleY
      const facingLeft = sprite.flipX

      if (facingLeft) {
        this.enemyWeapon.x = sprite.x - 20
        this.enemyWeapon.setFlipX(true)
        this.enemyWeapon.setOrigin(1, 0.5)
      } else {
        this.enemyWeapon.x = sprite.x + 20
        this.enemyWeapon.setFlipX(false)
        this.enemyWeapon.setOrigin(0, 0.5)
      }
      // Manos aproximadamente a 45% de la altura desde los pies
      this.enemyWeapon.y = sprite.y - spriteH * 0.45
    }
  }

  updateEnemyAI() {
    if (!this.combatStarted || this.gameOver || this.victory) return
    if (!this.enemy || !this.enemy.phaserSprite || !this.enemy.phaserSprite.body) return
    if (!this.player || !this.player.phaserSprite) return

    const distanceToPlayer = this.player.phaserSprite.x - this.enemy.phaserSprite.x
    const absDistance = Math.abs(distanceToPlayer)
    const isOnGround = this.enemy.phaserSprite.body.touching.down || this.enemy.phaserSprite.body.blocked.down

    // DIFICULTAD DIFERENCIADA POR INTENTO
    if (this.isFirstAttempt) {
      // PRIMER INTENTO: Limpa es BRUTAL
      const aggroSpeed = this.enemySpeed * 1.5
      const attackRange = 90
      
      // Perseguir agresivamente
      if (absDistance > attackRange) {
        const direction = distanceToPlayer > 0 ? 1 : -1
        this.enemy.phaserSprite.setVelocityX(aggroSpeed * direction)
        this.enemy.phaserSprite.setFlipX(direction < 0)
        if (this.enemy.updateAnimation) this.enemy.updateAnimation(true, isOnGround)
      } else {
        this.enemy.phaserSprite.setVelocityX(0)
        if (this.enemy.updateAnimation) this.enemy.updateAnimation(false, isOnGround)
        
        // Atacar MUY frecuentemente
        if (this.enemyAttackCooldown <= 0) {
          this.enemyAttack()
          this.enemyAttackCooldown = 30 // Cooldown corto
        }
      }

      // Saltar agresivamente
      if (isOnGround && this.player.phaserSprite.y < this.enemy.phaserSprite.y - 30) {
        this.enemy.phaserSprite.setVelocityY(-400)
      }

      // Dash attacks
      if (absDistance < 200 && absDistance > 80 && isOnGround && Math.random() < 0.03) {
        const dashDir = distanceToPlayer > 0 ? 1 : -1
        this.enemy.phaserSprite.setVelocityX(dashDir * 350)
        this.enemy.phaserSprite.setVelocityY(-150)
        this.tweens.add({
          targets: this.enemy.phaserSprite,
          alpha: { from: 0.5, to: 1 },
          duration: 200
        })
      }
    } else {
      // SEGUNDO INTENTO+: Limpa es DÉBIL y LENTA
      const aggroSpeed = this.enemySpeed * 0.8  // Más lenta
      const attackRange = 60  // Rango menor
      
      // Perseguir lentamente, a veces se detiene
      if (absDistance > attackRange) {
        // A veces se "confunde" y no persigue
        if (Math.random() > 0.1) {  // 90% del tiempo persigue
          const direction = distanceToPlayer > 0 ? 1 : -1
          this.enemy.phaserSprite.setVelocityX(aggroSpeed * direction)
          this.enemy.phaserSprite.setFlipX(direction < 0)
          if (this.enemy.updateAnimation) this.enemy.updateAnimation(true, isOnGround)
        } else {
          // Se detiene un momento
          this.enemy.phaserSprite.setVelocityX(0)
          if (this.enemy.updateAnimation) this.enemy.updateAnimation(false, isOnGround)
        }
      } else {
        this.enemy.phaserSprite.setVelocityX(0)
        if (this.enemy.updateAnimation) this.enemy.updateAnimation(false, isOnGround)
        
        // Atacar MENOS frecuentemente (cooldown largo)
        if (this.enemyAttackCooldown <= 0) {
          this.enemyAttack()
          this.enemyAttackCooldown = 90 // Cooldown MUY largo
        }
      }

      // Casi no salta
      if (isOnGround && this.player.phaserSprite.y < this.enemy.phaserSprite.y - 80) {
        this.enemy.phaserSprite.setVelocityY(-350)
      }
      
      // NO hace dash attacks en segundo intento
    }
  }

  update() {
    if (!this.player || !this.player.phaserSprite || !this.player.phaserSprite.body) return
    if (this.gameOver) return

    // Actualizar cooldowns
    if (this.playerAttackCooldown > 0) this.playerAttackCooldown--
    if (this.enemyAttackCooldown > 0) this.enemyAttackCooldown--

    // Input del jugador - solo si el combate ha empezado
    if (!this.combatStarted) return

    // Combinar cursors + WASD para movimiento
    const keys = {
      left: { isDown: this.cursors.left.isDown || this.wasdKeys.A.isDown },
      right: { isDown: this.cursors.right.isDown || this.wasdKeys.D.isDown },
      up: { isDown: this.cursors.up.isDown || this.wasdKeys.W.isDown },
      space: { isDown: this.input.keyboard.addKey('SPACE').isDown }
    }

    const isOnGround = this.player.phaserSprite.body.touching.down || this.player.phaserSprite.body.blocked.down
    
    // Movimiento
    const movementState = this.movementAction.execute(this.player, keys, isOnGround)

    // Actualizar animación
    if (this.player.updateAnimation) {
      this.player.updateAnimation(movementState.isMoving, isOnGround)
    }

    // Ataque del jugador con tecla E
    if (Phaser.Input.Keyboard.JustDown(this.attackKeyE)) {
      this.playerAttack()
    }

    // Actualizar IA del enemigo
    this.updateEnemyAI()

    // Actualizar posiciones de armas
    this.updateWeaponPositions()

    // Actualizar barras de vida
    this.updateHealthBars()
  }

  onChallengeComplete() {
    super.onChallengeComplete()
    // La transición se maneja en showVictoryScreen
  }
}
