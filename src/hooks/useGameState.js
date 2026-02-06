import { useState, useEffect } from 'react'

/**
 * Hook para manejar el estado del juego
 * 
 * Persiste el estado en localStorage y permite acceso desde React
 */
export function useGameState(initialState = {}) {
  const [state, setState] = useState(() => {
    // Intentar cargar desde localStorage
    const saved = localStorage.getItem('hackaton-game-state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.gameState || initialState
      } catch (e) {
        console.error('Error loading game state:', e)
      }
    }
    return initialState
  })

  // Guardar en localStorage cuando el estado cambia
  useEffect(() => {
    const fullState = {
      gameState: state,
      timestamp: Date.now()
    }
    localStorage.setItem('hackaton-game-state', JSON.stringify(fullState))
  }, [state])

  const updateState = (key, value) => {
    setState(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetState = () => {
    setState(initialState)
    localStorage.removeItem('hackaton-game-state')
  }

  return [state, updateState, resetState]
}
