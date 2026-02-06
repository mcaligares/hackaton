import { MessageScene } from '../message-scenes/MessageScene.js'

/**
 * Valor4IntroScene - Escena de introducción para Valor4
 * 
 * Muestra información sobre el valor 4 antes de comenzar la escena de desafío
 * Valor 4: "We aren't afraid to fuck up"
 */
export class Valor4IntroScene extends MessageScene {
  constructor() {
    super('Valor4Intro')
  }

  init() {
    super.init({
      title: 'Valor 4',
      description: 'We aren\'t afraid to fuck up\n\nEnfrenta a Limpa en combate. Recuerda: el fracaso es parte del aprendizaje. ¡Sigue adelante!',
      actionButtonText: 'Comenzar',
      nextScene: 'Valor4Challenge',
      backgroundColor: 0x1a1a1a,
      titleColor: '#ffffff',
      descriptionColor: '#cccccc'
    })
  }
}
