# Project 1 — Aventura de Plataformas 2D

Videojuego web de plataformas 2D inspirado en los clásicos del género, con identidad y recursos propios.

## Stack

- **Phaser 3** — motor y física 2D.
- **JavaScript** — lógica del juego.
- **Vite** — desarrollo y build.
- **GitHub Actions** — verificación automática del build.
- **GitHub Pages** — publicación prevista.

## Fases

1. ✅ Fundación
2. ✅ Movimiento del personaje
3. ✅ Primer nivel jugable
4. ✅ Enemigos y peligros
5. ✅ Power-ups
6. ✅ Mundo y niveles
7. ✅ HUD, audio y pulido
8. ✅ Jefe final
9. ⏳ Optimización y publicación

## Controles

- **A / D** o **← / →**: mover.
- **SHIFT**: correr.
- **ESPACIO / W / ↑**: saltar.
- **ENTER**: entrar al nivel seleccionado o continuar.
- **R**: repetir nivel al terminar.
- **P**: pausar/continuar.
- **M**: activar/desactivar audio.
- **ESC**: volver al mapa.

## Progreso

El mapa guarda el desbloqueo en el navegador. Al completar un nivel, el siguiente se desbloquea automáticamente y el progreso puede sobrevivir a una recarga.

## Niveles actuales

- **1 — Pradera Neon:** nivel exterior con plataformas, enemigos, pinchos y power-ups.
- **2 — Cavernas Cristal:** nivel interior con plataformas más estrechas y una ambientación diferente.
- **3 — Arena del Núcleo:** combate final contra Astrax en una arena cerrada con tres fases.

## Estado actual

**Fase 8 completada:** jefe Astrax con 18 PV, tres fases de ataque, proyectiles, barra de vida, arena final y pantalla de victoria.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Para comprobar el build:

```bash
npm run build
```

Cada push a `main` ejecuta un build automático con GitHub Actions.
