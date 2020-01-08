import global from '../../global.js';

export default class PlayerSprite {
	constructor(player, phaser) {
		this.sex = player.sex;
		this.race = player.race;
		this.name = player.name;
		this.phaser = phaser;

		this.sprite = phaser.add.sprite(player.targetPos.x, player.targetPos.y, 'base_' + player.sex + '_' + player.race);
		
		player.isMoving = false;
		player.positionUpdated = false;

		this.sprite.depth = player.targetPos.y + 128;

		this.addAnimations(this.sprite);
	}

	addAnimations(sprite) {
		this.animations = {
			walkDown: {	
				key: 'down',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 2, end: 5}),
				duration: 450,
			},
			walkRight: {
				key: 'right',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 2, end: 5}),
				duration: 450,
			},
			walkLeft: {
				key: 'left',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 6, end: 9}),
				duration: 450,
			},
			walkUp: {
				key: 'up',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 6, end: 9}),
				duration: 450,
			},
			attackDown: {
				key: 'attackDown',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 12, end: 13}),
				duration: 400,
			},
			attackRight: {
				key: 'attackRight',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 12, end: 13}),
				duration: 400,
			},
			attackLeft: {
				key: 'attackLeft',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 14, end: 15}),
				duration: 400,
			},
			attackUp: {
				key: 'attackUp',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 14, end: 15}),
				duration: 400,
			},
		}

		this.phaser.anims.create(this.animations.walkDown);
		this.phaser.anims.create(this.animations.walkRight);
		this.phaser.anims.create(this.animations.walkLeft);
		this.phaser.anims.create(this.animations.walkUp);
		this.phaser.anims.create(this.animations.attackDown);
		this.phaser.anims.create(this.animations.attackRight);
		this.phaser.anims.create(this.animations.attackLeft);
		this.phaser.anims.create(this.animations.attackUp);

		this.initDirFrames();
	}

	initDirFrames() {
        this.dirFrame = new Array(9);
        this.dirFrame[global.direction.left] = 1;
        this.dirFrame[global.direction.staticLeft] = 1;
        this.dirFrame[global.direction.right] = 0;
        this.dirFrame[global.direction.staticRight] = 0;
        this.dirFrame[global.direction.up] = 1;
        this.dirFrame[global.direction.staticUp] = 1;
        this.dirFrame[global.direction.down] = 0;
        this.dirFrame[global.direction.staticDown] = 0;
        this.dirFrame[global.direction.none] = 0;
    }
}