import global from '../global.js'

export default class ClientController {
	constructor(client, phaser) {
		this.client = client;
		this.phaser = phaser;
		this.initKeys();
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

    getKineticKeyboardInput() {
        for (const key in this.kineticKeys) {
            if (this.client.keys[key]) {
                return this.kineticKeys[key];
            }
        }

        return global.direction.none;        
    }

    getStaticKeyboardInput(initialKey) {
        for (const key in this.staticKeys) {
            if (this.client.keys[key]) {
                return this.staticKeys[key];
            }
        }

        return initialKey;
    }

    getKeyboardInput(initialKey) {
        return Date.now() < this.client.keyTimer ? 
            this.getStaticKeyboardInput(initialKey) : this.getKineticKeyboardInput();
    }
    
    sendPacket(packet) {
        this.client.send(packet); 
    }

    getClientId() {
        return this.client.id;
    }

    deleteSprite(key) {
        if (this.phaser.sprites[key] != undefined) {
            this.phaser.sprites[key].entity.destroy();
            this.phaser.sprites[key].weapon.destroy();
        }

        delete this.phaser.sprites[key];
    }
}