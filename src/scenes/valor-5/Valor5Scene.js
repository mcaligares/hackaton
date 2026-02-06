import { ChallengeScene } from '../../core/scenes/ChallengeScene.js'
import { PlayerSprite } from '../../core/sprites/PlayerSprite.js'
import { PhysicsConfig } from '../../core/physics/PhysicsConfig.js'

/**
 * Valor5Scene - Escena de carrera contra reloj
 * 
 * Mecánica:
 * - Personaje fijo en X, el entorno se mueve hacia atrás
 * - Presionar espacio repetidamente aumenta la velocidad
 * - Saltar con flecha arriba
 * - Obstáculos hacen perder momentum
 * - Boosts aceleran temporalmente
 * - Termina al llegar al punto B o al acabarse el tiempo
 */
export class Valor5Scene extends ChallengeScene {
  constructor() {
    super('Valor5', {
      physics: true,
      gravity: PhysicsConfig.horizontal().gravity
    })

    // Configuración del juego (puede ser pasado por init())
    this.config = {
      timeLimit: 30000, // 30 segundos en ms (configurable)
      distanceToB: 10000, // Distancia del punto A al B en px
      baseSpeed: 50, // Velocidad base al presionar espacio
      maxSpeed: 800, // Velocidad máxima alcanzable
      speedIncrement: 10, // Incremento de velocidad por presión de espacio
      speedDecay: 50, // Decaimiento de velocidad por segundo cuando no se presiona
      jumpSpeed: -500, // Velocidad de salto
      boostMultiplier: 1.5, // Multiplicador de velocidad del boost
      boostDuration: 2000, // Duración del boost en ms
      obstaclePenalty: 0.7, // Porcentaje de velocidad que se pierde al chocar (0-1) - ahora reduce considerablemente
      totalObstacles: 20,
    }

    // Estado del juego
    this.currentSpeed = 0
    this.distanceTraveled = 0
    this.timeRemaining = 0
    this.isGameOver = false
    this.isBoostActive = false
    this.boostEndTime = 0
    this.lastSpacePress = 0
    this.spacePressInterval = 0 // Tiempo entre presiones de espacio
  }

  init(data = {}) {
    // Permitir configurar parámetros desde fuera
    if (data.timeLimit) this.config.timeLimit = data.timeLimit
    if (data.distanceToB) this.config.distanceToB = data.distanceToB
    this.timeRemaining = this.config.timeLimit
  }

  preload() {
    super.preload()
    
    // Cargar sprites del personaje (excluyendo sprite_5 que mira hacia la izquierda)
    for (let i = 1; i <= 17; i++) {
      if (i !== 5) { // No cargar sprite_5 (mira hacia la izquierda)
        this.load.image(`sprite_${i}`, `/assets/sprite_${i}.png`)
      }
    }
  }

  create() {
    super.create()

    // Reinicializar estado del juego (por si se reinició)
    this.currentSpeed = 0
    this.distanceTraveled = 0
    this.timeRemaining = this.config.timeLimit
    this.isGameOver = false
    this.isBoostActive = false
    this.boostEndTime = 0
    this.lastSpacePress = 0
    this.spacePressInterval = 0

    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB)

    // Crear suelo
    this.createGround()

    // Crear jugador (fijo en X)
    this.createPlayer()

    // Crear obstáculos primero (los boosts necesitan saber dónde están)
    this.createObstacles()

    // Crear boosts después (para evitar colisiones con obstáculos)
    this.createBoosts()

    // Crear punto B (meta)
    this.createFinishLine()

    // UI
    this.createUI()

    // Configurar entrada
    this.setupInput()

    // Configurar objetivo
    this.addObjective({
      id: 'reach_finish',
      description: 'Llega al punto B antes de que se acabe el tiempo',
      condition: () => this.distanceTraveled >= this.config.distanceToB,
      onComplete: () => {
        this.onVictory()
      }
    })

