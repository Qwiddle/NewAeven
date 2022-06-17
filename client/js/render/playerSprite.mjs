import { global } from '../global.mjs';

export class PlayerSprite extends Phaser.GameObjects.Container {
	constructor(config) {
		super(config.scene, config.x, config.y);

		this.textStyle = {
			font: '13px Tahoma',
			fill: 'white',
			stroke: '#000',
			strokeThickness: 3
		}

		this.scene = config.scene;
		this.scene.add.existing(this);
		this.player = config.player;
		this.name = this.player.username;
		this.sex = this.player.sex;
		this.race = this.player.race;
		this.entity = this.scene.add.sprite(0, 0, 'base_' + this.player.sex + '_' + this.player.race).setOrigin(0.5);
		this.bubble = this.scene.add.container();
		this.chatBubbleText = this.scene.add.text();
		this.chatBubble = this.scene.add.graphics();
		this.nameText = this.scene.add.text(0, -40).setOrigin(0.5);
		this.nameText.setStyle(this.textStyle);
	
		this.cameraDolly = new Phaser.Geom.Point(this.x, this.y);

		this.add(this.entity);
		this.setSize(this.entity.width, this.entity.width);
		this.addAnimations();
		this.addHover();
		this.scene.playerGroup.add(this);

		this.player.isMoving = false;
		this.player.isAttacking = false;
		this.player.positionUpdated = false;
	}

	update() {
		this.cameraDolly.x = Math.floor(this.x);
   		this.cameraDolly.y = Math.floor(this.y);
		this.depth = (this.y + this.height) + 64;

		if (this.player.isAttacking && !this.player.inAttack) {
			this.player.isMoving = true;
			this.player.inAttack = true;
			this.attack();
		} else if(!this.player.isMoving) {
			if(this.player.targetPos.x != this.x || this.player.targetPos.y != this.y) {
				this.interpolate();
			} else {
				if(this.player.dir == global.direction.right || this.player.dir == global.direction.staticRight || this.player.dir == global.direction.up || this.player.dir == global.direction.staticUp) {
					this.entity.flipX = true;
				} else if(this.player.dir == global.direction.left || this.player.dir == global.direction.staticLeft || this.player.dir == global.direction.down || this.player.dir == global.direction.staticDown) {
					this.entity.flipX = false;
				}

				this.entity.setFrame(this.dirFrame[this.player.dir]);
			}
		}
	
		this.updateChat();
	}

	interpolate() {	
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
			ease: 'Power0',
			onComplete: () => {  
				this.player.isMoving = false;
				this.positionUpdated = false;
			}
		});
	}

	attack() {
		if(!this.inAttack) {
			if(this.player.dir == global.direction.left) {
				this.entity.play('attackLeft');
			} else if(this.player.dir == global.direction.right) {
				this.entity.play('attackRight');
			} else if(this.player.dir == global.direction.up) {
				this.entity.play('attackUp');
			} else if(this.player.dir == global.direction.down) {
				this.entity.play('attackDown');
			}

			this.scene.sound.play('attack');
		}		
	}

	drawChatBubble(width, height, text) {
		this.chatBubble.destroy();
		this.chatBubbleText.destroy();

		let arrowRad = 2;
		let bubbleWidth = width + arrowRad * 2
		let bubbleHeight = height + arrowRad * 2;
		let curr = {x: width / 2, y: height + arrowRad};
		let cornerLength = 2;

		this.bubble = this.scene.add.container();
		this.chatBubble = this.scene.add.graphics();
		this.chatBubbleText = this.scene.add.text();

		this.chatBubble.setAlpha(0);
		this.chatBubbleText.setFontFamily('Tahoma');
		this.chatBubbleText.setFontSize(13);
		this.chatBubble.fillStyle(0x402B00, 1);
		this.chatBubble.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight, bubbleWidth - 5, bubbleHeight, 4);
		this.chatBubbleText.setText(text);
		this.chatBubbleText.setPosition(4 + (-bubbleWidth / 2), 2 + (-bubbleHeight));
		this.bubble.add(this.chatBubbleText);
		this.bubble.add(this.chatBubble);
		
		this.bubble.bringToTop(this.chatBubbleText);
		this.bubble.y = -30;
		this.bubble.x = 3;

		this.scene.tweens.add({
			targets: this.chatBubble,
			alpha: 0.7,
			duration: 200,
			ease: 'Power2'
		});

		this.scene.tweens.add({
			targets: this.chatBubbleText,
			alpha: 0.9,
			duration: 200,
			ease: 'Power2'
		});

		this.add(this.bubble);
	}

	updateChat() {
		if (this.player.messageUpdated) {
			this.player.messageUpdated = false;
			this.chatIsVisible = true;
			this.updateChatBubble();
		} else if (Date.now() > this.player.messageDelay) {
			this.scene.tweens.add({
				targets: this.chatBubble,
				alpha: 0,
				duration: 300,
				ease: 'Power2'
			});

			this.scene.tweens.add({
				targets: this.chatBubbleText,
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

			let chatWidth = 2 * Math.round((maxLength + 10) / 2);
			let chatHeight = 2 * Math.round((15 * newLineCount) / 2);

			let bubbleWidth = chatWidth + 2 * 2;
			let bubbleHeight = chatHeight * 2;

			this.drawChatBubble(chatWidth, chatHeight, finalStr);
		}
	}

	animComplete(animation, frame) {
		if(animation.key === 'attackDown' || animation.key === 'attackRight' || animation.key === 'attackLeft' || animation.key === 'attackUp') {
			this.player.isAttacking = false;
			this.player.isMoving = false;
			this.player.inAttack = false;
			this.entity.setFrame(this.dirFrame[this.player.dir]);
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
				duration: 400,
			},
			attackRight: {
				key: 'attackRight',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 12, end: 13}),
				duration: 400,
			},
			attackLeft: {
				key: 'attackLeft',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 14, end: 15}),
				duration: 400,
			},
			attackUp: {
				key: 'attackUp',
				frames: this.scene.anims.generateFrameNumbers('base_0_0', {start: 14, end: 15}),
				duration: 400,
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

		this.entity.on('animationcomplete', this.animComplete, this);

		this.initDirFrames();
		this.initAttackFrames();
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

	initAttackFrames() {
		this.attackFrame = new Array(9);
		this.attackFrame[global.direction.left] = 'attackLeft';
		this.attackFrame[global.direction.staticLeft] = 'attackLeft';
		this.attackFrame[global.direction.right] = 'attackDown';
		this.attackFrame[global.direction.staticRight] = 'attackDown';
		this.attackFrame[global.direction.up] = 'attackLeft';
		this.attackFrame[global.direction.staticUp] = 'attackLeft';
		this.attackFrame[global.direction.down] = 'attackDown'
		this.attackFrame[global.direction.staticDown] = 'attackDown';
		this.attackFrame[global.direction.none] = 'attackDown';
	}

	addHover() {
		this.add(this.nameText);
		this.nameText.setText(this.player.username);
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

	removeFromScene() {
		this.scene.playerGroup.remove(this);
		this.destroy();
		this.remove();
	}
}