import { ChallengeScene } from '../core/scenes/ChallengeScene.js'
import { RobertSprite } from '../core/sprites/RobertSprite.js'
import { MovementAction } from '../core/actions/MovementAction.js'
import { PhysicsConfig } from '../core/physics/PhysicsConfig.js'

/**
 * Valor1ChallengeScene - Desafío "We aim to be our best"
 * 
 * El jugador debe ordenar items en los tres pisos (spheres) correctamente:
 * - DEV SPHERE: Arquitectura, Desarrollo, QA, Deploy
 * - DESIGN SPHERE: Investigación, Wireframes, Diseño, Entregables
 * - PM SPHERE: Validación scope, Armado de roadmap, Coordinación, Comunicación cliente
 */
export class Valor1ChallengeScene extends ChallengeScene {
  constructor() {
    super('Valor1Challenge', {
      physics: true,
      gravity: PhysicsConfig.horizontal().gravity
    })

    // Configuración de los items por piso
    this.spheresConfig = {
      dev: {
        name: 'DEV SPHERE',
        y: 150,
        x: 500,
        color: 0x4a90e2, // Color base azul (primer item)
        items: [
          { id: 'dev_1', name: 'Arquitectura', order: 1, color: 0x4a90e2 },
          { id: 'dev_2', name: 'Desarrollo', order: 2, color: 0x5ba3f5 },
          { id: 'dev_3', name: 'QA', order: 3, color: 0x6cb6ff },
          { id: 'dev_4', name: 'Deploy', order: 4, color: 0x7dc7ff }
        ]
      },
      design: {
        name: 'DESIGN SPHERE',
        y: 300,
        x: 450,
        color: 0xe24a90, // Color base rosa/magenta (primer item)
        items: [
          { id: 'design_1', name: 'Investigación', order: 1, color: 0xe24a90 },
          { id: 'design_2', name: 'Wireframes', order: 2, color: 0xf55ba3 },
          { id: 'design_3', name: 'Diseño', order: 3, color: 0xff6cb6 },
          { id: 'design_4', name: 'Entregables', order: 4, color: 0xff7dc7 }
        ]
      },
      pm: {
        name: 'PM SPHERE',
        y: 450,
        x: 400,
        color: 0x4a8e2a, // Color base verde oscuro (primer item)
        items: [
          { id: 'pm_1', name: 'Validación scope', order: 1, color: 0x4a8e2a },
          { id: 'pm_2', name: 'Armado de roadmap', order: 2, color: 0x5ba33b },
          { id: 'pm_3', name: 'Coordinación', order: 3, color: 0x6cb84c },
          { id: 'pm_4', name: 'Comunicación cliente', order: 4, color: 0x7dc75d }
        ]
      }
    }

    this.carriedItem = null
    this.itemTitleText = null
    this.pickupKey = null
    this.spheres = {}
    this.items = []
    this.platforms = null
    this.allCompleted = false
  }

