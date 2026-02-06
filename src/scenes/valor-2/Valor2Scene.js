import { ChallengeScene } from '../../core/scenes/ChallengeScene.js'
import { RobertSprite } from '../../core/sprites/RobertSprite.js'
import { BiluSprite } from '../../core/sprites/BiluSprite.js'
import { MiliSprite } from '../../core/sprites/MiliSprite.js'
import { LimpaSprite } from '../../core/sprites/LimpaSprite.js'
import { DevSprite } from '../../core/sprites/DevSprite.js'
import { DesignerSprite } from '../../core/sprites/DesignerSprite.js'
import { PmSprite } from '../../core/sprites/PmSprite.js'

/**
 * Valor2Scene - Escena 2D estilo Mario Bros
 * 
 * El jugador controla a Robert que está fijo en el centro de la pantalla.
 * Solo puede caminar hacia adelante o hacia atrás (sin saltos), y el entorno se mueve.
 * Objetivo: Armar un squad team con Dev, PM y Designer.
 * Los personajes Bilu, Mili y Limpa son interactuables pero no seleccionables.
 */
export class Valor2Scene extends ChallengeScene {
  constructor() {
    super('Valor2', {
      physics: true,
      gravity: { x: 0, y: 0 } // Sin gravedad ya que no hay saltos
    })

    // Configuración del juego (puede ser pasado por init())
    this.config = {
      totalDistance: 2000, // Distancia total del mapa en px (configurable, por defecto más corto)
      totalCharacters: 6, // Número total de personajes a interactuar (Bilu, Mili, Limpa, Dev, Designer, PM)
      baseSpeed: 200, // Velocidad base de movimiento del entorno
      speedDecay: 10, // Decaimiento de velocidad por frame cuando no se presiona tecla
      interactionRange: 100, // Rango de interacción con personajes
      characterSpacing: 200, // Espaciado mínimo entre personajes (configurable)
      startOffset: 400 // Distancia desde el inicio donde empieza el primer personaje
    }

    // Squad team (dev, pm, designer)
    this.squad = {
      dev: null,
      pm: null,
      designer: null
    }
    
    // Personajes interactuados (para diálogos)
    this.interactedCharacters = new Set()
    
    // UI
    this.interactionHintText = null
    this.dialogBox = null
    this.dialogText = null
    this.squadUI = null
    
    // Estado de diálogo
    this.currentDialog = null
    this.isDialogActive = false
    this.dialogStep = 0 // 0 = jugador, 1 = personaje
    this.dialogQueue = []
    this.currentDialogSequence = null // Secuencia de diálogos actual
    this.currentDialogIndex = 0 // Índice del diálogo actual en la secuencia
    
    // Velocidad de movimiento del entorno
    this.currentSpeed = 0
    
    // Configuración de diálogos (configurable)
    // Formato: { player: 'diálogo del jugador', character: 'respuesta del personaje' }
    this.dialogs = {
      bilu: { 
        dialog1: {
          player: 'Hola! Busco un Designer para un proyecto.',
          character: 'Que haces, te confundiste crack, soy Head of Engineering.'
        }
      },
      mili: { 
        dialog1: {
          player: 'Hola! Busco un PM para un proyecto.',
          character: 'Hola corazon! Yo soy Mili, Head of Operations, sorryyyy'
        }
      },
      limpa: { 
        dialog1: {
          player: 'Hola! Busco un Dev para un proyecto.',
          character: 'Noooo, yo soy CEO.'
        }
      },
      dev: { 
        dialog1: {
          player: 'Hola! Busco un Dev para un proyecto.',
          character: 'Hola! Yo soy Dev, que necesitas codear?'
        }
      },
      designer: { 
        dialog1: {
          player: 'Hola! Busco un Designer para un proyecto.',
          character: 'Holis, sisoy, que proye?'
        }
      },
      pm: { 
        dialog1: {
          player: 'Hola! Busco un PM para un proyecto.',
          character: 'Hola! Aqui uno, en que soy bueno?'
        }
      }
    }
  }

