import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, minX, maxX) {
    Enemy.createTexture(scene);
    super(scene, x, y, "enemy-basic");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.minX = minX;
    this.maxX = maxX;
    this.direction = 1;
    this.speed = 95;
    this.isDefeated = false;

    this.setDepth(6);
    this.setCollideWorldBounds(false);
    this.setBounce(0, 0);
    this.setDragX(1800);
    this.body.setSize(42, 44);
    this.body.setOffset(11, 10);
  }

  update() {
    if (!this.active || this.isDefeated) return;

    if (this.x <= this.minX) {
      this.x = this.minX;
      this.direction = 1;
    } else if (this.x >= this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    }

    if (this.body.blocked.left || this.body.blocked.right) {
      this.direction *= -1;
    }

    this.setVelocityX(this.direction * this.speed);
    this.setFlipX(this.direction < 0);
  }

  defeat() {
    if (this.isDefeated) return;

    this.isDefeated = true;
    this.body.enable = false;
    this.setVelocity(0, 0);

    this.scene.tweens.add({
      targets: this,
      scaleY: 0.35,
      alpha: 0.35,
      duration: 140,
      yoyo: true,
      hold: 70,
      onComplete: () => this.destroy()
    });
  }

  static createTexture(scene) {
    if (scene.textures.exists("enemy-basic")) return;

    const g = scene.add.graphics();

    // Body.
    g.fillStyle(0x8c4bde, 1);
    g.fillRoundedRect(5, 12, 54, 39, 14);

    // Ears / horns.
    g.fillStyle(0x6134a8, 1);
    g.fillTriangle(10, 18, 7, 2, 21, 13);
    g.fillTriangle(54, 18, 57, 2, 43, 13);

    // Feet.
    g.fillStyle(0x26334d, 1);
    g.fillRoundedRect(8, 45, 17, 8, 3);
    g.fillRoundedRect(39, 45, 17, 8, 3);

    // Eyes.
    g.fillStyle(0xffffff, 1);
    g.fillCircle(22, 27, 8);
    g.fillCircle(42, 27, 8);

    g.fillStyle(0x172035, 1);
    g.fillCircle(24, 28, 3);
    g.fillCircle(40, 28, 3);

    // Mouth.
    g.lineStyle(4, 0x172035, 1);
    g.beginPath();
    g.arc(32, 36, 11, 0, Math.PI);
    g.strokePath();

    g.generateTexture("enemy-basic", 64, 64);
    g.destroy();
  }
}
