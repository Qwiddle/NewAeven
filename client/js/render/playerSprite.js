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
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 2, end: 5, first: 2}),
				frameRate: 10,
			},
			walkRight: {
				key: 'right',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 2, end: 5, first: 2}),
				frameRate: 10,
			},
			walkLeft: {
				key: 'left',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 6, end: 9, first: 6}),
				frameRate: 10,
			},
			walkUp: {
				key: 'up',
				frames: this.phaser.anims.generateFrameNumbers('base_0_0', {start: 6, end: 9, first: 6}),
				frameRate: 10,
			}
		}

		this.phaser.anims.create(this.animations.walkDown);
		this.phaser.anims.create(this.animations.walkRight);
		this.phaser.anims.create(this.animations.walkLeft);
		this.phaser.anims.create(this.animations.walkUp);

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