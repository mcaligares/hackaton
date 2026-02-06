# Assets del Juego

Esta carpeta contiene todos los recursos del juego.

## Estructura

```
assets/
├── sprites/
│   ├── characters/     # Sprites de personajes
│   │   ├── player/     # Sprites del jugador
│   │   └── enemies/    # Sprites de enemigos
│   └── physics/        # Sprites de física/interactuables (suelos, plataformas)
├── ui/                 # Recursos de interfaz
│   ├── buttons/        # Botones
│   ├── hud/           # HUD del juego
│   └── dialogs/       # Elementos de diálogo
└── placeholders/      # Sprites temporales (para desarrollo)
```

## Sprites Temporales

Durante el desarrollo, se utilizan sprites temporales identificables:
- `sprite_1.png` a `sprite_17.png` - Sprites temporales del personaje
- Estos deben ser reemplazados por sprites finales en producción

## Convenciones

- Cada sprite debe tener un nombre descriptivo
- Los sprites de personajes deben estar en su propia carpeta
- Los sprites temporales deben estar claramente marcados como placeholders
- Todos los sprites deben tener propiedades físicas documentadas (tamaño, hitbox, etc.)
