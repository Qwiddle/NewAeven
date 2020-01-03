import ViewLoader from '../viewLoader.js';
import Game from '../game.js';

export default class HomeScene extends Phaser.Scene {
    constructor() {
        super({key: 'home'});
    }

    init(data) {
        this.client = data.client;
    }

    preload() {

    }

    play() {
        this.scene.start('game', { client: this.client });
    }

    create() {
        this.add.image(this.centerX(), this.centerY(), 'bg');
    }

    update() {
        if(this.client.game.initialized) { this.play(); }
    }

    centerX() {
        return this.sys.game.config.width / 2;
    }
    centerY() {
        return this.sys.game.config.height / 2;
    }

}