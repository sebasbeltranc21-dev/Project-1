import Phaser from "phaser";

export class BossProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, velocityX, velocityY) {
    BossProjectile.createTexture(scene);
    super(scene, x, y, "boss-projectile");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.allowGravity = false;
    this.body.setCircle(12, 4, 4);
    this.setVelocity(velocityX, velocityY);
    this.setDepth(8);

    scene.time.delayedCall(5000, () => {
      if (this.active) this.destroy();
    });
  }

  static createTexture(scene) {
    if (scene.textures.exists("boss-projectile")) return;

    const g = scene.add.graphics();
    g.fillStyle(0xff5d72, 1);
    g.fillCircle(16, 16, 13);
    g.fillStyle(0xffd34e, 1);
    g.fillCircle(16, 16, 6);
    g.lineStyle(3, 0xffffff, 0.75);
    g.strokeCircle(16, 16, 14);
    g.generateTexture("boss-projectile", 32, 32);
    g.destroy();
  }
}

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, minX, maxX) {
    Boss.createTexture(scene);
    super(scene, x, y, "boss-idle");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.minX = minX;
    this.maxX = maxX;
    this.direction = -1;
    this.speed = 105;
    this.maxHealth = 18;
    this.health = 18;
    this.phase = 1;
    this.invulnerableUntil = 0;
    this.defeated = false;

    this.body.allowGravity = false;
    this.body.immovable = true;
    this.body.setSize(132, 124);
    this.body.setOffset(34, 16);

    this.setDepth(7);
    this.setCollideWorldBounds(true);

    if (!scene.anims.exists("boss-idle")) {
      scene.anims.create({
        key: "boss-idle",
        frames: [{ key: "boss-idle" }],
        frameRate: 1,
        repeat: -1
      });
    }

    this.play("boss-idle");
  }

  update() {
    if (!this.active || this.defeated) return;

    if (this.health <= 12 && this.phase < 2) {
      this.phase = 2;
      this.speed = 155;
      this.setTint(0x8f7bff);
      this.scene.showBossMessage("¡ASTRAX CAMBIA DE FASE!");
      this.scene.audio?.bossPhase();
    } else if (this.health <= 6 && this.phase < 3) {
      this.phase = 3;
      this.speed = 215;
      this.clearTint();
      this.scene.showBossMessage("¡ASTRAX ENTRA EN FURIA!");
      this.scene.audio?.bossPhase();
    }

    if (this.x <= this.minX) {
      this.x = this.minX;
      this.direction = 1;
    } else if (this.x >= this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    }

    this.setVelocityX(this.direction * this.speed);
    this.setFlipX(this.direction > 0);
  }

  attack(target) {
    if (!this.active || this.defeated || !target?.active) return;

    const baseSpeed = this.phase === 1 ? 250 : this.phase === 2 ? 310 : 370;
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const vx = (dx / length) * baseSpeed;
    const vy = (dy / length) * baseSpeed;

    const shots = this.phase === 3 ? [-0.22, 0, 0.22] : this.phase === 2 ? [-0.12, 0.12] : [0];

    shots.forEach((angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotatedX = vx * cos - vy * sin;
      const rotatedY = vx * sin + vy * cos;

      this.scene.bossProjectiles.add(
        new BossProjectile(
          this.scene,
          this.x,
          this.y,
          rotatedX,
          rotatedY
        )
      );
    });

    this.scene.audio?.bossAttack();
  }

  hit() {
    if (this.defeated || this.scene.time.now < this.invulnerableUntil) return false;

    this.health -= 1;
    this.invulnerableUntil = this.scene.time.now + 350;
    this.scene.audio?.bossHit();

    this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: 60,
      yoyo: true,
      repeat: 3
    });

    if (this.health <= 0) {
      this.defeat();
    }

    return true;
  }

  defeat() {
    if (this.defeated) return;

    this.defeated = true;
    this.body.enable = false;
    this.setVelocity(0, 0);
    this.scene.audio?.bossDefeat();

    this.scene.tweens.add({
      targets: this,
      scale: 1.35,
      angle: 360,
      alpha: 0,
      duration: 850,
      ease: "Power2",
      onComplete: () => {
        this.scene.finishBoss();
      }
    });
  }

  static createTexture(scene) {
    if (scene.textures.exists("boss-idle")) return;

    const g = scene.add.graphics();

    g.fillStyle(0x38466e, 1);
    g.fillRoundedRect(12, 22, 104, 100, 28);

    g.fillStyle(0x26334d, 1);
    g.fillTriangle(26, 30, 20, 3, 43, 21);
    g.fillTriangle(102, 30, 108, 3, 85, 21);

    g.fillStyle(0xff5d72, 1);
    g.fillCircle(64, 61, 30);

    g.fillStyle(0xffd34e, 1);
    g.fillCircle(49, 60, 8);
    g.fillCircle(79, 60, 8);

    g.fillStyle(0x172035, 1);
    g.fillCircle(51, 61, 3);
    g.fillCircle(77, 61, 3);

    g.fillStyle(0x8fe7ff, 1);
    g.fillRoundedRect(38, 80, 52, 10, 5);

    g.fillStyle(0x172035, 1);
    g.fillRoundedRect(25, 110, 31, 11, 4);
    g.fillRoundedRect(72, 110, 31, 11, 4);

    g.lineStyle(6, 0xffd34e, 1);
    g.strokeCircle(64, 61, 42);

    g.generateTexture("boss-idle", 128, 140);
    g.destroy();
  }
}
