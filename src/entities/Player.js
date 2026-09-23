import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    Player.createTextures(scene);

    super(scene, x, y, "hero-idle");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);
    this.setDragX(1400);
    this.setMaxVelocity(520, 1000);
    this.body.setSize(34, 54);
    this.body.setOffset(15, 12);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.W,
      run: Phaser.Input.Keyboard.KeyCodes.SHIFT
    });

    this.runSpeed = 430;
    this.walkSpeed = 285;
    this.jumpVelocity = -640;
    this.coyoteWindow = 110;
    this.coyoteTimer = 0;

    scene.anims.create({
      key: "hero-idle",
      frames: [{ key: "hero-idle" }],
      frameRate: 1,
      repeat: -1
    });

    scene.anims.create({
      key: "hero-run",
      frames: [
        { key: "hero-run-1" },
        { key: "hero-run-2" },
        { key: "hero-run-3" },
        { key: "hero-run-4" }
      ],
      frameRate: 12,
      repeat: -1
    });

    scene.anims.create({
      key: "hero-jump",
      frames: [{ key: "hero-jump" }],
      frameRate: 1,
      repeat: -1
    });

    this.play("hero-idle");
  }

  update(delta) {
    const onGround = this.body.blocked.down || this.body.touching.down;

    if (onGround) {
      this.coyoteTimer = this.coyoteWindow;
    } else {
      this.coyoteTimer -= delta;
    }

    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const running = this.cursors.shift.isDown || this.keys.run.isDown;
    const speed = running ? this.runSpeed : this.walkSpeed;

    if (left && !right) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (right && !left) {
      this.setVelocityX(speed);
      this.setFlipX(false);
    } else if (onGround) {
      this.setVelocityX(Phaser.Math.Linear(this.body.velocity.x, 0, 0.28));
    } else {
      this.setVelocityX(Phaser.Math.Linear(this.body.velocity.x, 0, 0.06));
    }

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump);

    if (jumpPressed && (onGround || this.coyoteTimer > 0)) {
      this.setVelocityY(this.jumpVelocity);
      this.coyoteTimer = 0;
    }

    if (!onGround) {
      this.play("hero-jump", true);
    } else if (Math.abs(this.body.velocity.x) > 25) {
      this.play("hero-run", true);
    } else {
      this.play("hero-idle", true);
    }
  }

  static createTextures(scene) {
    const textures = [
      ["hero-idle", 0],
      ["hero-run-1", -4],
      ["hero-run-2", 0],
      ["hero-run-3", 4],
      ["hero-run-4", 0],
      ["hero-jump", -2]
    ];

    textures.forEach(([key, legShift]) => {
      if (scene.textures.exists(key)) return;

      const g = scene.add.graphics();

      // Cape/scarf.
      g.fillStyle(0xff5d72, 1);
      g.fillTriangle(13, 34, 3, 56, 17, 49);

      // Legs and boots.
      g.fillStyle(0x26334d, 1);
      g.fillRoundedRect(18 + legShift, 53, 10, 15, 4);
      g.fillRoundedRect(36 - legShift, 53, 10, 15, 4);

      g.fillStyle(0x172035, 1);
      g.fillRoundedRect(14 + legShift, 65, 16, 7, 3);
      g.fillRoundedRect(34 - legShift, 65, 16, 7, 3);

      // Body.
      g.fillStyle(0x36d399, 1);
      g.fillRoundedRect(15, 32, 34, 27, 9);

      // Belt.
      g.fillStyle(0x172035, 1);
      g.fillRect(16, 50, 32, 5);
      g.fillStyle(0xffd34e, 1);
      g.fillRect(28, 49, 8, 7);

      // Head.
      g.fillStyle(0xffc58f, 1);
      g.fillCircle(32, 20, 15);

      // Hair.
      g.fillStyle(0x25345a, 1);
      g.fillCircle(32, 13, 14);
      g.fillRect(19, 15, 26, 8);

      // Face opening.
      g.fillStyle(0xffc58f, 1);
      g.fillCircle(34, 21, 11);

      // Visor.
      g.fillStyle(0x8fe7ff, 1);
      g.fillRoundedRect(27, 17, 15, 7, 3);
      g.fillStyle(0x10213c, 1);
      g.fillCircle(37, 20, 2);

      // Arm accents.
      g.fillStyle(0x25345a, 1);
      g.fillRoundedRect(10, 36, 8, 18, 4);
      g.fillRoundedRect(46, 36, 8, 18, 4);

      // Chest emblem.
      g.fillStyle(0xffd34e, 1);
      g.fillCircle(32, 42, 5);
      g.fillStyle(0x25345a, 1);
      g.fillCircle(32, 42, 2);

      g.generateTexture(key, 64, 80);
      g.destroy();
    });
  }
}
