import Phaser from "phaser";

export default class Hazard extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width = 84) {
    super(scene, x, y, width, 28, 0x2b324a);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.setOrigin(0.5);
    this.body.setSize(width, 24);
    this.setDepth(5);

    const spikeCount = Math.max(3, Math.floor(width / 18));
    const spacing = width / spikeCount;

    for (let i = 0; i < spikeCount; i += 1) {
      scene.add.triangle(
        x - width / 2 + spacing * i + spacing / 2,
        y - 10,
        -spacing * 0.48,
        24,
        0,
        0,
        spacing * 0.48,
        24,
        0xe84d5b,
        1
      ).setDepth(6);
    }
  }
}
