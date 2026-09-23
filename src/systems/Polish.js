export function createPauseOverlay(scene, subtitle = "ELIGE UNA OPCIÓN") {
  const { width, height } = scene.scale;

  const container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100).setVisible(false);
  const panel = scene.add.rectangle(width / 2, height / 2, 600, 360, 0x10152b, 0.97)
    .setStrokeStyle(5, 0x8fe7ff);

  const title = scene.add.text(width / 2, 220, "PAUSA", {
    fontFamily: "Arial Black",
    fontSize: "58px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 7
  }).setOrigin(0.5);

  const text = scene.add.text(width / 2, 305, subtitle, {
    fontFamily: "Arial",
    fontSize: "22px",
    color: "#b8bfd8",
    align: "center"
  }).setOrigin(0.5);

  const hint = scene.add.text(width / 2, 405, "P • CONTINUAR     ESC • MAPA", {
    fontFamily: "Arial Black",
    fontSize: "19px",
    color: "#36d399"
  }).setOrigin(0.5);

  container.add([panel, title, text, hint]);
  return container;
}

export function createVignette(scene) {
  const { width, height } = scene.scale;
  return scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
    .setScrollFactor(0)
    .setDepth(90);
}

export function flashPlayer(scene) {
  if (!scene.player?.active) return;

  scene.tweens.killTweensOf(scene.player);
  scene.tweens.add({
    targets: scene.player,
    alpha: 0.3,
    duration: 85,
    yoyo: true,
    repeat: 7,
    onComplete: () => {
      if (scene.player.active) scene.player.setAlpha(1);
    }
  });
}