    // Iniciar reloj
    this.startTimer()
  }

  createGround() {
    this.ground = this.add.rectangle(400, 568, 800, 64, 0x8B4513)
    this.physics.add.existing(this.ground, true)
    this.ground.body.setSize(800, 64)
    
    // Crear grupo de plataformas para colisiones
    this.platforms = this.physics.add.staticGroup()
    this.platforms.add(this.ground)

    // Crear suelo extendido para el movimiento
    this.groundTiles = []
    const tileWidth = 800
    const tilesNeeded = Math.ceil(this.config.distanceToB / tileWidth) + 2
    
    for (let i = 0; i < tilesNeeded; i++) {
      const tile = this.add.rectangle(
        i * tileWidth + tileWidth/2,
        568,
        tileWidth,
        64,
        0x8B4513
      )
      this.groundTiles.push(tile)
    }
  }

  createPlayer() {
    // Personaje fijo en X (centro de la pantalla)
    const playerX = 150
    const playerY = 0
    
    this.player = new PlayerSprite(this, playerX, playerY)
    this.physics.add.collider(this.player.phaserSprite, this.platforms)
    
    // Asegurar que el sprite siempre mire hacia la derecha (adelante)
    this.player.phaserSprite.setFlipX(false)
    
    // Desactivar gravedad temporalmente para posicionamiento
    this.player.phaserSprite.body.setAllowGravity(false)
    this.time.delayedCall(150, () => {
      this.player.phaserSprite.body.setAllowGravity(true)
    })
    
    // Asegurar que el jugador tenga colisiones habilitadas
    this.player.phaserSprite.body.setCollideWorldBounds(false)
  }

  createObstacles() {
    // Crear grupo estático de física (como en ExplorationScene)
    this.obstacles = this.physics.add.staticGroup()
    
    // Distribuir obstáculos de forma aleatoria a lo largo de toda la distancia hasta el punto B
    const numObstacles = this.config.totalObstacles || 12 // Número de obstáculos totales
    const startX = 300 // Posición inicial (después del punto de inicio)
    const endX = this.config.distanceToB - 200 // Posición final (antes del punto B)
    const minSpacing = 150 // Espaciado mínimo entre obstáculos para evitar agrupaciones
    
    // Definir las 3 posiciones de obstáculos:
    // 1. En el suelo (personaje necesita saltar para esquivar) - Y = 520
    // 2. En el aire (personaje no necesita saltar, puede pasar por debajo) - Y = 350-400
    // 3. Poco elevado del suelo (personaje necesita saltar) - Y = 480-500
    const obstacleTypes = [
      { name: 'suelo', y: 520 },           // En el suelo
      { name: 'aire', y: Phaser.Math.Between(350, 400) }, // En el aire (aleatorio dentro del rango)
      { name: 'elevado', y: Phaser.Math.Between(480, 500) } // Poco elevado
    ]
    
    // Crear array de posiciones X aleatorias
    const obstaclePositions = []
    let lastX = startX - minSpacing // Para el primer obstáculo
    
    for (let i = 0; i < numObstacles; i++) {
      // Calcular posición X aleatoria asegurando espaciado mínimo
      const minX = lastX + minSpacing
      const maxX = startX + ((endX - startX) / numObstacles) * (i + 1)
      const x = Phaser.Math.Between(minX, Math.min(maxX, endX))
      
      // Seleccionar tipo de obstáculo aleatorio
      const obstacleType = Phaser.Utils.Array.GetRandom(obstacleTypes)
      let y = obstacleType.y
      
      // Si es tipo "aire", generar Y aleatorio cada vez
      if (obstacleType.name === 'aire') {
        y = Phaser.Math.Between(350, 400)
      } else if (obstacleType.name === 'elevado') {
        y = Phaser.Math.Between(480, 500)
      }
      
      obstaclePositions.push({ x, y, type: obstacleType.name })
      lastX = x
    }
    
    // Crear obstáculos con posiciones aleatorias
    obstaclePositions.forEach(pos => {
      const obstacle = this.add.rectangle(pos.x, pos.y, 60, 60, 0xFF0000)
      this.physics.add.existing(obstacle, true)
      obstacle.body.setSize(60, 60)
      obstacle.setData('type', 'obstacle')
      obstacle.setData('obstacleType', pos.type) // Guardar el tipo para referencia
      this.obstacles.add(obstacle)
    })

    // Guardar posiciones de obstáculos para evitar que boosts colisionen con ellos
    this.obstaclePositions = obstaclePositions

    // Colisión con obstáculos
    this.physics.add.overlap(
      this.player.phaserSprite,
      this.obstacles,
      this.onObstacleHit,
      null,
      this
    )
  }

  createBoosts() {
    // Crear grupo estático de física (como en ExplorationScene)
    this.boosts = this.physics.add.staticGroup()
    
    // Distribuir boosts aleatoriamente, asegurando que no colisionen con obstáculos
    const numBoosts = 8 // Número de boosts totales
    const startX = 400 // Posición inicial
    const endX = this.config.distanceToB - 300 // Posición final (antes del punto B)
    const minDistanceFromObstacle = 200 // Distancia mínima de un boost a un obstáculo
    
    // Posiciones posibles para boosts:
    // - En el suelo: Y = 480-500
    // - En el aire: Y = 350-400
    const boostTypes = [
      { name: 'suelo', y: Phaser.Math.Between(480, 500) },
      { name: 'aire', y: Phaser.Math.Between(350, 400) }
    ]
    
    const boostPositions = []
    let attempts = 0
    const maxAttempts = numBoosts * 20 // Límite de intentos para evitar loops infinitos
    
    while (boostPositions.length < numBoosts && attempts < maxAttempts) {
      attempts++
      
      // Generar posición aleatoria
      const x = Phaser.Math.Between(startX, endX)
      const boostType = Phaser.Utils.Array.GetRandom(boostTypes)
      let y = boostType.y
      
      // Si es tipo "aire", generar Y aleatorio cada vez
      if (boostType.name === 'aire') {
        y = Phaser.Math.Between(350, 400)
      } else {
        y = Phaser.Math.Between(480, 500)
      }
      
      // Verificar que no esté muy cerca de ningún obstáculo
      let tooClose = false
      if (this.obstaclePositions) {
        for (const obstacle of this.obstaclePositions) {
          const distance = Math.abs(obstacle.x - x)
          if (distance < minDistanceFromObstacle) {
            tooClose = true
            break
          }
        }
      }
      
      // Verificar que no esté muy cerca de otros boosts ya colocados
      if (!tooClose) {
        for (const existingBoost of boostPositions) {
          const distance = Math.abs(existingBoost.x - x)
          if (distance < 100) { // Espaciado mínimo entre boosts
            tooClose = true
            break
          }
        }
      }
      
      // Si no está muy cerca, agregarlo
      if (!tooClose) {
        boostPositions.push({ x, y, type: boostType.name })
      }
    }
    
    // Crear boosts con posiciones que no colisionan con obstáculos
    boostPositions.forEach(pos => {
      const boost = this.add.rectangle(pos.x, pos.y, 40, 40, 0x00FF00)
      this.physics.add.existing(boost, true)
      boost.body.setSize(40, 40)
      boost.setData('type', 'boost')
      boost.setData('boostType', pos.type) // Guardar el tipo para referencia
      this.boosts.add(boost)
    })

    // Colisión con boosts
    this.physics.add.overlap(
      this.player.phaserSprite,
      this.boosts,
      this.onBoostHit,
      null,
      this
    )
  }

  createFinishLine() {
    // Línea de meta en el punto B
    this.finishLine = this.add.rectangle(
      this.config.distanceToB,
      300,
      10,
      600,
      0xFFFF00
    )
    this.finishLine.setAlpha(0.5)
    
    // Marcador visual del punto B (guardado para poder moverlo)
    this.finishMarker = this.add.text(
      this.config.distanceToB,
      100,
      'META',
      {
        fontSize: '32px',
        fill: '#FFFF00',
        stroke: '#000000',
        strokeThickness: 4
      }
    )
    this.finishMarker.setOrigin(0.5, 0.5)
  }

  createUI() {
    // Tiempo restante
    this.timeText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    })

    // Distancia recorrida
    this.distanceText = this.add.text(20, 50, '', {
      fontSize: '20px',
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    })

    // Velocidad actual
    this.speedText = this.add.text(20, 80, '', {
      fontSize: '18px',
      fill: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 2
    })

    // Mensaje de game over
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#FF0000',
      stroke: '#000000',
      strokeThickness: 4
    })
    this.gameOverText.setOrigin(0.5, 0.5)
    this.gameOverText.setVisible(false)
  }

  setupInput() {
    // Llamar al método padre primero para inicializar this.cursors
    super.setupInput()
    
    // Agregar teclas adicionales (remover listeners anteriores si existen)
    if (this.spaceKey) {
      this.spaceKey.removeAllListeners()
    }
    if (this.enterKey) {
      this.enterKey.removeAllListeners()
    }
    
    // Crear nuevas referencias a las teclas
    this.spaceKey = this.input.keyboard.addKey('SPACE')
    this.enterKey = this.input.keyboard.addKey('ENTER')
    this.upKey = this.cursors.up
  }

  startTimer() {
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    })
  }

  updateTimer() {
    if (this.isGameOver) return

    this.timeRemaining -= 1000

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0
      this.onTimeUp()
    }
  }

  onObstacleHit(player, obstacle) {
    if (this.isGameOver) return
    
    // Evitar múltiples colisiones rápidas con el mismo obstáculo
    if (obstacle.getData('hit')) return
    
    // Marcar como golpeado temporalmente
    obstacle.setData('hit', true)
    this.time.delayedCall(1000, () => {
      obstacle.setData('hit', false)
    })
    
    // Perder momentum considerablemente
    // Reduce la velocidad a un porcentaje muy bajo (solo queda 30% de la velocidad actual)
    this.currentSpeed *= (1 - this.config.obstaclePenalty)
    
    // Asegurar que la velocidad no sea negativa y tenga un mínimo razonable
    this.currentSpeed = Math.max(0, this.currentSpeed)
    
    // Efecto visual más pronunciado
    this.cameras.main.shake(300, 0.02)
    
    // Hacer el obstáculo invisible temporalmente
    obstacle.setVisible(false)
    this.time.delayedCall(500, () => {
      obstacle.setVisible(true)
    })
  }

  onBoostHit(player, boost) {
    if (this.isGameOver) return
    
    // Activar boost
    this.isBoostActive = true
    this.boostEndTime = this.time.now + this.config.boostDuration
    
    // Hacer el boost invisible
    boost.setVisible(false)
    
    // Efecto visual
    this.cameras.main.flash(200, 0, 255, 0)
  }

  handleSpaceInput() {
    if (this.isGameOver) {
      // No hacer nada si el juego terminó (usar ENTER para reiniciar)
      return
    }

    const now = this.time.now
    const timeSinceLastPress = now - this.lastSpacePress
    
    if (this.lastSpacePress > 0) {
      this.spacePressInterval = timeSinceLastPress
    }
    
    this.lastSpacePress = now

    // Incrementar velocidad basado en la frecuencia de presiones
    // Mientras más rápido presiones, más velocidad ganas
    if (timeSinceLastPress < 200) {
      // Presión muy rápida
      this.currentSpeed += this.config.speedIncrement * 1.5
    } else if (timeSinceLastPress < 400) {
      // Presión rápida
      this.currentSpeed += this.config.speedIncrement
    } else {
      // Presión normal
      this.currentSpeed += this.config.speedIncrement * 0.5
    }

    // Limitar velocidad máxima
    if (this.currentSpeed > this.config.maxSpeed) {
      this.currentSpeed = this.config.maxSpeed
    }
  }

  handleEnterInput() {
    if (this.isGameOver) {
      // Limpiar eventos y timers antes de reiniciar
      if (this.timer) {
        this.timer.remove()
      }
      
      // Reiniciar el juego completamente recargando la escena
      this.scene.restart()
    }
  }

  handleJump() {
    if (this.isGameOver) return
    
    const isOnGround = this.player.phaserSprite.body.touching.down
    
    if (isOnGround) {
      this.player.phaserSprite.setVelocityY(this.config.jumpSpeed)
      
      if (this.player.updateAnimation) {
        this.player.updateAnimation(true, false, 0)
      }
    }
  }

  updateMovement() {
    if (this.isGameOver) return

    // Aplicar boost si está activo
    let effectiveSpeed = this.currentSpeed
    if (this.isBoostActive) {
      effectiveSpeed *= this.config.boostMultiplier
      
      if (this.time.now >= this.boostEndTime) {
        this.isBoostActive = false
      }
    }

    // Decaimiento de velocidad si no se presiona espacio
    const timeSinceLastPress = this.time.now - this.lastSpacePress
    if (timeSinceLastPress > 500) {
      // Decaer velocidad gradualmente
      const decayAmount = (this.config.speedDecay / 60) // Por frame (60 FPS)
      this.currentSpeed = Math.max(0, this.currentSpeed - decayAmount)
    }

    // Mover el entorno hacia atrás (el personaje está fijo)
    const movement = effectiveSpeed / 60 // Por frame
    
    // Mover suelo
    this.groundTiles.forEach(tile => {
      tile.x -= movement
      
      // Reposicionar tiles que salen de pantalla
      if (tile.x < -400) {
        tile.x += this.groundTiles.length * 800
      }
    })

    // Mover obstáculos (actualizar posición física también)
    this.obstacles.children.entries.forEach(obstacle => {
      obstacle.x -= movement
      // Actualizar el cuerpo físico para que las colisiones funcionen
      if (obstacle.body) {
        obstacle.body.updateFromGameObject()
      }
    })

    // Mover boosts (actualizar posición física también)
    this.boosts.children.entries.forEach(boost => {
      boost.x -= movement
      // Actualizar el cuerpo físico para que las colisiones funcionen
      if (boost.body) {
        boost.body.updateFromGameObject()
      }
    })

    // Mover línea de meta y marcador
    this.finishLine.x -= movement
    this.finishMarker.x -= movement

    // Actualizar distancia recorrida
    this.distanceTraveled += movement

    // Verificar si llegó al punto B
    if (this.distanceTraveled >= this.config.distanceToB) {
      this.completeObjective('reach_finish')
    }
  }

  updateUI() {
    // Tiempo restante
    const seconds = Math.ceil(this.timeRemaining / 1000)
    this.timeText.setText(`Tiempo: ${seconds}s`)

    // Distancia
    const distancePercent = Math.min(100, (this.distanceTraveled / this.config.distanceToB) * 100)
    this.distanceText.setText(`Distancia: ${Math.floor(this.distanceTraveled)}/${this.config.distanceToB}px (${Math.floor(distancePercent)}%)`)

    // Velocidad
    const speedPercent = Math.floor((this.currentSpeed / this.config.maxSpeed) * 100)
    let speedColor = '#FFFF00'
    if (speedPercent > 70) speedColor = '#00FF00'
    else if (speedPercent < 30) speedColor = '#FF0000'
    
    this.speedText.setText(`Velocidad: ${Math.floor(this.currentSpeed)}px/s (${speedPercent}%)`)
    this.speedText.setFill(speedColor)

    // Boost activo
    if (this.isBoostActive) {
      const boostTimeLeft = Math.ceil((this.boostEndTime - this.time.now) / 1000)
      this.speedText.setText(`Velocidad: ${Math.floor(this.currentSpeed)}px/s (${speedPercent}%) [BOOST: ${boostTimeLeft}s]`)
    }
  }

  onVictory() {
    if (this.isGameOver) return
    
    this.isGameOver = true
    this.gameOverText.setText('¡VICTORIA!')
    this.gameOverText.setFill('#00FF00')
    this.gameOverText.setVisible(true)
    
    this.timer.remove()
    
    // Transición después de 2 segundos
    this.time.delayedCall(2000, () => {
      // Aquí puedes agregar la transición a la siguiente escena
      // this.transitionTo('NextScene')
    })
  }

  onTimeUp() {
    if (this.isGameOver) return
    
    this.isGameOver = true
    this.gameOverText.setText('TIEMPO AGOTADO\nPresiona ENTER para reiniciar')
    this.gameOverText.setFill('#FF0000')
    this.gameOverText.setVisible(true)
    
    this.timer.remove()
    this.failChallenge()
  }

  onChallengeComplete() {
    super.onChallengeComplete()
    this.onVictory()
  }

  checkCollisions() {
    if (!this.player || this.isGameOver) return

    const playerBounds = this.player.phaserSprite.getBounds()
    
    // Verificar colisiones con obstáculos manualmente
    this.obstacles.children.entries.forEach(obstacle => {
      if (!obstacle.visible) return
      
      const obstacleBounds = obstacle.getBounds()
      
      if (Phaser.Geom.Rectangle.Overlaps(playerBounds, obstacleBounds)) {
        this.onObstacleHit(this.player.phaserSprite, obstacle)
      }
    })

    // Verificar colisiones con boosts manualmente
    this.boosts.children.entries.forEach(boost => {
      if (!boost.visible) return
      
      const boostBounds = boost.getBounds()
      
      if (Phaser.Geom.Rectangle.Overlaps(playerBounds, boostBounds)) {
        this.onBoostHit(this.player.phaserSprite, boost)
      }
    })
  }

  update() {
    if (!this.player) return

    // Manejar entrada
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleSpaceInput()
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.handleEnterInput()
    }

    if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
      this.handleJump()
    }

    // Actualizar movimiento
    this.updateMovement()

    // Verificar colisiones manualmente (más confiable para objetos que se mueven manualmente)
    this.checkCollisions()

    // Actualizar UI
    this.updateUI()

    // Actualizar animación del jugador
    const isOnGround = this.player.phaserSprite.body.touching.down
    const isMoving = this.currentSpeed > 0
    
    // Asegurar que el sprite siempre mire hacia la derecha (adelante)
    this.player.phaserSprite.setFlipX(false)
    
    if (this.player.updateAnimation) {
      // Pasar velocidad positiva para que siempre mire hacia adelante
      this.player.updateAnimation(isMoving, isOnGround, Math.abs(this.currentSpeed))
    }
  }
}
