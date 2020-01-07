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
        this.cameras.main.fadeOut(300);
        this.scene.start('game', { client: this.client });;
    }

    create() {
        this.bg = this.add.image(this.centerX(), this.centerY(), 'bg');
        this.bg.setDisplaySize(this.scale.width, this.scale.height);

        this.scale.on('resize', this.resize, this);
    }

    update() {
        if(this.client.game.initialized) { this.play(); }
    }

    centerX() {
        return this.scale.width / 2;
    }
    centerY() {
        return this.scale.height / 2;
    }

    resize(gameSize, baseSize, displaySize, resolution) {
        let width = gameSize.width;
        let height = gameSize.height;

        this.bg.setPosition(this.centerX(), this.centerY());
        this.bg.setDisplaySize(width, height);
    }
}