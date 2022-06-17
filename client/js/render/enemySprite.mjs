import { global } from '../global.mjs';

export class EnemySprite extends Phaser.GameObjects.Container {
	constructor(config) {
		super(config.scene, config.x, config.y);
		this.scene = config.scene;
		this.scene.add.existing(this);
		this.enemy = config.enemy;
		this.key = config.key;
		this.nameText = this.scene.add.text(0, -16).setOrigin(0.5);
		this.nameText.setFontFamily('Tahoma');
		this.nameText.setFontSize(13);
		this.nameText.setStroke('#000', 3);

		this.entity = this.scene.add.sprite(0, 22).setOrigin(0.5);

		this.entity.setTexture(this.key);
		this.add(this.entity);
		this.scene.enemyGroup.add(this);
		this.setSize(64, 32);
		this.addAnimations();
		this.addHover();
	}

	update() {
		this.depth = (this.y + this.height) + 60;

		if(this.enemy.isAttacking) {
			this.enemy.isMoving = true;
			this.enemy.isAttacking = false;
			this.attack();
		} else if(!this.enemy.isMoving) {
			this.interpolate();
		}
	}

	interpolate() {
		if(this.enemy.targetPos.x != this.x || this.enemy.targetPos.y != this.y) {
			this.enemy.isMoving = true;

			this.playAnimation(this.enemy);

			this.tween = this.scene.tweens.add({
				targets: this,
				x: this.enemy.targetPos.x,
				y: this.enemy.targetPos.y,
				duration: 450,
				ease: 'Linear',
				onComplete: () => {  
					this.entity.setFrame(this.dirFrame[this.enemy.dir]);
					this.enemy.isMoving = false;
				}
			});
		} else {
			this.entity.setFrame(this.dirFrame[this.enemy.dir]);
		}
	}

	attack() {
		switch(this.enemy.dir) {
			case global.direction.left: {
				this.entity.flipX = false;
				this.entity.play('enemyAttackLeft');
				break;
			}

			case global.direction.right: {
				this.entity.play('enemyAttackRight');
				this.entity.flipX = true;
				break;
			}

			case global.direction.up: {
				this.entity.flipX = true;
				this.entity.play('enemyAttackUp');
				break;
			}

			case global.direction.down: {
				this.entity.flipX = false;
				this.entity.play('enemyAttackDown');
				break;
			}
		}
		this.scene.sound.play('attack');
	}

	animComplete(animation, frame) {
		this.enemy.isMoving = false;
	}

	addHover() {
		this.add(this.nameText);
		this.nameText.setText(this.enemy.name);
		this.nameText.setVisible(false);

		this.entity.setInteractive({
			pixelPerfect: true
		});

		this.entity.on('pointerover', (pointer) => {
			this.nameText.setVisible(true);
		});

		this.entity.on('pointerout', (pointer) => {
			this.nameText.setVisible(false);
		});
	}

	addAnimations() {
		this.animations = {
			walkDown: { 
				key: 'enemyDown',
				frames: this.scene.anims.generateFrameNumbers(this.key, {start: 6, end: 9}),
				duration: 550,
			},
			walkRight: {
				key: 'enemyRight',
				frames: this.scene.anims.generateFrameNumbers(this.key, {start: 6, end: 9}),
				duration: 550,
			},
			walkLeft: {
				key: 'enemyLeft',
				frames: this.scene.anims.generateFrameNumbers(this.key, {start: 1, end: 4}),
				duration: 550,
			},
			walkUp: {
				key: 'enemyUp',
				frames: this.scene.anims.generateFrameNumbers(this.key, {start: 1, end: 4}),
				duration: 550,
			},
			attackDown: {
				key: 'enemyAttackDown',
				frames: this.scene.anims.generateFrameNumbers(this.key, {start: 12, end: 13}),
				duration: 550,
			},
			attackRight: {
				key: 'enemyAttackRight',
				frames: this.scene.anims.generateFrameNumbers(this.key, {start: 12, end: 13}),
				duration: 550,
			},
			attackLeft: {
				key: 'enemyAttackLeft',
				frames: this.scene.anims.generateFrameNumbers(this.key, {start: 10, end: 11}),
				duration: 550,
			},
			attackUp: {
				key: 'enemyAttackUp',
				frames: this.scene.anims.generateFrameNumbers(this.key, {start: 10, end: 11}),
				duration: 550,
			},
		}

		this.scene.anims.create(this.animations.walkDown);
		this.scene.anims.create(this.animations.walkRight);
		this.scene.anims.create(this.animations.walkLeft);
		this.scene.anims.create(this.animations.walkUp);
		this.scene.anims.create(this.animations.attackDown);
		this.scene.anims.create(this.animations.attackRight);
		this.scene.anims.create(this.animations.attackLeft);
		this.scene.anims.create(this.animations.attackUp);

		this.initDirFrames();
		this.initAttackFrames();

		this.entity.on('animationcomplete', this.animComplete, this);
	}

	initDirFrames() {
		this.dirFrame = new Array(9);
		this.dirFrame[global.direction.left] = 0;
		this.dirFrame[global.direction.staticLeft] = 0;
		this.dirFrame[global.direction.right] = 5;
		this.dirFrame[global.direction.staticRight] = 5;
		this.dirFrame[global.direction.up] = 0;
		this.dirFrame[global.direction.staticUp] = 0;
		this.dirFrame[global.direction.down] = 5;
		this.dirFrame[global.direction.staticDown] = 5;
		this.dirFrame[global.direction.none] = 0;
	}

	initAttackFrames() {
		this.attackFrame = new Array(9);
		this.attackFrame[global.direction.left] = 'enemyAttackLeft';
		this.attackFrame[global.direction.staticLeft] = 'enemyAttackLeft';
		this.attackFrame[global.direction.right] = 'enemyAttackDown';
		this.attackFrame[global.direction.staticRight] = 'enemyAttackDown';
		this.attackFrame[global.direction.up] = 'enemyAttackLeft';
		this.attackFrame[global.direction.staticUp] = 'enemyAttackLeft';
		this.attackFrame[global.direction.down] = 'enemyAttackDown'
		this.attackFrame[global.direction.staticDown] = 'enemyAttackDown';
		this.attackFrame[global.direction.none] = 'enemyAttackDown';
	}

	playAnimation() {
		switch(this.enemy.dir) {
			case global.direction.left: {
				this.entity.flipX = false;
				this.entity.play('enemyLeft');
				break;
			}

			case global.direction.right: {
				this.entity.flipX = true;
				this.entity.play('enemyRight');
				break;
			}

			case global.direction.up: {
				this.entity.flipX = true;
				this.entity.play('enemyUp');
				break;
			}

			case global.direction.down: {
				this.entity.flipX = false;
				this.entity.play('enemyDown');
				break;
			}
		}
	}

	removeFromScene() {
		this.destroy();
	}
}