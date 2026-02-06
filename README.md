# Hackaton Game

Juego desarrollado con React y Phaser, diseñado con arquitectura escalable y extensible.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

El juego se abrirá en `http://localhost:3000`

### Build

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
hackaton-game/
├── src/
│   ├── core/              # Sistemas base
│   │   ├── sprites/       # Sistema de sprites
│   │   ├── actions/       # Sistema de acciones
│   │   ├── scenes/        # Sistema de escenas
│   │   ├── router/        # Router de escenas
│   │   └── physics/       # Configuración de física
│   ├── scenes/            # Escenas del juego
│   ├── hooks/             # React hooks
│   └── App.jsx            # Componente principal
├── public/
│   └── assets/            # Recursos del juego
├── PLAN.md                # Plan de desarrollo
└── CONTEXT.md             # Documentación técnica
```

## 🎮 Características

- ✅ Sistema de sprites reutilizable con herencia
- ✅ Sistema de acciones desacoplado
- ✅ Escenas base (Challenge y Presentation)
- ✅ Router de escenas configurable
- ✅ Persistencia de estado
- ✅ Sistema de física configurable
- ✅ Arquitectura escalable y extensible

## 📚 Documentación

- **[CONTEXT.md](./CONTEXT.md)**: Documentación técnica completa
- **[PLAN.md](./PLAN.md)**: Plan de desarrollo y tareas

## 🛠️ Desarrollo

### Crear Nueva Escena

Ver [CONTEXT.md](./CONTEXT.md#crear-nueva-escena) para instrucciones detalladas.

### Crear Nuevo Personaje

Ver [CONTEXT.md](./CONTEXT.md#crear-nuevo-personaje) para instrucciones detalladas.

### Crear Nueva Acción

Ver [CONTEXT.md](./CONTEXT.md#crear-nueva-acción) para instrucciones detalladas.

## 📝 Notas

- El proyecto usa assets temporales durante el desarrollo
- El estado del juego se guarda automáticamente en localStorage
- Todas las escenas siguen una estructura consistente
- Las acciones son reutilizables entre diferentes sprites

## 🤝 Contribución

Este proyecto está diseñado para trabajo colaborativo. Ver [CONTEXT.md](./CONTEXT.md) para convenciones y mejores prácticas.
