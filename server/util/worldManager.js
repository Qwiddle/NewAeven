import { global } from '../../client/js/global.mjs';
import { PubManager } from '../util/pubManager.js';

export class WorldManager {
	constructor(server) {
		this.pubManager = new PubManager();

		this.initialized = false;
		this.items = [];
		this.npcs = [];
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
		this.loadData();
		server.start();
	}

	loadData() {
		this.pubManager.read('./data/pub/', () => {
			this.items = this.pubManager.items;
			this.npcs = this.pubManager.npcs;

			console.log(Object.keys(this.items).length + " items loaded.");
			console.log(Object.keys(this.npcs).length + " npcs loaded.");

			this.pubManager.read('./data/maps/', () => {
				this.mapData = this.pubManager.mapData;
				this.mapJson = this.pubManager.mapJson;
				
				console.log(Object.keys(this.mapData).length + " maps loaded.");
			});
		});
	}

	clearMessages() { 
		this.messages.globalMessages = [];

		for (let i = 0; i < global.numMaps; i++) {
			this.messages.publicMessages[i] = [];
		}
	}

	reset() {
		for(let i = 0; i < global.numMaps; i++) {
			this.messages.publicMessages[i] = [];
			this.dynamicMapData[i] = [];
			this.mapData[i] = [];
			this.enemies[i] = [];
		}
	}
}