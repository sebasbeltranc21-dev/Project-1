import Phaser from "phaser";

export default class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    Checkpoint.createTextures(scene);
    super(scene, x, y, "checkpoint-off");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.allowGravity = false;
    this.body.immovable = true;
    this.body.moves = false;
    this.body.setSize(20, 92);
    this.body.setOffset(20, 4);
    this.activated = false;
    this.setDepth(4);
  }

  activate() {
    if (this.activated) return false;
    this.activated = true;
    this.setTexture("checkpoint-on");
    return true;
  }

  static createTextures(scene) {
    if (scene.textures.exists("checkpoint-off")) return;

    for (const [key, flagColor, poleColor] of [
      ["checkpoint-off", 0x7b8aa6, 0xc4ccd8],
      ["checkpoint-on", 0xffd34e, 0xffffff]
    ]) {
      const g = scene.add.graphics();
      g.fillStyle(0x222a3f, 1);
      g.fillRect(12, 8, 5, 90);
      g.fillStyle(poleColor, 1);
      g.fillRect(8, 87, 13, 7);
      g.fillStyle(flagColor, 1);
      g.fillTriangle(17, 12, 55, 25, 17, 39);
      g.fillCircle(42, 25, 5);
      g.generateTexture(key, 64, 104);
      g.destroy();
    }
  }
}
