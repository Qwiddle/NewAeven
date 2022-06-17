export class BootScene extends Phaser.Scene {
	constructor() {
		super({key: 'boot'});
	}

	init(data) {
		this.client = data.client;
	}

	preload() {
		this.load.json('assets', '../../assets/assets.json');
	}

	create() {
		this.scene.start('load', {client: this.client});
	}
}