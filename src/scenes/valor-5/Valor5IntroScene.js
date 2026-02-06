import { MessageScene } from '../message-scenes/MessageScene.js'

/**
 * Valor5IntroScene - Escena de introducción para Valor5
 * 
 * Muestra información sobre el valor 5 antes de comenzar la escena de desafío
 */
export class Valor5IntroScene extends MessageScene {
  constructor() {
    super('Valor5Intro')
  }

  init() {
    super.init({
      title: 'We move fast, not furious',
      description: 'Carrera contrarreloj con obstáculos cambiantes',
      actionButtonText: 'Comenzar',
      nextScene: 'Valor5',
      backgroundColor: 0x1a1a1a,
      titleColor: '#ffffff',
      descriptionColor: '#cccccc'
    })
  }
}
