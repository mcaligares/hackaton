import { MessageScene } from '../message-scenes/MessageScene.js'

/**
 * Valor2IntroScene - Escena de introducción para Valor2
 * 
 * Muestra información sobre el valor 2 antes de comenzar la escena de desafío
 */
export class Valor2IntroScene extends MessageScene {
  constructor() {
    super('Valor2Intro')
  }

  init() {
    super.init({
      title: 'Valor 2',
      description: 'Explora el mapa y encuentra a todos los personajes. Acércate y presiona E para interactuar con ellos.',
      actionButtonText: 'Comenzar',
      nextScene: 'Valor2',
      backgroundColor: 0x1a1a1a,
      titleColor: '#ffffff',
      descriptionColor: '#cccccc'
    })
  }
}
