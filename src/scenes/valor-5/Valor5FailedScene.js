import { MessageScene } from '../message-scenes/MessageScene.js'

/**
 * Valor5FailedScene - Escena de mensaje cuando falla la misión de Valor5
 * 
 * Muestra un mensaje de misión fallida y permite reintentar
 */
export class Valor5FailedScene extends MessageScene {
  constructor() {
    super('Valor5Failed')
  }

  init() {
    super.init({
      title: 'Misión Fallida',
      description: 'No lograste completar el desafío a tiempo. ¡No te rindas! Puedes intentarlo de nuevo.',
      actionButtonText: 'Reintentar',
      nextScene: 'Valor5',
      backgroundColor: 0x2c1810, // Fondo más oscuro/rojo
      titleColor: '#ff4444',
      descriptionColor: '#cccccc',
      buttonColor: 0xe74c3c, // Rojo
      buttonHoverColor: 0xc0392b // Rojo oscuro
    })
  }
}
