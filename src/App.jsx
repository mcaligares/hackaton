import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { useGameState } from './hooks/useGameState.js'
import { SceneRouter, sceneConfig } from './core/router/index.js'

// Importar configuración de escenas
import { allScenes } from './config/scenes/index.js'

function App() {
  const gameRef = useRef(null)
  const routerRef = useRef(null)
  const [gameState, updateGameState, resetGameState] = useGameState()

  useEffect(() => {
    // Configuración de Phaser
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-game',
      backgroundColor: '#1a1a1a',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 800 },
          debug: false
        }
      },
      scene: allScenes
    }

    // Crear instancia del juego
    gameRef.current = new Phaser.Game(config)

    // Crear router de escenas
    routerRef.current = new SceneRouter({
      scenes: sceneConfig.scenes,
      initialState: gameState,
      onSceneChange: (scene, data) => {
        // Actualizar estado cuando cambia la escena
        updateGameState('currentScene', scene.key)
        updateGameState('lastSceneData', data)
      }
    })

    // Cargar estado guardado
    const savedState = routerRef.current.loadState()
    if (savedState && savedState.currentSceneIndex > 0) {
      // Iniciar desde la escena guardada
      const savedScene = sceneConfig.scenes[savedState.currentSceneIndex]
      if (savedScene) {
        gameRef.current.scene.start(savedScene.key)
      }
    } else {
      // Iniciar desde el menú principal
      gameRef.current.scene.start('MainMenu')
    }

    // Cleanup
    return () => {
      if (routerRef.current) {
        routerRef.current.saveState()
      }
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1a1a1a'
    }}>
      <div 
        id="phaser-game" 
        style={{ 
          border: '2px solid #34495e', 
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)' 
        }}
      />
    </div>
  )
}

export default App
