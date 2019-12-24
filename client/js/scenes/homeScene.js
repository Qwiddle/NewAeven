import Client from '../client.js';

export default class HomeScene extends Phaser.Scene {
    constructor () {
        super({key: 'home'});
        this.client = new Client();
        console.log(this.client);
    }

    preload () {

    }

    play () {
        this.scene.start('game');
    }

    create () {
        const self = this;
        this.add.image(this.centerX(), this.centerY(), 'bg');
        $("#home").fadeIn();
        $('#home').css('display', 'flex');
    }

    centerX () {
        return this.sys.game.config.width / 2;
    }
    centerY () {
        return this.sys.game.config.height / 2;
    }

}