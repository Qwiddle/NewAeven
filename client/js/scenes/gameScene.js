import MapRenderer from '../render/mapRenderer.js';
import PlayerSprite from '../render/playerSprite.js';

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({key: 'game'});
		this.sprites = [];
	}

	init(data) {
		this.client = data.client;
	}

	preload() {
	}

	update() {
        this.cullMap();

        for(let key in this.client.game.players) {
        	if(this.sprites.hasOwnProperty(key)) {
        		//console.log('exists');
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

        this.playerGroup.children.entries.forEach((sprite) => {
        	sprite.update();
        });
    }

	create() {
		this.client.game.mapRenderer = new MapRenderer(this, this.client.game.player.mapJson);
		this.sound.play('login');

		this.client.game.clientController.addKeyListeners();
		this.client.game.scene = this;

		this.client.game.mapRenderer.drawMap();
    	this.cameras.main.fadeIn(750);
    	this.cameras.main.setZoom(1);
    	this.cameras.main.setRoundPixels(true);

    	this.playerGroup = this.add.group();
    	//this.enemyGroup = this.add.group();

    	this.game.events.on('hidden', function() {
    		//hidden
		}, this);

		this.game.events.on('visible', function() {
    		//catch up
		}, this);

        this.player = new PlayerSprite({
        	scene: this,
        	key: 'base_0_0',
        	player: this.client.game.player,
        	x: this.client.game.player.targetPos.x,
        	y: this.client.game.player.targetPos.y,
        });

        this.cameras.main.startFollow(this.player, true, 0.4 , 0.4);
        this.sound.pauseOnBlur = false;
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