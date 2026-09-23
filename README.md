# Project 1 — Aventura de Plataformas 2D

Videojuego web de plataformas 2D inspirado en los clásicos del género, con identidad y recursos propios.

## Stack

- **Phaser 3** — motor y física 2D.
- **JavaScript** — lógica del juego.
- **Vite** — desarrollo y build.
- **GitHub Actions** — verificación automática del build.\n- **GitHub Pages** — publicación prevista.

## Fases

1. ✅ Fundación
2. ✅ Movimiento del personaje
3. ✅ Primer nivel jugable
4. ✅ Enemigos y peligros
5. ⏳ Power-ups
6. ⏳ Mundo y niveles
7. ⏳ HUD, audio y pulido
8. ⏳ Jefe final
9. ⏳ Optimización y publicación

## Controles

- **A / D** o **← / →**: mover.
- **SHIFT**: correr.
- **ESPACIO / W / ↑**: saltar.
- **ESC**: volver al menú.
- **ENTER**: reiniciar tras completar el nivel.

## Estado actual

**Fase 4 completada:** enemigos patrullando, derrota por salto, daño por contacto, peligros de pinchos, sistema de vidas, invulnerabilidad temporal, respawn en checkpoint y pantalla de GAME OVER.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Después abre la dirección local que muestre Vite.

Cada push a `main` ejecuta un build automático con GitHub Actions para detectar errores de compilación.
