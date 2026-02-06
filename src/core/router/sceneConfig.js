/**
 * sceneConfig - Configuración del flujo de escenas del juego
 * 
 * Define el orden y la estructura de todas las escenas del juego.
 * Fácil de modificar para agregar nuevas escenas sin tocar la lógica central.
 */

export const sceneConfig = {
  // Orden de las escenas en el juego
  scenes: [
    {
      key: 'MainMenu',
      type: 'presentation',
      nextScene: 'AerolabIntro'
    },
    {
      key: 'AerolabIntro',
      type: 'presentation',
      nextScene: 'IntroStory'
    },
    {
      key: 'IntroStory',
      type: 'presentation',
      nextScene: 'Valor1Challenge'
    },
    {
      key: 'Valor1Challenge',
      type: 'challenge',
      nextScene: 'Achievement1',
      onComplete: 'Achievement1'
    },
    {
      key: 'Tutorial',
      type: 'presentation',
      nextScene: 'Exploration'
    },
    {
      key: 'Exploration',
      type: 'challenge',
      nextScene: 'Achievement1',
      onComplete: 'Achievement1'
    },
    {
      key: 'Achievement1',
      type: 'presentation',
      nextScene: 'Story1'
    },
    {
      key: 'Story1',
      type: 'presentation',
      nextScene: 'Combat'
    },
    {
      key: 'Combat',
      type: 'challenge',
      nextScene: 'Achievement2',
      onComplete: 'Achievement2'
    },
    {
      key: 'Achievement2',
      type: 'presentation',
      nextScene: 'EndGame'
    },
    {
      key: 'EndGame',
      type: 'presentation',
      nextScene: null // Fin del juego
    }
  ],

  // Mapeo de tipos de escena a clases base
  sceneTypes: {
    challenge: 'ChallengeScene',
    presentation: 'PresentationScene'
  }
}
