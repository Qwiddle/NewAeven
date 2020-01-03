import Client from '../client.js';
import Viewloader from '../viewloader.js';

export default class GameScene extends Phaser.Scene {
	constructor () {
        super({key: 'game'});
    }

    init(data) {
    	this.client = data.client;
    }

    preload () {
    	
    }

    create () {
    	console.log(this.client.game.player.username);
    }
}