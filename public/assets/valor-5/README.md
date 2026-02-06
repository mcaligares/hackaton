# Assets para Valor5Scene

Coloca aquí los archivos PNG para la escena Valor5.

## Estructura de archivos:

### Fondo y Suelo (assets únicos):
- `valor5_background.png` - Fondo de la escena
- `valor5_ground.png` - Textura del suelo/plataforma

### Obstáculos (múltiples variantes):
- `valor5_obstacle_1.png`
- `valor5_obstacle_2.png`
- `valor5_obstacle_3.png`
- ... (hasta `valor5_obstacle_N.png`)

**Nota:** Configura el número máximo de variantes en `Valor5Scene.js`:
```javascript
obstacle: {
  variants: 5, // Cambia este número según cuántos archivos tengas
  ...
}
```

### Boosts (múltiples variantes):
- `valor5_boost_1.png`
- `valor5_boost_2.png`
- `valor5_boost_3.png`
- ... (hasta `valor5_boost_N.png`)

**Nota:** Configura el número máximo de variantes en `Valor5Scene.js`:
```javascript
boost: {
  variants: 5, // Cambia este número según cuántos archivos tengas
  ...
}
```

## Boosters Finales:

Los boosters finales (ChatGPT, Claude, Figma) ya están configurados y se cargan desde:
- `/public/assets/boosters/chatgpt.png`
- `/public/assets/boosters/claude.png`
- `/public/assets/boosters/figma.png`

## Fallbacks:

Si no colocas los archivos PNG, el juego usará rectángulos de colores como fallback:
- Fondo: Azul cielo (`0x87CEEB`)
- Suelo: Marrón (`0x8B4513`)
- Obstáculos: Rojo (`0xFF0000`)
- Boosts: Verde (`0x00FF00`)
