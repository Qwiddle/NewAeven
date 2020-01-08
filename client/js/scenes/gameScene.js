import Viewloader from '../viewLoader.js';
import PlayerSprite from '../render/playerSprite.js';
import MapRenderer from '../render/mapRenderer.js';
import global from '../../global.js';
	
export default class GameScene extends Phaser.Scene {
	constructor () {
        super({key: 'game'});
    }

    init(data) {
    	this.client = data.client;
    	this.client.game.sprites = {};
    }

    preload() {
    }

    create() {
    	this.playerSprite = new PlayerSprite(this.client.game.player, this);
    	this.client.game.mapRenderer = new MapRenderer(this, this.client.game.player.mapJson);    
    	this.client.game.mapRenderer.drawMap();
    	this.cameras.main.fadeIn(750);
    	this.cameras.main.startFollow(this.playerSprite.sprite, false);

    	this.game.events.on('hidden', function() {
    		//hidden
		}, this);

		this.game.events.on('visible', function() {
    		//catch up
		}, this);

		this.playerSprite.sprite.on('animationcomplete', this.animComplete, this);
    }	

    update() {
    	this.cullMap();
    	this.updateSelf();
   		this.updatePlayers();
    }

    updateSelf() {
    	this.updateSprite(this.client.game.player, this.playerSprite);
    }

    updatePlayers() {
    	for (let key in this.client.game.players) {
            if (this.client.game.sprites.hasOwnProperty(key)) {
                this.updateSprite(this.client.game.players[key], this.client.game.sprites[key]);
            } else if(this.client.game.players[key].username != this.client.game.player.username) {
            	console.log(this.client.game.players[key]);
                this.client.game.sprites[key] = new PlayerSprite(this.client.game.players[key], this);
            }
        }
    }

    updateSprite(player, sprite) {
    	sprite.sprite.depth = sprite.sprite.y + 128;

    	if (player.isAttacking) {
            this.attack(player, sprite);
            player.isMoving = true;
        } else if (!player.isMoving) {
            if (sprite.sprite.x != player.targetPos.x || sprite.sprite.y != player.targetPos.y) {
            	player.isMoving = true;
            	this.interpolate(player, sprite);
            } else {
                if (player.dir == global.direction.staticDown || player.dir == global.direction.staticLeft || player.dir == global.direction.down || player.dir == global.direction.left) {
                    sprite.sprite.flipX = false;
                } else if (player.dir == global.direction.staticRight || player.dir == global.direction.staticUp || player.dir == global.direction.up || player.dir == global.direction.right) {
                    sprite.sprite.flipX = true;
                }

                sprite.sprite.setFrame(sprite.dirFrame[player.dir]);
            }
        }
    }

    left(player, sprite) {
        return player.targetPos.x < sprite.sprite.x && player.targetPos.y < sprite.sprite.y;
    }

    right(player, sprite) {
        return player.targetPos.x > sprite.sprite.x && player.targetPos.y > sprite.sprite.y;
    }

    up(player, sprite) {
        return player.targetPos.x > sprite.sprite.x && player.targetPos.y < sprite.sprite.y;
    }

    down(player, sprite) { 
        return player.targetPos.x < sprite.sprite.x && player.targetPos.y > sprite.sprite.y;
    }

    attack(player, sprite) {
    	if(player.dir == global.direction.staticLeft || player.dir == global.direction.left) {
    		sprite.sprite.play('attackLeft');
    		sprite.sprite.flipX = false;
    	} else if(player.dir == global.direction.staticRight || player.dir == global.direction.right) {
    		sprite.sprite.play('attackRight');
    		sprite.sprite.flipX = true;
    	} else if(player.dir == global.direction.staticUp || player.dir == global.direction.up) {
    		sprite.sprite.play('attackUp');
    		sprite.sprite.flipX = true;
    	} else if(player.dir == global.direction.staticDown || player.dir == global.direction.down) {  
    		sprite.sprite.play('attackDown');
    		sprite.sprite.flipX = false;
    	}
    }

    interpolate(player, sprite) {
    	this.tweens.killTweensOf(sprite);

    	if (this.left(player, sprite)) {
            sprite.sprite.flipX = false;
           	sprite.sprite.play('left');
        } else if (this.right(player, sprite)) {
            sprite.sprite.flipX = true;
            sprite.sprite.play('right');
        } else if (this.up(player, sprite)) {
            sprite.sprite.flipX = true;
            sprite.sprite.play('up');
        } else if (this.down(player, sprite)) {
			sprite.sprite.flipX = false;            
			sprite.sprite.play('down');
        }

        sprite.tween = this.tweens.add({
    		targets: sprite.sprite,
    		x: player.targetPos.x,
    		y: player.targetPos.y,
    		duration: player.walkTime,
    		ease: 'Power0',
    		onComplete: function() {  
    			player.positionUpdated = false;
    			player.isMoving = false;

    			if (sprite.sprite.x == player.targetPos.x &&
                	sprite.sprite.y == player.targetPos.y) {
    				sprite.sprite.setFrame(sprite.dirFrame[player.dir]);
            	} 
    		}
    	});

    }   

    animComplete(animation, frame) {
    	if(animation.key === 'attackLeft' || animation.key === 'attackRight' || animation.key === 'attackDown' || animation.key === 'attackUp') {
			this.client.game.player.isAttacking = false;
			this.client.game.player.isMoving = false;
    	}
    }

    cullMap() {
    	let children = this.children.getChildren();

	    for (let child of children)
	        child.visible = false;

	    let visible = this.cameras.main.cull(children);
	    
	    for (let child of visible)
	        child.visible = true;
    }
}