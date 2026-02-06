/**
 * Configuración centralizada de todas las escenas del juego
 * 
 * Este archivo combina todas las escenas de diferentes módulos.
 * Para agregar nuevas escenas:
 * 1. Crea un nuevo archivo en esta carpeta (ej: scenes/mi-feature.js)
 * 2. Exporta un array con tus escenas
 * 3. Importa y agrega ese array aquí
 */

import { coreScenes } from './core.js'
import { valor1Scenes } from './valor1.js'
import { valor2Scenes } from './valor2.js'
import { valor3Scenes } from './valor3.js'
import { valor4Scenes } from './valor4.js'
import { valor5Scenes } from './valor5.js'

/**
 * Array combinado de todas las escenas del juego
 * Las escenas se combinan en el orden en que se importan
 */
export const allScenes = [
  ...coreScenes,
  ...valor1Scenes,
  ...valor2Scenes,
  ...valor3Scenes,
  ...valor4Scenes,
  ...valor5Scenes
]
