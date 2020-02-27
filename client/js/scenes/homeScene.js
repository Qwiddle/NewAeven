import ViewLoader from '../ui/viewLoader.js';

export default class HomeScene extends Phaser.Scene {
	constructor() {
		super({key: 'home'});
		this.viewLoader = new ViewLoader();
	}

	init(data) {
		this.client = data.client;
	}

	preload() {
		this.menuSound = this.sound.add('menuclick', {
			volume: 1,
			loop: false
		});
	}

	update() {
		if(this.client.game.initialized) { 
			this.startGame(); 
		}
	}

	create() {
		this.bg = this.add.image(this.centerX(), this.centerY(), 'bg');
		this.bg.setDisplaySize(this.scale.width, this.scale.height);

		this.header = this.add.image(this.centerX(), this.centerY() / 4, 'header');
		this.scale.on('resize', this.resize, this);

		this.viewLoader.loadView("home", true, () => {
			this.client.connect();
		});

		$('#views').on('click', '.clickable', () => {
			this.sound.play('menuclick2');
		});

		$('#views').on('click', '.textbox', () => {
			this.sound.play('menuclick');
		});

		$('#views').on('click', '.registrationtextbox', () => {
			this.sound.play('menuclick');
		});
	}

	startGame() {
		this.scene.start('game', { client: this.client });
	}

	getRandomInt(min, max) {
		return Math.random() * (max - min) + min;
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

		this.header.setPosition(this.centerX(), this.centerY() / 8);
	}
}