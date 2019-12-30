const global = require('../client/global.js');

export default class World {
	constructor() {
		this.updates = [];
		this.players = {};
		this.mapData = [];
		this.dynamicMapData = [];
		this.reset();
	}

	reset() {
		//for(let i = 0; i < global.numMaps; i++) {
			//do nothing
		//}
	}
}