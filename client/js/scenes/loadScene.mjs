export class LoadScene extends Phaser.Scene {
	constructor() {
		super({key: 'load'});
	}

	init(data) {
		this.client = data.client;
		this.game = data.game;
	}

	preload() {
		this.load.multiatlas('objects', 'assets/map/objects.json');
		this.load.atlas('walls', 'assets/map/walls.png', 'assets/map/walls.json');
		this.load.multiatlas('tiles', 'assets/map/tiles.json');
		this.loadAssets(this.cache.json.get('assets'));
		this.label = this.add.text((this.scale.width / 2), (this.scale.height / 2), 'Loading...', { fontFamily: 'Verdana', align: 'center' });
		this.label.setOrigin(0.5);
		this.createProgressbar((this.scale.width / 2), (this.scale.height / 2) + 50);
	}

	createProgressbar (x, y) {
		const self = this;
		let width = 400;
		let height = 20;
		let xStart = x - width / 2;
		let yStart = y - height / 2;

		let borderOffset = 2;

		let borderRect = new Phaser.Geom.Rectangle(
			xStart - borderOffset,
			yStart - borderOffset,
			width + borderOffset * 2,
			height + borderOffset * 2);

		let border = this.add.graphics({
			lineStyle: {
				width: 5,
				color: 0xaaaaaa
			}
		});

		border.strokeRectShape(borderRect);

		let progressbar = this.add.graphics();

		let updateProgressbar = function (percentage) {
			progressbar.clear();
			progressbar.fillStyle(0x007f00, 1);
			progressbar.fillRect(xStart, yStart, percentage * width, height);
		};

		this.load.on('progress', updateProgressbar);

		this.load.on('load', function (file) {
			self.label.setText("Loading... " + file.url);
		}, this);

		this.load.once('complete', () => {
			this.load.off('progress', updateProgressbar);
			this.loadHomeScene();
		}, this);
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

	loadHomeScene() {
		this.scene.start('home', { client: this.client, game: this.game } );
	}
}