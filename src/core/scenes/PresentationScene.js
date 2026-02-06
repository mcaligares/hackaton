import { BaseScene } from './BaseScene.js'

/**
 * PresentationScene - Escena base para contenido presentacional
 * 
 * Escenas presentacionales incluyen:
 * - Conversaciones
 * - Historia/Cinematics
 * - Pantalla de inicio
 * - Logros
 * - Menús
 * 
 * Características comunes:
 * - Sistema de diálogos
 * - Transiciones automáticas
 * - Contenido no interactivo o con interacción limitada
 */
export class PresentationScene extends BaseScene {
  constructor(key, config = {}) {
    super(key, {
      physics: false, // Las escenas presentacionales generalmente no necesitan física
      ...config
    })

    this.dialogs = []
    this.currentDialogIndex = 0
    this.dialogText = null
    this.autoAdvance = config.autoAdvance || false
    this.advanceDelay = config.advanceDelay || 3000
  }

  /**
   * Agrega un diálogo a la escena
   * @param {Object} dialog - Diálogo con { text, speaker, duration }
   */
  addDialog(dialog) {
    this.dialogs.push(dialog)
  }

  /**
   * Inicia el sistema de diálogos
   */
  startDialogs() {
    if (this.dialogs.length === 0) {
      return
    }

    this.currentDialogIndex = 0
    this.showDialog(this.dialogs[0])
  }

  /**
   * Muestra un diálogo
   * @param {Object} dialog - Diálogo a mostrar
   */
  showDialog(dialog) {
    // Crear o actualizar texto de diálogo
    if (!this.dialogText) {
      this.dialogText = this.add.text(400, 500, '', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center',
        wordWrap: { width: 600 }
      })
      this.dialogText.setOrigin(0.5)
      this.dialogText.setDepth(1000)
    }

    const speakerText = dialog.speaker ? `${dialog.speaker}: ` : ''
    this.dialogText.setText(speakerText + dialog.text)
    this.dialogText.setVisible(true)

    // Auto-avanzar si está configurado
    if (this.autoAdvance) {
      const delay = dialog.duration || this.advanceDelay
      this.time.delayedCall(delay, () => {
        this.nextDialog()
      })
    }
  }

  /**
   * Avanza al siguiente diálogo
   */
  nextDialog() {
    this.currentDialogIndex++
    if (this.currentDialogIndex < this.dialogs.length) {
      this.showDialog(this.dialogs[this.currentDialogIndex])
    } else {
      this.onDialogsComplete()
    }
  }

  /**
   * Callback cuando todos los diálogos se completan
   * Debe ser sobrescrito por las subclases
   */
  onDialogsComplete() {
    console.log('All dialogs completed')
  }

  /**
   * Configura entrada para avanzar diálogos manualmente
   */
  setupDialogInput() {
    this.input.keyboard.on('keydown-SPACE', () => {
      this.nextDialog()
    })
  }
}
