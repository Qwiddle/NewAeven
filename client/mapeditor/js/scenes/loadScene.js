export default class LoadScene extends Phaser.Scene {
	constructor() {
		super({key: 'load'});
	}

	preload() {
		this.loadAssets(this.cache.json.get('assets'));
		this.label = this.add.text((this.scale.width / 2), (this.scale.height / 2), 'Loading...', { fontFamily: 'Verdana', align: 'center' });
	
		this.load.on('load', function (file) {
			console.log("Loading... " + file.url);
		}, this);

		this.load.once('complete', function () {
			this.label.destroy();
			this.scene.start('map');
		}, this);

		this.load.atlas('tiles', 'assets/map/tiles.png', 'assets/map/tiles.json');
		this.load.atlas('objects', 'assets/map/objects.png', 'assets/map/objects.json');
		this.load.atlas('walls', 'assets/map/walls.png', 'assets/map/walls.json');
	}

	loadAssets (json) {
		const self = this;
		Object.keys(json).forEach(function (group) {
			Object.keys(json[group]).forEach(function (key) {
				let value = json[group][key];

				if (group === 'bitmapFont' || group === 'spritesheet') {
					this.load[group](key, value[0], value[1]);
				} else if (group === 'audio') {
					if (value.hasOwnProperty('opus') && this.sys.game.device.audio.opus) {
						this.load[group](key, value['opus']);

					}
					else if (value.hasOwnProperty('webm') && this.sys.game.device.audio.webm) {
						this.load[group](key, value['webm']);

					}
					else if (value.hasOwnProperty('ogg') && this.sys.game.device.audio.ogg) {
						this.load[group](key, value['ogg']);

					}
					else if (value.hasOwnProperty('wav') && this.sys.game.device.audio.wav) {
						this.load[group](key, value['wav']);
					}
				} else if (group === 'html') {
					this.load[group](key, value[0], value[1], value[2]);
				} else {     
					this.load[group](key, value);
				}
			}, this);
		}, this);
	}
}