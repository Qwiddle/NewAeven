import BootScene from './scenes/bootScene.js';
import LoadScene from './scenes/loadScene.js';
import MapScene from './scenes/mapScene.js';

export default class MapEditor {
	constructor() {
		this.config = {
			type: Phaser.WEBGL,
			parent: 'mapcanvas',
			width: 640,
			height: 480,
			scale: {
				mode: Phaser.Scale.RESIZE,
				width: 640,
				height: 480,
				min: {
					width: 640,
					height: 480
				},
				max: {
					width: 1920,
					height: 1080
				},
			},
			scene: [
				BootScene, LoadScene, MapScene
			],
			pixelArt: true,
			roundPixels: true,
			antialias: false,
			disableContextMenu: true
		};

		this.phaser = new Phaser.Game(this.config);

		this.boot();
	}
z
	boot() {
		this.phaser.scene.start('boot');
	}
}