  init(data = {}) {
    // Permitir configurar parámetros desde fuera
    if (data.totalDistance !== undefined) this.config.totalDistance = data.totalDistance
    if (data.totalCharacters !== undefined) this.config.totalCharacters = data.totalCharacters
    if (data.baseSpeed !== undefined) this.config.baseSpeed = data.baseSpeed
    if (data.speedDecay !== undefined) this.config.speedDecay = data.speedDecay
    if (data.interactionRange !== undefined) this.config.interactionRange = data.interactionRange
    if (data.characterSpacing !== undefined) this.config.characterSpacing = data.characterSpacing
    if (data.startOffset !== undefined) this.config.startOffset = data.startOffset
  }

  preload() {
    super.preload()
    
    // Cargar sprites de Robert
    for (let i = 1; i <= 15; i++) {
      const key = `robert_sprite_${i}`
      const path = `/assets/sprites/characters/robert/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de Bilu
    for (let i = 1; i <= 20; i++) {
      const key = `bilu_sprite_${i}`
      const path = `/assets/sprites/characters/bilu/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de Mili
    for (let i = 1; i <= 25; i++) {
      const key = `mili_sprite_${i}`
      const path = `/assets/sprites/characters/mili/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de Limpa
    for (let i = 1; i <= 11; i++) {
      const key = `limpa_sprite_${i}`
      const path = `/assets/sprites/characters/limpa/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de Dev
    for (let i = 1; i <= 4; i++) {
      const key = `dev_sprite_${i}`
      const path = `/assets/sprites/characters/dev/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de Designer
    for (let i = 1; i <= 4; i++) {
      const key = `designer_sprite_${i}`
      const path = `/assets/sprites/characters/designer/sprite_${i}.png`
      this.load.image(key, path)
    }

    // Cargar sprites de PM
    for (let i = 1; i <= 4; i++) {
      const key = `pm_sprite_${i}`
      const path = `/assets/sprites/characters/pm/sprite_${i}.png`
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

    // Crear 10 personajes distribuidos por el mapa (todos los nuevos personajes sin repetir)
    this.createCharacters()

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
    
    // Crear UI del squad
    this.createSquadUI()
    
    // Crear caja de diálogo
    this.createDialogBox()
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
    const tilesNeeded = Math.ceil(this.config.totalDistance / tileWidth) + 2
    
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
    // Personaje fijo en X (centro de la pantalla) y en Y (más arriba que los demás)
    const playerX = 400 // Centro horizontal
    const playerY = 518 // Posición más arriba que los demás personajes (518 - 38px)
    
    // Deshabilitar física ya que el personaje está fijo y no necesita colisiones
    this.player = new RobertSprite(this, playerX, playerY, { 
      scale: 0.3, // Más grande que los demás (0.3-0.4)
      originY: 0.2,
      physics: false // Deshabilitar física para evitar que se caiga
    })
    
    // Sin física ya que no hay saltos ni colisiones necesarias
    // El personaje está fijo en posición
    
    // Asegurar que el sprite mire hacia la derecha (adelante) inicialmente
    this.player.phaserSprite.setFlipX(false)
    
    // Asegurar que el personaje principal se renderice por encima de los demás
    this.player.phaserSprite.setDepth(100)
  }

  createCharacters() {
    this.characters = []
    
    // Todos los personajes están en el mismo nivel (suelo)
    const groundY = 518 // Mismo nivel que el personaje principal
    
    // Definir los 6 personajes: Bilu, Mili, Limpa, Dev, Designer y PM
    // Los seleccionables son: Dev, Designer, PM
    const characterClasses = [
      { Class: BiluSprite, name: 'Bilu', selectable: false },
      { Class: MiliSprite, name: 'Mili', selectable: false },
      { Class: LimpaSprite, name: 'Limpa', selectable: false },
      { Class: DevSprite, name: 'Dev', selectable: true, squadRole: 'dev' },
      { Class: DesignerSprite, name: 'Designer', selectable: true, squadRole: 'designer' },
      { Class: PmSprite, name: 'PM', selectable: true, squadRole: 'pm' }
    ]
    
    // Crear secuencia de personajes: distribuir equitativamente según totalCharacters
    const characterSequence = []
    const repeats = Math.ceil(this.config.totalCharacters / characterClasses.length)
    for (let i = 0; i < repeats; i++) {
      characterClasses.forEach(char => {
        if (characterSequence.length < this.config.totalCharacters) {
          characterSequence.push(char)
        }
      })
    }
    
    // Calcular posiciones de personajes distribuidas equitativamente
    const characterPositions = []
    const availableDistance = this.config.totalDistance - this.config.startOffset - 200 // Dejar espacio al final
    const spacing = availableDistance / (this.config.totalCharacters + 1)
    
    for (let i = 0; i < this.config.totalCharacters; i++) {
      const x = this.config.startOffset + (spacing * (i + 1))
      characterPositions.push({ x })
    }

    characterPositions.forEach((pos, index) => {
      const charConfig = characterSequence[index]
      // Ajustar escala según el tipo de personaje
      // Dev, Designer y PM son más grandes, así que los hacemos más pequeños
      let characterScale = 0.4 // Escala por defecto
      if (charConfig.name === 'Dev' || charConfig.name === 'Designer' || charConfig.name === 'PM') {
        characterScale = 0.3 // Más pequeños para Dev, Designer y PM
      }
      
      // Deshabilitar física ya que los personajes están fijos y no necesitan colisiones
      const characterSprite = new charConfig.Class(this, pos.x, groundY, { 
        scale: characterScale, 
        originY: 0.2,
        physics: false // Deshabilitar física para evitar que se caigan
      })
      
      // Sin física necesaria ya que están fijos
      
      // Crear objeto interactuable
      const characterInteractable = {
        id: `${charConfig.name.toLowerCase()}_${index}`,
        sprite: characterSprite.phaserSprite,
        characterSprite: characterSprite,
        characterName: charConfig.name,
        selectable: charConfig.selectable || false,
        squadRole: charConfig.squadRole || null,
        isSelected: false,
        dialogState: 0, // 0 = no interactuado, 1 = dialog1 mostrado, 2 = dialog2 mostrado (solo seleccionables)
        x: pos.x,
        y: groundY,
        hintMessage: `Presiona E para interactuar con ${charConfig.name}`,
        onInteract: (sprite, interactable) => {
          this.interactWithCharacter(interactable)
          return { success: true }
        }
      }
      
      this.characters.push(characterInteractable)
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
      this.currentSpeed = -this.config.baseSpeed
      this.player.phaserSprite.setFlipX(true) // Mirar hacia atrás
    } else if (isRightPressed) {
      // Mover entorno hacia la izquierda (personaje avanza visualmente)
      this.currentSpeed = this.config.baseSpeed
      this.player.phaserSprite.setFlipX(false) // Mirar hacia adelante
    } else {
      // Decaer velocidad gradualmente hasta detenerse
      if (this.currentSpeed > 0) {
        this.currentSpeed = Math.max(0, this.currentSpeed - this.config.speedDecay)
      } else if (this.currentSpeed < 0) {
        this.currentSpeed = Math.min(0, this.currentSpeed + this.config.speedDecay)
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

    // Mover personajes
    this.characters.forEach(character => {
      character.sprite.x -= movement
      character.x -= movement // Actualizar posición almacenada
    })
  }

  setupObjectives() {
    // Objetivo: Armar squad team con Dev, PM y Designer
    this.addObjective({
      id: 'build_squad',
      description: this.getSquadObjectiveDescription(),
      condition: () => this.squad.dev !== null && this.squad.pm !== null && this.squad.designer !== null,
      onComplete: () => {
        this.onChallengeComplete()
      }
    })
  }
  
  getSquadObjectiveDescription() {
    const squadCount = [this.squad.dev, this.squad.pm, this.squad.designer].filter(x => x !== null).length
    return `Arma tu squad team: Dev ${this.squad.dev ? '✓' : '✗'}, PM ${this.squad.pm ? '✓' : '✗'}, Designer ${this.squad.designer ? '✓' : '✗'} (${squadCount}/3)`
  }

  /**
   * Encuentra el personaje más cercano al jugador
   */
  findNearestCharacter() {
    if (!this.player || !this.player.phaserSprite) return null

    const playerX = this.player.phaserSprite.x // Siempre 400 (centro)
    const playerY = this.player.phaserSprite.y

    let nearest = null
    let nearestDistance = Infinity

    this.characters.forEach(character => {
      // Calcular distancia considerando que el personaje puede estar fuera de pantalla
      const distanceX = Math.abs(character.x - playerX)
      const distanceY = Math.abs(character.y - playerY)
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance <= this.config.interactionRange && distance < nearestDistance) {
        nearest = character
        nearestDistance = distance
      }
    })

    return nearest
  }

  /**
   * Interactúa con un personaje
   */
  interactWithCharacter(characterInteractable) {
    const characterName = characterInteractable.characterName.toLowerCase()
    const dialogConfig = this.dialogs[characterName]
    
    if (!dialogConfig) return
    
    // Si es seleccionable y ya está en el squad, no hacer nada
    if (characterInteractable.selectable && characterInteractable.isSelected) {
      return
    }
    
    // Mostrar diálogo 1
    if (characterInteractable.dialogState === 0) {
      // Si es seleccionable, mostrar diálogo 1 y luego automáticamente diálogo 2 y asignar
      if (characterInteractable.selectable) {
        // Mostrar diálogo 1, luego diálogo 2, luego asignar al squad
        this.showDialogSequence(dialogConfig.dialog1, characterInteractable, () => {
          // Callback cuando termine el diálogo 1: mostrar diálogo 2
          characterInteractable.dialogState = 1
          
          // Cambiar a estado "select" después del diálogo 1
          if (characterInteractable.characterSprite.setSelect) {
            characterInteractable.characterSprite.setSelect()
          }
          
          this.assignToSquad(characterInteractable)
        })
      } else {
        // Personajes no seleccionables: solo mostrar diálogo 1
        this.showDialogSequence(dialogConfig.dialog1, characterInteractable)
        characterInteractable.dialogState = 1
      }
      
      // Marcar como interactuado (para diálogos)
      this.interactedCharacters.add(characterInteractable.id)
    }
  }
  
  /**
   * Asigna un personaje seleccionable al squad
   */
  assignToSquad(characterInteractable) {
    if (!characterInteractable.selectable || !characterInteractable.squadRole) return
    
    // Verificar si ya hay alguien en ese rol
    if (this.squad[characterInteractable.squadRole] !== null) {
      // Reemplazar al anterior
      const previousCharacter = this.squad[characterInteractable.squadRole]
      if (previousCharacter && previousCharacter.characterSprite.setIdle) {
        previousCharacter.characterSprite.setIdle()
      }
      if (previousCharacter) {
        previousCharacter.isSelected = false
        previousCharacter.dialogState = 1 // Volver a dialog1
      }
    }
    
    // Asignar al squad
    this.squad[characterInteractable.squadRole] = characterInteractable
    characterInteractable.isSelected = true
    characterInteractable.dialogState = 2
    
    // Cambiar sprite a "selected"
    if (characterInteractable.characterSprite.setSelected) {
      characterInteractable.characterSprite.setSelected()
    }
    
    // Actualizar UI del squad
    this.updateSquadUI()
    
    // Actualizar objetivo
    this.updateObjectiveDescription()
    
    // Verificar si se completó el desafío
    if (this.squad.dev !== null && this.squad.pm !== null && this.squad.designer !== null) {
      this.completeObjective('build_squad')
    }
  }
  
  /**
   * Muestra una secuencia de diálogos (jugador -> personaje)
   */
  showDialogSequence(dialogData, character, onComplete = null) {
    if (!dialogData || typeof dialogData !== 'object') {
      // Si es un string simple (compatibilidad hacia atrás), mostrarlo directamente
      this.showDialog(dialogData, character)
      if (onComplete) {
        this.time.delayedCall(100, onComplete)
      }
      return
    }
    
    // Crear secuencia de diálogos
    const sequence = []
    if (dialogData.player) {
      sequence.push({ text: dialogData.player, speaker: 'Jugador' })
    }
    if (dialogData.character) {
      const characterName = character ? character.characterName : 'Personaje'
      sequence.push({ text: dialogData.character, speaker: characterName })
    }
    
    if (sequence.length === 0) {
      if (onComplete) onComplete()
      return
    }
    
    // Guardar la secuencia actual y callback
    this.currentDialogSequence = sequence
    this.currentDialogIndex = 0
    this.currentDialog = { character, onComplete }
    
    // Mostrar el primer diálogo
    this.showNextDialog()
  }
  
  /**
   * Muestra el siguiente diálogo en la secuencia
   */
  showNextDialog() {
    if (!this.currentDialogSequence || this.currentDialogIndex >= this.currentDialogSequence.length) {
      // No hay más diálogos, cerrar y ejecutar callback si existe
      const onComplete = this.currentDialog && this.currentDialog.onComplete
      this.hideDialog()
      if (onComplete) {
        this.time.delayedCall(100, onComplete)
      }
      return
    }
    
    const dialog = this.currentDialogSequence[this.currentDialogIndex]
    this.showDialog(dialog.text, this.currentDialog.character, dialog.speaker)
  }
  
  /**
   * Avanza al siguiente diálogo (llamado cuando se presiona E)
   */
  advanceDialog() {
    if (!this.isDialogActive || !this.currentDialogSequence) return
    
    this.currentDialogIndex++
    this.showNextDialog()
  }
  
  /**
   * Muestra un diálogo individual
   */
  showDialog(text, character, speakerName = null) {
    if (!text) return
    
    this.isDialogActive = true
    
    // Determinar el nombre del hablante
    if (!speakerName) {
      speakerName = character ? character.characterName : 'Jugador'
    }
    
    // Formatear el texto con el nombre del hablante
    const formattedText = `${speakerName}: ${text}`
    
    if (this.dialogBox) {
      this.dialogBox.setVisible(true)
    }
    if (this.dialogText) {
      this.dialogText.setText(formattedText)
      this.dialogText.setVisible(true)
    }
  }
  
  /**
   * Oculta el diálogo
   */
  hideDialog() {
    this.isDialogActive = false
    this.currentDialog = null
    this.currentDialogSequence = null
    this.currentDialogIndex = 0
    
    if (this.dialogBox) {
      this.dialogBox.setVisible(false)
    }
    if (this.dialogText) {
      this.dialogText.setVisible(false)
    }
  }
  
  /**
   * Crea la caja de diálogo
   */
  createDialogBox() {
    // Fondo del diálogo
    this.dialogBox = this.add.rectangle(400, 500, 700, 140, 0x000000, 0.8)
    this.dialogBox.setStrokeStyle(2, 0xffffff)
    this.dialogBox.setOrigin(0.5)
    this.dialogBox.setVisible(false)
    this.dialogBox.setDepth(2000)
    
    // Texto del diálogo
    this.dialogText = this.add.text(400, 500, '', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      wordWrap: { width: 650 },
      align: 'left'
    })
    this.dialogText.setOrigin(0.5)
    this.dialogText.setVisible(false)
    this.dialogText.setDepth(2001)
  }
  
  /**
   * Crea la UI del squad
   */
  createSquadUI() {
    // Fondo del squad UI
    this.squadUI = this.add.container(100, 50)
    
    const bg = this.add.rectangle(0, 0, 200, 100, 0x000000, 0.7)
    bg.setStrokeStyle(2, 0xffffff)
    bg.setOrigin(0)
    
    const title = this.add.text(10, 10, 'Squad Team:', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    title.setOrigin(0)
    
    this.squadUIText = this.add.text(10, 35, '', {
      fontSize: '14px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    })
    this.squadUIText.setOrigin(0)
    
    this.squadUI.add([bg, title, this.squadUIText])
    this.squadUI.setDepth(1500)
    
    this.updateSquadUI()
  }
  
  /**
   * Actualiza la UI del squad
   */
  updateSquadUI() {
    if (!this.squadUIText) return
    
    const lines = [
      `Dev: ${this.squad.dev ? '✓' : '✗'}`,
      `PM: ${this.squad.pm ? '✓' : '✗'}`,
      `Designer: ${this.squad.designer ? '✓' : '✗'}`
    ]
    
    this.squadUIText.setText(lines.join('\n'))
  }

  /**
   * Actualiza la descripción del objetivo
   */
  updateObjectiveDescription() {
    const objective = this.objectives.find(obj => obj.id === 'build_squad')
    if (objective) {
      objective.description = this.getSquadObjectiveDescription()
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

    const messageText = this.add.text(400, 300, '¡Squad team completo!\nDev, PM y Designer están listos para trabajar', {
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

    // Verificar interacción con personajes (solo si no hay diálogo activo)
    if (!this.isDialogActive) {
      const nearestCharacter = this.findNearestCharacter()
      
      if (nearestCharacter) {
        // Mostrar hint en la posición del personaje (ajustar si está fuera de pantalla)
        const screenX = nearestCharacter.x
        const screenY = nearestCharacter.y
        
        // Solo mostrar si está en pantalla
        if (screenX >= 0 && screenX <= 800) {
          // Actualizar hint según el estado del personaje
          let hintMessage = `Presiona E para hablar con ${nearestCharacter.characterName}`
          
          if (nearestCharacter.selectable) {
            if (nearestCharacter.isSelected) {
              hintMessage = `${nearestCharacter.characterName} ya está en tu squad`
            } else if (nearestCharacter.dialogState === 1) {
              hintMessage = `Presiona E para agregar ${nearestCharacter.characterName} al squad`
            }
          }
          
          this.interactionHintText.setText(hintMessage)
          this.interactionHintText.setPosition(screenX, screenY - 50)
          this.interactionHintText.setVisible(true)
          
          // Si es seleccionable y ya mostró dialog1 pero no está seleccionado, mostrar estado "select"
          if (nearestCharacter.selectable && !nearestCharacter.isSelected && nearestCharacter.dialogState === 1) {
            if (nearestCharacter.characterSprite.setSelect) {
              nearestCharacter.characterSprite.setSelect()
            }
          }
        } else {
          this.interactionHintText.setVisible(false)
        }

        // Verificar si se presiona E
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
          this.interactWithCharacter(nearestCharacter)
        }
      } else {
        // Ocultar hint y volver a idle los personajes seleccionables cercanos
        this.interactionHintText.setVisible(false)
        
        // Resetear sprites de personajes seleccionables que no están seleccionados
        this.characters.forEach(char => {
          if (char.selectable && !char.isSelected && char.dialogState === 1) {
            if (char.characterSprite.setIdle) {
              char.characterSprite.setIdle()
            }
          }
        })
      }
    } else {
      // Si hay diálogo activo, ocultar hint
      this.interactionHintText.setVisible(false)
      
      // Avanzar diálogo con E
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.advanceDialog()
      }
    }
  }
}
