import global from '../global.js';

export default class PlayerSprite extends Phaser.GameObjects.Container {
	constructor(config) {
		super(config.scene, config.x, config.y);
		this.scene = config.scene;
		this.scene.add.existing(this);

		this.player = config.player;
		this.name = this.player.username;
		this.sex = this.player.sex;
		this.race = this.player.race;

		this.entity = this.scene.add.sprite(0, 0, 'base_' + this.player.sex + '_' + this.player.race);

		this.setSize(this.entity.width, this.entity.width);
		this.entity.depth = this.player.targetPos.y + 128;

		this.addAnimations();

		this.player.isMoving = false;
		this.player.isAttacking = false;
		this.player.positionUpdated = false;
		this.bubble = this.scene.add.container();
		this.chatBubbleText = this.scene.add.text();
		this.chatBubble = this.scene.add.graphics();

		this.chatBubbleText.setFontFamily('Tahoma');
		this.chatBubbleText.setFontSize(13);

		this.add(this.entity);

		this.scene.playerGroup.add(this);
	}

	update() {
		this.depth = this.y + this.height;
		this.interpolate();
		this.updateChat();
	}

	interpolate() {	
		if(!this.player.isMoving) {
			if(this.player.targetPos.x != this.x || this.player.targetPos.y != this.y) {
				this.player.isMoving = true;
				if (this.left()) {
					this.entity.flipX = false;
					this.entity.play('left');
				} else if (this.right()) {
					this.entity.flipX = true;
					this.entity.play('right');
				} else if (this.up()) {
					this.entity.flipX = true;
					this.entity.play('up');
				} else if (this.down()) {
					this.entity.flipX = false;
					this.entity.play('down');
				}

				this.tween = this.scene.tweens.add({
					targets: this,
					x: this.player.targetPos.x,
					y: this.player.targetPos.y,
					duration: this.player.walkTime,
					ease: 'Linear',
					onComplete: () => {  
						this.entity.setFrame(this.dirFrame[this.player.dir]);
						this.player.isMoving = false;
						this.positionUpdated = false;
					}
				});
			} else {
				if (this.player.dir == global.direction.staticDown ||
					this.player.dir == global.direction.staticLeft ||
					this.player.dir == global.direction.down ||
					this.player.dir == global.direction.left) {
					this.entity.flipX = false;
				} else if (this.player.dir == global.direction.staticRight ||
					this.player.dir == global.direction.staticUp ||
					this.player.dir == global.direction.up ||
					this.player.dir == global.direction.right) {
					this.entity.flipX = true;
				}

				this.entity.setFrame(this.dirFrame[this.player.dir]);
			}
		}
	}

	drawChatBubble(width, height) {
		this.chatBubble.destroy();

		let arrowRad = 2;
		let bubbleWidth = width + arrowRad * 2
		let bubbleHeight = height + arrowRad * 2;
		let curr = {x: width / 2, y: height + arrowRad};
		const cornerLength = 2;

		this.bubble = this.scene.add.container();
		this.chatBubble = this.scene.add.graphics();
		this.chatBubble.setAlpha(0);

		this.bubble.depth = this.depth * 2;

		this.scene.tweens.add({
			targets: this.chatBubble,
			alpha: 0.6,
			duration: 300,
			ease: 'Power2'
		});

		this.chatBubble.fillStyle(0x402B00, 1);
		this.chatBubble.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight, bubbleWidth - 5, bubbleHeight, 4);
		this.chatBubbleText.setPosition(4 + (-bubbleWidth / 2), 2 + (-bubbleHeight));
		this.bubble.add(this.chatBubble);
		this.bubble.add(this.chatBubbleText);
		this.bubble.bringToTop(this.chatBubbleText);
		this.bubble.y = -30;
		this.bubble.x = 3;
		this.add(this.bubble);
	}

	updateChat() {
		if (this.player.messageUpdated) {
			this.player.messageUpdated = false;
			this.chatIsVisible = true;
			this.updateChatBubble();
		} else if (Date.now() > this.player.messageDelay) {
			this.scene.tweens.add({
				targets: this.bubble,
				alpha: 0,
				duration: 300,
				ease: 'Power2'
			});

			this.scene.tweens.add({
				targets: this.chatBubble,
				alpha: 0,
				duration: 300,
				ease: 'Power2'
			});

			this.chatIsVisible = false;
		}
	}

	updateChatBubble() {
		if (Date.now() < this.player.messageDelay) {
			let finalStr = "";
			let str = this.player.message;
			console.log(str);
			let newLineCount = 0;
			let maxLength = 0;

			while (str.length > 0) {
				let tmpStr = str.substring(0, 35).trim();
				finalStr += tmpStr + '\n';
				this.chatBubbleText.setText(tmpStr);
				if (this.chatBubbleText.width > maxLength) {
					maxLength = this.chatBubbleText.width;
				}
				str = str.substring(35);
				newLineCount++;
			}

			let chatWidth = 2 * (Math.round((maxLength + 10) / 2));
			let chatHeight = 2 * Math.round((15 * newLineCount) / 2);

			let bubbleWidth = chatWidth + 2 * 2
			let bubbleHeight = chatHeight * 2;

			this.chatBubbleText.setText(finalStr);
			this.drawChatBubble(chatWidth, chatHeight);
		}
	}

	left() {
		return this.player.targetPos.x < this.x && this.player.targetPos.y < this.y;
	}

	right() {
		return this.player.targetPos.x > this.x && this.player.targetPos.y > this.y;
	}

	up() {
		return this.player.targetPos.x > this.x && this.player.targetPos.y < this.y;
	}

	down() { 
		return this.player.targetPos.x < this.x && this.player.targetPos.y > this.y;
	}

	addAnimations() {
		this.animations = {
			walkDown: { 
				key: 'down',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 2, end: 5}),
				duration: 450,
			},
			walkRight: {
				key: 'right',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 2, end: 5}),
				duration: 450,
			},
			walkLeft: {
				key: 'left',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 6, end: 9}),
				duration: 450,
			},
			walkUp: {
				key: 'up',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 6, end: 9}),
				duration: 450,
			},
			attackDown: {
				key: 'attackDown',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 12, end: 13}),
				duration: 500,
			},
			attackRight: {
				key: 'attackRight',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 12, end: 13}),
				duration: 500,
			},
			attackLeft: {
				key: 'attackLeft',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 14, end: 15}),
				duration: 500,
			},
			attackUp: {
				key: 'attackUp',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 14, end: 15}),
				duration: 500,
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

	removeFromScene() {
		this.scene.playerGroup.remove(this);
		this.destroy();
	}
}