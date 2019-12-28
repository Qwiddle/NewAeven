import Client from '../client.js';

export default class HomeScene extends Phaser.Scene {
    constructor () {
        super({key: 'home'});
    }

    preload () {

    }

    play () {
        this.scene.start('game');
    }

    create () {
        const self = this;
        this.add.image(this.centerX(), this.centerY(), 'bg');
    }

    centerX () {
        return this.sys.game.config.width / 2;
    }
    centerY () {
        return this.sys.game.config.height / 2;
    }

}