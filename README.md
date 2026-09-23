# Project 1 — Plataformas 2D

Videojuego web de plataformas 2D inspirado en los clásicos del género, con identidad y recursos propios.

## Stack inicial

- Phaser 3: motor del juego y física 2D.
- JavaScript: lógica del juego.
- Vite: desarrollo local y build.
- HTML/CSS: menú, HUD y presentación.
- GitHub Pages: despliegue cuando el juego esté listo.

## Roadmap por fases

### Fase 1 — Fundación
- Crear proyecto Vite + Phaser.
- Configurar resolución, escalado y escena principal.
- Crear estructura de carpetas.
- Configurar controles de teclado.
- Mostrar una pantalla inicial funcional.

### Fase 2 — Movimiento del personaje
- Crear protagonista con sprite propio.
- Caminar, correr y saltar.
- Gravedad y colisiones.
- Animaciones idle, caminar, salto y caída.
- Cámara que siga al jugador.

### Fase 3 — Primer nivel jugable
- Plataformas, suelo y paredes.
- Monedas/coleccionables.
- Checkpoints.
- Meta del nivel.
- Reinicio al caer.

### Fase 4 — Enemigos y peligros
- Enemigo básico con patrulla.
- Daño y sistema de vidas.
- Pinchos, pozos y otros obstáculos.
- Interacciones jugador-enemigo.

### Fase 5 — Power-ups
- Power-up de velocidad.
- Power-up defensivo.
- Efectos visuales y temporizadores.
- Sistema extensible para añadir más habilidades.

### Fase 6 — Mundo y niveles
- Selección de niveles.
- Varias zonas con identidad visual diferente.
- Secretos y rutas alternativas.
- Dificultad progresiva.

### Fase 7 — HUD, audio y pulido
- Vidas, monedas, puntuación y tiempo.
- Música y efectos de sonido.
- Transiciones.
- Pantallas de pausa, victoria y game over.
- Efectos de partículas y feedback visual.

### Fase 8 — Jefe y contenido final
- Jefe final con patrones de ataque.
- Nivel final.
- Condición de victoria.
- Créditos y reinicio de partida.

### Fase 9 — Optimización y publicación
- Optimización de rendimiento.
- Compatibilidad de pantallas.
- Corrección de bugs.
- Build de producción.
- Despliegue en GitHub Pages.

## Principios del proyecto

1. Cada fase debe dejar una versión jugable.
2. El código debe mantenerse modular para poder ampliar el juego sin rehacerlo.
3. Usaremos arte, nombres y recursos propios para que el proyecto tenga identidad propia.
4. Primero construimos la jugabilidad; después añadimos el pulido visual y sonoro.

## Estructura objetivo

```text
Project-1/
├── src/
│   ├── scenes/
│   ├── entities/
│   ├── systems/
│   ├── config/
│   └── main.js
├── public/
│   ├── assets/
│   │   ├── images/
│   │   ├── audio/
│   │   └── maps/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```
