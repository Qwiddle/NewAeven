export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'boot' });

    }

    init(data) {
        this.client = data.client;
    }

    preload() {
        this.load.json('assets', '../../assets/json/assets.json');
        this.load.image('logo', '../../assets/logo.png');
    }

    create() {
        this.client.connect();
        this.scene.start('load', { client: this.client});
    }
}