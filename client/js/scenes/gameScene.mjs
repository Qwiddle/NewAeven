import { MapRenderer } from '../render/mapRenderer.mjs';
import { PlayerSprite } from '../render/playerSprite.mjs';
import { EnemySprite } from '../render/enemySprite.mjs';

export class GameScene extends Phaser.Scene {
	constructor() {
		super({key: 'game'});
		this.sprites = [];
		this.enemies = [];
	}

	init(data) {
		this.client = data.client;
	}

	preload() {

	}

	update() {
		this.cullMap();
		this.updateSprites();
	}

	updateSprites() {
		this.updatePlayers();
		this.updateEnemies();
	}

	updatePlayers() {
		this.playerGroup.children.entries.forEach((sprite) => {
			sprite.update();
		});

		for(let key in this.client.game.players) {
			if(this.sprites.hasOwnProperty(key)) {
				//exists
			} else {
				let player = new PlayerSprite({
					scene: this,
					key: 'base_0_0',
					player: this.client.game.players[key],
					x: this.client.game.players[key].targetPos.x,
					y: this.client.game.players[key].targetPos.y,
				});

				this.sprites[key] = player;
			}
		}
	}

	updateEnemies() {
		this.enemyGroup.children.entries.forEach((enemy) => {
			enemy.update();
		});

		for (let key in this.client.game.enemies) {
			if (this.enemies.hasOwnProperty(key)) {
				//exists
			} else {
				this.enemies[key] = new EnemySprite({
					scene: this,
					key: this.client.game.enemies[key].type,
					enemy: this.client.game.enemies[key],
					x: this.client.game.enemies[key].targetPos.x,
					y: this.client.game.enemies[key].targetPos.y,
				});
			}
		}
	}
		
	create() {
		this.client.game.mapRenderer = new MapRenderer(this, this.client.game.player.mapJson);
		this.client.game.mapRenderer.drawMap();
		this.client.game.clientController.addKeyListeners();

		this.cameras.main.fadeIn(450);

		this.playerGroup = this.add.group();
		this.enemyGroup = this.add.group();

		this.player = new PlayerSprite({
			scene: this,
			key: 'base_0_0',
			player: this.client.game.player,
			x: this.client.game.player.targetPos.x,
			y: this.client.game.player.targetPos.y,
		});

		this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
		this.sound.pauseOnBlur = false;
		this.sound.play('login');

		this.game.events.on('hidden', function() {
			//hidden
		}, this);

		this.game.events.on('visible', function() {
			//catch up
		}, this);
	}

	cullMap() {
		let children = this.children.getChildren();

		for (let child of children)
			child.visible = false;

		let visible = this.cameras.main.cull(children);
		
		for (let child of visible)
			child.visible = true;
	}

	mouseEvent(sprite, pointer) {

	}
}