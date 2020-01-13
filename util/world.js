const global = require('../client/global.js').default;

export default class World {
	constructor() {
		this.updates = [];
		this.players = {};
		this.mapData = [];
		this.dynamicMapData = [];
		this.messages = [];
		this.globalMessages = [];
		this.reset();
	}

	reset() {
		for(let i = 0; i < global.numMaps; i++) {
            this.messages[i] = [];
            this.dynamicMapData[i] = [];
            this.mapData[i] = [];
		}
	}

	clearMessages() { 
        this.globalMessages = [];

        for (let i = 0; i < global.numMaps; i++) {
            this.messages[i] = [];
        }
    }
}