  preload() {
    super.preload()
    
    // Cargar fondo
    this.load.image('bg-1', '/assets/backgrounds/bg-1.png')
    
    // Cargar sprites de Robert
    for (let i = 1; i <= 15; i++) {
      const key = `robert_sprite_${i}`
      const path = `/assets/sprites/characters/robert/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprite de plataforma (sprite_17) como en ExplorationScene
    this.load.image('sprite_17', '/assets/sprite_17.png')
  }

  create() {
    super.create()

    // 1. Fondo - usar bg-1 si está disponible, sino fallback azul cielo
    if (this.textures.exists('bg-1')) {
      const bg = this.add.image(400, 300, 'bg-1')
      bg.setOrigin(0.5, 0.5)
      bg.setDisplaySize(800, 600)
      bg.setDepth(0)
    } else {
      // Fallback: fondo azul cielo (como ExplorationScene)
      this.add.rectangle(400, 300, 800, 600, 0x87CEEB).setDepth(0)
    }

    // 2. Crear plataformas base (suelo)
    this.createGround()

    // 3. Crear plataformas físicas para cada sphere
    this.createSpherePlatforms()

    // 4. Crear spheres visuales sobre las plataformas
    this.createSpheres()

    // 5. Crear items en fila horizontal
    this.createItems()

    // 6. Crear player (sin delays)
    this.createPlayer()

    // 7. Configurar acciones
    this.setupActions()

    // 8. Configurar teclas
    this.pickupKey = this.input.keyboard.addKey('E')
    this.spaceKey = this.input.keyboard.addKey('SPACE')

    // 9. Texto de título del item
    this.itemTitleText = this.add.text(400, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })
    this.itemTitleText.setVisible(false)
    this.itemTitleText.setDepth(1000)

    // 10. Instrucciones de controles
    const instructionsText = this.add.text(400, 20, '[E] Agarrar/Soltar objetos  |  [Flechas] Mover y Saltar', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 },
      align: 'center'
    })
    instructionsText.setOrigin(0.5)
    instructionsText.setDepth(1000)
    instructionsText.setAlpha(0.9)

    // 11. Configurar objetivos
    this.setupObjectives()
  }

  createGround() {
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
      // Fallback: rectángulo marrón como ExplorationScene
      const ground = this.add.rectangle(400, 568, 800, 64, 0x8B4513)
      this.physics.add.existing(ground, true)
      ground.body.setSize(800, 64)
      this.platforms.add(ground)
    }
  }

  createSpherePlatforms() {
    // Crear plataformas físicas para cada sphere usando el mismo estilo que el suelo base
    const groundTileKey = 'sprite_17'
    
    // Ancho reducido para dejar espacio a las escaleras a la izquierda
    const platformWidth = 400 // Reducido de 700 a 500
    const platformHeight = 80

    Object.keys(this.spheresConfig).forEach(sphereKey => {
      const config = this.spheresConfig[sphereKey]
      // Usar config.x como centro de la plataforma
      const platformX = config.x
      const platformStartX = platformX - platformWidth / 2

      if (this.textures.exists(groundTileKey)) {
        // Usar tiles como el suelo base
        const tileTexture = this.textures.get(groundTileKey)
        const tileWidth = tileTexture.getSourceImage().width
        const tileHeight = tileTexture.getSourceImage().height
        const tilesNeeded = Math.ceil(platformWidth / tileWidth)

        for (let i = 0; i < tilesNeeded; i++) {
          const tile = this.add.sprite(
            platformStartX + (i * tileWidth) + tileWidth/2,
            config.y,
            groundTileKey
          )
          this.physics.add.existing(tile, true)
          tile.body.setSize(tileWidth, tileHeight)
          this.platforms.add(tile)
        }
      } else {
        // Fallback: rectángulo marrón como el suelo base
        const platform = this.add.rectangle(
          platformX,
          config.y,
          platformWidth,
          platformHeight,
          0x8B4513
        )
        this.physics.add.existing(platform, true)
        platform.body.setSize(platformWidth, platformHeight)
        this.platforms.add(platform)
      }
    })

    // Crear escalera saltable a la izquierda (primero para que esté detrás)
    this.createStairs()
  }

  createStairs() {
    // Crear escalera mejorada: más ancha, mejor posicionada y con plataformas de conexión
    // Diseño profesional de plataformas para facilitar el acceso a todos los pisos
    const groundTileKey = 'sprite_17'
    const stepHeight = 20
    
    // Obtener posiciones Y de los pisos principales
    const pmY = this.spheresConfig.pm.y      // 450
    const designY = this.spheresConfig.design.y  // 300
    const devY = this.spheresConfig.dev.y    // 150
    
    // Posiciones de las escaleras: una en cada nivel intermedio
    // Más espaciadas verticalmente para facilitar los saltos
    const stairYPositions = [
      550,                    // Escalera en el suelo base
      (pmY + designY) / 2,    // Entre PM y Design (~375)
      (designY + devY) / 2,   // Entre Design y Dev (~225)
      devY - 30               // Justo debajo del Dev SPHERE
    ]
    
    // Escaleras más anchas y extendidas hacia la derecha para acercarse a los pisos
    const stairStartX = 0   // Inicio a la izquierda
    const stairEndX = 100     // Extender hasta casi llegar a los pisos (que empiezan en 300)
    const stairWidth = stairEndX - stairStartX

    stairYPositions.forEach((stepY, index) => {
      if (this.textures.exists(groundTileKey)) {
        const tileTexture = this.textures.get(groundTileKey)
        const tileWidth = tileTexture.getSourceImage().width
        const tileHeight = tileTexture.getSourceImage().height
        const tilesNeeded = Math.ceil(stairWidth / tileWidth)
        
        // Crear plataforma ancha para facilitar el salto
        for (let i = 0; i < tilesNeeded; i++) {
          const tile = this.add.sprite(
            stairStartX + (i * tileWidth) + tileWidth/2 - (index * 20),
            stepY,
            groundTileKey
          )
          this.physics.add.existing(tile, true)
          tile.body.setSize(tileWidth, tileHeight)
          this.platforms.add(tile)
        }
      } else {
        // Fallback: rectángulo ancho
        const step = this.add.rectangle(
          stairStartX + stairWidth/2,
          stepY,
          stairWidth,
          stepHeight,
          0x8B4513
        )
        this.physics.add.existing(step, true)
        step.body.setSize(stairWidth, stepHeight)
        this.platforms.add(step)
      }
    })
    
    // Agregar plataformas de conexión horizontales entre escaleras y pisos principales
    // Estas facilitan el paso de las escaleras a los pisos
    const connectionPositions = [
      { y: pmY, x: this.spheresConfig.pm.x, label: 'PM' },
      { y: designY, x: this.spheresConfig.design.x, label: 'Design' },
      { y: devY, x: this.spheresConfig.dev.x, label: 'Dev' }
    ]
    
    connectionPositions.forEach(({ y, x }) => {
      const connectionStartX = 280  // Donde terminan las escaleras
      const platformWidth = 400
      const connectionEndX = x - platformWidth / 2    // Donde empiezan los pisos principales
      const connectionWidth = connectionEndX - connectionStartX
      
      if (this.textures.exists(groundTileKey)) {
        const tileTexture = this.textures.get(groundTileKey)
        const tileWidth = tileTexture.getSourceImage().width
        const tileHeight = tileTexture.getSourceImage().height
        const tilesNeeded = Math.ceil(connectionWidth / tileWidth)

        for (let i = 0; i < tilesNeeded; i++) {
          const tile = this.add.sprite(
            connectionStartX + (i * tileWidth) + tileWidth/2,
            y,
            groundTileKey
          )
          this.physics.add.existing(tile, true)
          tile.body.setSize(tileWidth, tileHeight)
          this.platforms.add(tile)
        }
      } else {
        const connection = this.add.rectangle(
          connectionStartX + connectionWidth/2,
          y,
          connectionWidth,
          stepHeight,
          0x8B4513
        )
        this.physics.add.existing(connection, true)
        connection.body.setSize(connectionWidth, stepHeight)
        this.platforms.add(connection)
      }
    })
  }

  createSpheres() {
    // Ancho reducido para coincidir con las plataformas
    const sphereWidth = 500 // Reducido de 700 a 500
    const sphereHeight = 80

    // Crear cada sphere visual sobre su plataforma
    Object.keys(this.spheresConfig).forEach(sphereKey => {
      const config = this.spheresConfig[sphereKey]
      // Usar config.x como centro del sphere
      const sphereX = config.x
      const platformStartX = sphereX - sphereWidth / 2
      
      // NO crear rectángulo del sphere - las plataformas ya son visibles
      // Solo crear el texto del nombre del sphere

      // Texto del nombre del sphere en negro
      const sphereText = this.add.text(sphereX, config.y - 35, config.name, {
        fontSize: '20px',
        fill: '#000000',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      })
      sphereText.setOrigin(0.5)
      sphereText.setDepth(2)

      // Crear slots para los items (4 slots por sphere) - más pequeños y con bordes visibles
      const slotWidth = 80 // Más pequeño
      const slotHeight = 50 // Más pequeño
      const slotSpacing = 100 // Reducido para que quepan en el espacio más pequeño
      const startX = sphereX - (slotSpacing * 1.5)

      const slots = []
      for (let i = 0; i < 4; i++) {
        const slotX = startX + (i * slotSpacing)
        const slotY = config.y
        
        // Crear slot con fondo transparente pero bordes visibles con color del sphere
        const slotRect = this.add.graphics()
        slotRect.lineStyle(2, config.color, 1) // Borde con color del sphere
        slotRect.strokeRect(-slotWidth/2, -slotHeight/2, slotWidth, slotHeight)
        slotRect.setPosition(slotX, slotY)
        slotRect.setDepth(1)
        
        // Área de detección para overlap (invisible pero más grande)
        const detectionArea = this.add.rectangle(
          slotX,
          slotY,
          slotWidth + 30,
          slotHeight + 30,
          0x000000,
          0 // Invisible
        )
        detectionArea.setDepth(0)
        
        slots.push({
          x: slotX,
          y: slotY,
          rect: slotRect,
          detectionArea: detectionArea,
          item: null,
          order: i + 1
        })
      }

      // Crear check mark (inicialmente invisible) - al final de la plataforma
      const checkMark = this.add.text(
        platformStartX + sphereWidth - 30,
        config.y,
        '✓',
        {
          fontSize: '32px',
          fill: '#00ff00',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }
      )
      checkMark.setOrigin(0.5)
      checkMark.setVisible(false)
      checkMark.setDepth(10)

      // Crear X mark (inicialmente invisible) - para indicar que está mal ordenado
      const xMark = this.add.text(
        platformStartX + sphereWidth - 30,
        config.y,
        '✗',
        {
          fontSize: '32px',
          fill: '#ff0000',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }
      )
      xMark.setOrigin(0.5)
      xMark.setVisible(false)
      xMark.setDepth(10)

      this.spheres[sphereKey] = {
        key: sphereKey,
        config: config,
        text: sphereText,
        slots: slots,
        checkMark: checkMark,
        xMark: xMark,
        completed: false
      }
    })
  }

  createItems() {
    // Crear todos los items en fila horizontal en el suelo
    const allItems = []
    Object.keys(this.spheresConfig).forEach(sphereKey => {
      this.spheresConfig[sphereKey].items.forEach(itemConfig => {
        allItems.push({
          ...itemConfig,
          sphere: sphereKey
        })
      })
    })

    // Distribuir items uniformemente en fila horizontal
    const startX = 150 // Más a la derecha para dejar espacio a la escalera
    const endX = 700
    const itemsY = 550 // En el suelo
    const spacing = (endX - startX) / (allItems.length - 1)

    allItems.forEach((itemConfig, index) => {
      const x = startX + (index * spacing)

      // Crear gráfico del item
      const itemGraphics = this.add.graphics()
      itemGraphics.fillStyle(itemConfig.color, 1)
      itemGraphics.fillRoundedRect(0, 0, 100, 40, 8) 
      itemGraphics.lineStyle(2, 0xffffff, 1)
      itemGraphics.strokeRoundedRect(0, 0, 100, 40, 8)
      itemGraphics.generateTexture(`item_${itemConfig.id}`, 100, 40)
      itemGraphics.destroy()

      // Crear sprite del item
      const itemSprite = this.add.sprite(x, itemsY, `item_${itemConfig.id}`)
      itemSprite.setDepth(5)
      itemSprite.setInteractive()

      // Agregar física al item
      this.physics.add.existing(itemSprite)
      itemSprite.body.setSize(100, 60)
      itemSprite.body.setCollideWorldBounds(true)
      itemSprite.body.setBounce(0.2)
      itemSprite.body.setAllowGravity(true) // Activar gravedad para que caigan al suelo
      
      // Agregar collider con plataformas para que los items no caigan a través
      this.physics.add.collider(itemSprite, this.platforms)

      // Texto del nombre del item (pequeño, dentro del box)
      const itemText = this.add.text(x, itemsY, itemConfig.name, {
        fontSize: '10px',
        fill: '#000000',
        fontFamily: 'Arial',
        wordWrap: { width: 90 },
        align: 'center'
      })
      itemText.setOrigin(0.5)
      itemText.setDepth(6)

      const item = {
        id: itemConfig.id,
        name: itemConfig.name,
        sphere: itemConfig.sphere,
        order: itemConfig.order,
        color: itemConfig.color,
        sprite: itemSprite,
        text: itemText,
        state: 'ground', // 'ground' | 'carried' | 'placed'
        placedInSlot: null
      }

      this.items.push(item)
    })
  }

  createPlayer() {
    // Crear player en el suelo, sin delays
    this.player = new RobertSprite(this, 100, 0, { scale: 0.3, hitboxOffsetY: 100}) // Y: 0, la física lo pondrá en el suelo
    
    // Agregar collider con plataformas inmediatamente
    this.physics.add.collider(this.player.phaserSprite, this.platforms)
    
    // Desactivar gravedad temporalmente para posicionamiento inicial
    this.player.phaserSprite.body.setAllowGravity(false)
    this.time.delayedCall(150, () => {
      this.player.phaserSprite.body.setAllowGravity(true)
    })
  }

  setupActions() {
    // Acción de movimiento con parámetros optimizados para plataformas
    // Jump speed aumentado para facilitar saltos entre niveles
    this.movementAction = new MovementAction({
      speed: 200,
      jumpSpeed: -550 // Aumentado de -500 a -550 para saltos más altos
    })

    // Asociar acción al jugador
    this.player.addAction('move', (sprite, keys, isOnGround) => {
      return this.movementAction.execute(sprite, keys, isOnGround)
    })
  }

  setupObjectives() {
    // Objetivo: Completar todos los spheres
    this.addObjective({
      id: 'complete_all_spheres',
      description: 'Ordena todos los items correctamente en cada sphere',
      condition: () => this.allCompleted,
      onComplete: () => {
        this.showAchievementMessage()
      }
    })
  }

  update() {
    if (!this.player || !this.player.phaserSprite || this.allCompleted) return
    
    // Verificar que el player tenga física antes de continuar
    if (!this.player.phaserSprite.body) return

    const keys = {
      left: this.cursors.left,
      right: this.cursors.right,
      up: this.cursors.up,
      space: this.spaceKey
    }

    const isOnGround = this.player.phaserSprite.body.touching.down
    const movementState = this.movementAction.execute(this.player, keys, isOnGround)

    // Actualizar animación
    if (this.player.updateAnimation) {
      this.player.updateAnimation(
        movementState.isMoving,
        isOnGround
      )
    }

    // Manejar pickup/drop de items
    this.handleItemInteraction()

    // Actualizar posición del item llevado
    if (this.carriedItem) {
      this.updateCarriedItemPosition()
    }

    // Actualizar posición del texto de items que están en el suelo (siguen al sprite)
    this.items.forEach(item => {
      if (item.state === 'ground' && item.sprite && item.text) {
        item.text.x = item.sprite.x
        item.text.y = item.sprite.y
      }
    })

    // Verificar si los items están en los slots correctos
    this.checkSphereCompletion()
  }

  isItemCorrectlyPlaced(item) {
    // Verificar si el item está correctamente colocado en su slot
    if (item.state !== 'placed' || !item.placedInSlot) {
      return false
    }

    const slot = item.placedInSlot
    
    // Buscar en qué sphere está este slot
    let slotSphereKey = null
    Object.keys(this.spheres).forEach(sphereKey => {
      const sphere = this.spheres[sphereKey]
      if (sphere.slots.includes(slot)) {
        slotSphereKey = sphereKey
      }
    })
    
    // Si no se encontró el sphere, no está correctamente colocado
    if (!slotSphereKey) {
      return false
    }
    
    // Verificar que el item está en el sphere correcto y en el orden correcto
    return item.sphere === slotSphereKey && item.order === slot.order
  }

  handleItemInteraction() {
    const playerX = this.player.phaserSprite.x
    const playerY = this.player.phaserSprite.y
    const pickupRange = 80

    // Si no está llevando nada, intentar agarrar
    if (!this.carriedItem) {
      let nearestItem = null
      let nearestDistance = pickupRange

      this.items.forEach(item => {
        // No se puede agarrar si está siendo llevado
        if (item.state === 'carried') return
        
        // Si está colocado, solo se puede agarrar si está incorrectamente colocado
        if (item.state === 'placed') {
          if (this.isItemCorrectlyPlaced(item)) {
            return // No se puede agarrar si está correctamente colocado
          }
          // Si está incorrectamente colocado, se puede agarrar
        }

        const distance = Phaser.Math.Distance.Between(
          playerX,
          playerY,
          item.sprite.x,
          item.sprite.y
        )

        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestItem = item
        }
      })

      // Mostrar título del item si está cerca
      if (nearestItem) {
        this.itemTitleText.setText(nearestItem.name)
        this.itemTitleText.setVisible(true)
        this.itemTitleText.x = playerX
        this.itemTitleText.y = playerY - 60

        // Agarrar item si presiona E
        if (Phaser.Input.Keyboard.JustDown(this.pickupKey)) {
          this.pickupItem(nearestItem)
        }
      } else {
        this.itemTitleText.setVisible(false)
      }
    } else {
      // Está llevando un item
      const playerSprite = this.player.phaserSprite
      
      // Verificar overlap con slots usando detección de área
      let targetSlot = null
      Object.keys(this.spheres).forEach(sphereKey => {
        const sphere = this.spheres[sphereKey]
        sphere.slots.forEach(slot => {
          if (slot.item) return // Slot ocupado
          
          // Verificar overlap entre player y área de detección del slot
          const playerBounds = playerSprite.getBounds()
          const slotBounds = slot.detectionArea.getBounds()
          
          if (Phaser.Geom.Rectangle.Overlaps(playerBounds, slotBounds)) {
            // Verificar que el item pertenece a este sphere
            if (this.carriedItem.sphere === sphereKey) {
              targetSlot = slot
            }
          }
        })
      })

      // Mostrar hint
      if (targetSlot) {
        this.itemTitleText.setText(`[E] Colocar: ${this.carriedItem.name}`)
        this.itemTitleText.setFill('#00ff00')
      } else {
        this.itemTitleText.setText(`[E] Soltar: ${this.carriedItem.name}`)
        this.itemTitleText.setFill('#ffffff')
      }
      
      this.itemTitleText.setVisible(true)
      this.itemTitleText.x = playerX
      this.itemTitleText.y = playerY - 60

      // Intentar colocar o soltar
      if (Phaser.Input.Keyboard.JustDown(this.pickupKey)) {
        if (targetSlot) {
          this.placeItemInSlot(targetSlot)
        } else {
          this.dropItem()
        }
      }
    }
  }

  pickupItem(item) {
    if (item.state === 'carried') return

    // Si el item estaba en un slot, removerlo
    if (item.state === 'placed' && item.placedInSlot) {
      const sphere = this.spheres[item.sphere]
      const slot = sphere.slots.find(s => s.item === item)
      if (slot) {
        slot.item = null
      }
      item.placedInSlot = null
      
      // Marcar el sphere como no completado
      sphere.completed = false
      sphere.checkMark.setVisible(false)
      sphere.xMark.setVisible(false)
      
      // Reactivar física cuando se remueve del slot
      item.sprite.body.setImmovable(false)
    }

    this.carriedItem = item
    item.state = 'carried'
    
    // Desactivar física temporalmente mientras se lleva
    item.sprite.body.setAllowGravity(false)
    item.sprite.body.setVelocity(0, 0)
    item.sprite.body.setImmovable(false)
    
    // Cambiar a sprite de interacción
    this.player.setInteractionSprite()
  }

  dropItem() {
    if (!this.carriedItem) return

    const item = this.carriedItem
    item.state = 'ground'
    
    // Posicionar el item cerca del player pero dejarlo caer
    const playerX = this.player.phaserSprite.x
    const playerY = this.player.phaserSprite.y
    
    // Posicionar el item ligeramente adelante del player
    item.sprite.x = playerX + (this.player.phaserSprite.flipX ? -30 : 30)
    item.sprite.y = playerY - 20
    
    // Actualizar posición del texto ANTES de reactivar física
    item.text.x = item.sprite.x
    item.text.y = item.sprite.y
    
    // Reactivar física para que caiga al suelo
    item.sprite.body.setAllowGravity(true)
    item.sprite.body.setVelocity(0, 0) // Resetear velocidad
    
    this.carriedItem = null
    
    // Restaurar animación normal
    if (this.player.updateAnimation) {
      this.player.updateAnimation(false, true)
    }
  }

  placeItemInSlot(slot) {
    if (!this.carriedItem) return false

    const item = this.carriedItem
    
    // Colocar el item en el slot
    item.state = 'placed'
    item.placedInSlot = slot
    item.sprite.x = slot.x
    item.sprite.y = slot.y
    item.text.x = slot.x
    item.text.y = slot.y
    item.sprite.body.setAllowGravity(false) // Desactivar gravedad cuando está colocado
    item.sprite.body.setVelocity(0, 0)
    item.sprite.body.setImmovable(true) // Hacer inmóvil cuando está colocado
    slot.item = item

    this.carriedItem = null

    // Restaurar animación normal
    if (this.player.updateAnimation) {
      this.player.updateAnimation(false, true)
    }

    // Efecto visual al colocar
    this.tweens.add({
      targets: item.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true
    })

    return true
  }

  updateCarriedItemPosition() {
    if (!this.carriedItem) return

    const playerX = this.player.phaserSprite.x
    const playerY = this.player.phaserSprite.y

    // Posicionar el item arriba del player
    this.carriedItem.sprite.x = playerX
    this.carriedItem.sprite.y = playerY - 50
    this.carriedItem.text.x = playerX
    this.carriedItem.text.y = playerY - 50
  }

  checkSphereCompletion() {
    Object.keys(this.spheres).forEach(sphereKey => {
      const sphere = this.spheres[sphereKey]

      // Verificar si todos los slots tienen items
      let allSlotsFilled = true
      for (let i = 0; i < sphere.slots.length; i++) {
        if (!sphere.slots[i].item) {
          allSlotsFilled = false
          break
        }
      }

      // Verificar si todos los slots tienen items y están en el orden correcto
      let allCorrect = true
      if (allSlotsFilled) {
        for (let i = 0; i < sphere.slots.length; i++) {
          const slot = sphere.slots[i]
          
          // Verificar que el item es del sphere correcto y tiene el orden correcto
          if (slot.item.sphere !== sphereKey || slot.item.order !== slot.order) {
            allCorrect = false
            break
          }
        }
      } else {
        allCorrect = false
      }

      // Mostrar check mark si está todo correcto
      if (allCorrect) {
        if (!sphere.completed) {
          sphere.completed = true
          // Efecto visual solo cuando se completa por primera vez
          this.tweens.add({
            targets: sphere.checkMark,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 200,
            yoyo: true
          })
        }
        // Siempre mostrar check mark si está todo correcto
        sphere.checkMark.setVisible(true)
        sphere.xMark.setVisible(false)
      } else {
        // Si no está todo correcto, ocultar check mark
        sphere.completed = false
        sphere.checkMark.setVisible(false)
        
        if (allSlotsFilled && !allCorrect) {
          // Si hay 4 items pero están mal ordenados, mostrar X roja
          sphere.xMark.setVisible(true)
        } else {
          // Si no hay 4 items, ocultar X también
          sphere.xMark.setVisible(false)
        }
      }
    })

    // Verificar si todos los spheres están completos
    const allSpheresCompleted = Object.values(this.spheres).every(s => s.completed)
    if (allSpheresCompleted && !this.allCompleted) {
      this.allCompleted = true
      this.completeObjective('complete_all_spheres')
    }
  }

  showAchievementMessage() {
    // Crear overlay oscuro
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8)
    overlay.setDepth(1000)

    // Mensaje de logro
    const achievementText = this.add.text(400, 250, '¡Felicidades!', {
      fontSize: '36px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    achievementText.setOrigin(0.5)
    achievementText.setDepth(1001)

    const messageText = this.add.text(400, 300, 'Has desbloqueado el logro:\n"We aim to be our best"', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    })
    messageText.setOrigin(0.5)
    messageText.setDepth(1001)

    // Botón para continuar
    const continueButton = this.add.rectangle(400, 400, 200, 60, 0x4a90e2)
    continueButton.setStrokeStyle(2, 0xffffff)
    continueButton.setInteractive({ useHandCursor: true })
    continueButton.setDepth(1001)

    const continueText = this.add.text(400, 400, 'Continuar', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    continueText.setOrigin(0.5)
    continueText.setDepth(1002)

    continueButton.on('pointerdown', () => {
      this.transitionTo('Achievement1')
    })

    continueButton.on('pointerover', () => {
      continueButton.setFillStyle(0x5ba3f5)
    })

    continueButton.on('pointerout', () => {
      continueButton.setFillStyle(0x4a90e2)
    })
  }

  onChallengeComplete() {
    super.onChallengeComplete()
    // La transición se maneja en showAchievementMessage
  }
}
