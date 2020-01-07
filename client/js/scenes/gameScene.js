import Viewloader from '../viewloader.js';
import PlayerSprite from '../render/playerSprite.js';
import MapRenderer from '../render/mapRenderer.js';
import global from '../../global.js';
	
export default class GameScene extends Phaser.Scene {
	constructor () {
        super({key: 'game'});
    }

    init(data) {
    	this.client = data.client;
    	this.mapJson = this.client.game.player.mapJson;
    }

    preload() {
    	
    }

    create() {
    	this.cameras.main.fadeIn(750);
    	this.client.game.mapRenderer = new MapRenderer(this, this.mapJson);    
    	this.client.game.mapRenderer.drawMap();
    	this.game.playerSprite = new PlayerSprite(this.client.game.player, this);
    	this.cameras.main.startFollow(this.game.playerSprite.sprite, false);
    }	

    update() {
    	this.cullMap();
   		this.updateSelf();
    }

    updateSelf() {
    	this.updateSprite(this.client.game.player, this.game.playerSprite);
    }

    updateSprite(player, sprite) {
    	this.game.playerSprite.sprite.depth =  this.client.game.player.targetPos.y + 128;
    	if (player.isAttacking) {
            player.isMoving = true;
            this.attack(player, sprite);
        } else if (!player.isMoving) {
            if (sprite.sprite.x != player.targetPos.x || sprite.sprite.y != player.targetPos.y) {
            	player.isMoving = true;
            	this.interpolate(player, sprite);
            } else {
                if (player.dir == global.direction.staticDown || player.dir == global.direction.staticleft || player.dir == global.direction.down || player.dir == global.direction.left) {
                    sprite.sprite.flipX = false;
                } else if (player.dir == global.direction.staticRight || player.dir == global.direction.staticUp || player.dir == global.direction.up || player.dir == global.direction.right) {
                    sprite.sprite.flipX = true;
                }

                sprite.sprite.setFrame(sprite.dirFrame[player.dir]);
            }
        }
    }

    interpolate(player, sprite) {
    	this.tweens.killTweensOf(sprite);
    	const self = this;

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
    	player.isAttacking = false;
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