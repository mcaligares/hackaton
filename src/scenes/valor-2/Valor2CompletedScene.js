import { MessageScene } from '../message-scenes/MessageScene.js'

/**
 * Valor2CompletedScene - Escena de mensaje cuando se completa la misión de Valor2
 * 
 * Muestra un mensaje de misión completada y permite volver al menú principal
 */
export class Valor2CompletedScene extends MessageScene {
  constructor() {
    super('Valor2Completed')
  }

  init() {
    super.init({
      title: '¡Misión Completada!',
      description: '¡Felicitaciones! Has completado exitosamente el desafío del Valor 2. Has interactuado con todos los personajes.',
      actionButtonText: 'Volver al Menú',
      nextScene: 'MainMenu',
      backgroundColor: 0x0f2c1a, // Fondo más oscuro/verde
      titleColor: '#44ff44',
      descriptionColor: '#cccccc',
      buttonColor: 0x27ae60, // Verde
      buttonHoverColor: 0x229954 // Verde oscuro
    })
  }
}
