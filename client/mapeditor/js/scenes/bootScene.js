export default class BootScene extends Phaser.Scene {
	constructor() {
		super({key: 'boot'});
	}

	preload() {
		this.load.json('assets', 'assets/assets.json');
		this.load.plugin('rexmousewheeltoupdownplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexmousewheeltoupdownplugin.min.js', true);
		this.load.plugin('rexfadeplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexfadeplugin.min.js', true);
	}

	create() {
		this.scene.start('load', {client: this.client});
	}
}