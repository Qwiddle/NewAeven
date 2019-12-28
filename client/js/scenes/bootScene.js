export default class BootScene extends Phaser.Scene {
    constructor () {
        super({ key: 'boot' });
    }

    preload () {
        this.load.json('assets', '../../assets/json/assets.json');
        this.load.image('logo', '../../assets/logo.png');
    }

    create () {
        this.scene.start('load');
    }
}