import { MessageScene } from '../message-scenes/MessageScene.js'

/**
 * Valor1IntroScene - Escena de introducción para Valor1
 * 
 * Muestra un mensaje de bienvenida a la serie de retos antes de comenzar el primer desafío
 */
export class Valor1IntroScene extends MessageScene {
  constructor() {
    super('Valor1Intro')
  }

  init() {
    super.init({
      title: 'Bienvenido a \nla serie de retos',
      description: 'Bienvenido a la serie de retos \nque te permitirán conocer los valores de Aero.\n\nBienvenido al reto de\n "We aim to be our best". \n Debes colocar los items en el orden correcto\n que representan un flujo optimo para cada rol',
      actionButtonText: 'Comenzar',
      nextScene: 'Valor1Challenge',
      backgroundColor: 0x1a1a1a,
      titleColor: '#ffffff',
      descriptionColor: '#cccccc'
    })
  }
}
