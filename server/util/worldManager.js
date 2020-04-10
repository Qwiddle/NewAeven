const global = require('../../client/js/global.js').default;

export default class WorldManager {
	constructor() {
		this.players = {};
		this.enemies = [];
		this.updates = [];
		this.mapData = [];
		this.dynamicMapData = [];
		this.numEnemiesSpawned = 0;
		this.enemySpawnInterval = {};

		this.messages = {
			publicMessages: [],
			globalMessages: []
		};

		this.reset();
	}

	clearMessages() { 
		this.messages.globalMessages = [];

		for (let i = 0; i < global.numMaps; i++) {
			this.messages.publicMessages[i] = [];
		}
	}

	reset() {
		for(let i = 0; i < global.numMaps; i++) {
			console.log('reset');
			this.messages.publicMessages[i] = [];
			this.dynamicMapData[i] = [];
			this.mapData[i] = [];
			this.enemies[i] = [];
		}
	}
}