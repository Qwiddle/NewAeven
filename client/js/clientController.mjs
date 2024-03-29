import { global } from './global.mjs'
import { InputManager } from './inputManager.mjs';

export class ClientController {
	constructor(client, phaser) {
		this.client = client;
		this.phaser = phaser;
		this.inputManager = new InputManager();
		this.initKeys();

		this.rotateMs = 50;
	}

	initKeys() {
		this.kineticKeys = {
			37: global.direction.left,
			38: global.direction.up,
			39: global.direction.right,
			40: global.direction.down,
			17: global.key.attack
		};

		this.staticKeys = {
			37: global.direction.staticLeft,
			38: global.direction.staticUp,
			39: global.direction.staticRight,
			40: global.direction.staticDown,
		};
	}

	addKeyListeners() {
		this.inputManager.addListeners();
	}

	getKineticKeyboardInput() {
		for (const key in this.kineticKeys) {
			if (this.inputManager.keys[key]) {
				return this.kineticKeys[key];
			}
		}

		return global.direction.none;        
	}

	getStaticKeyboardInput(initialKey) {
		for (const key in this.staticKeys) {
			if (this.inputManager.keys[key]) {
				return this.staticKeys[key];
			}
		}

		return initialKey;
	}

	getKeyboardInput(initialKey) {
		return Date.now() < (this.inputManager.keyTimer + this.rotateMs) ? 
			this.getStaticKeyboardInput(initialKey) : this.getKineticKeyboardInput();
	}

	getClientId() {
		return this.client.id;
	}

	deleteSprite(key) {
		this.phaser.scene.scenes[3].sprites[key].removeFromScene();
	}

	deleteEnemy(key) {
		this.phaser.scene.scenes[3].enemies[key].removeFromScene();
	}
}