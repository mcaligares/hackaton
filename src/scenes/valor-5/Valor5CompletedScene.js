import { MessageScene } from '../message-scenes/MessageScene.js'

/**
 * Valor5CompletedScene - Escena de mensaje cuando se completa la misión de Valor5
 * 
 * Muestra un mensaje de misión completada y permite volver al menú principal
 */
export class Valor5CompletedScene extends MessageScene {
  constructor() {
    super('Valor5Completed')
  }

  init() {
    super.init({
      title: '🏆 ¡Felicidades! 🏆',
      description: 'Has completado todos los desafíos que representan los valores de Aerolab!\n¡Ya estás listo para ser Aerolaber!',
      actionButtonText: 'Volver al Menú',
      nextScene: 'MainMenu',
      backgroundColor: 0x0f2c1a, // Fondo más oscuro/verde
      titleColor: '#ffd700',
      descriptionColor: '#ffffff',
      buttonColor: 0x27ae60, // Verde
      buttonHoverColor: 0x229954, // Verde oscuro
      titleFontSize: '48px',
      descriptionFontSize: '24px'
    })
  }
}
