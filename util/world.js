const global = require('../client/global.js');

class World {
	constructor() {
		this.updates = [];
		this.players = {};
		this.maps = [];
		this.dynamicMap = [];
		this.reset();
	}

	reset() {
		//for(let i = 0; i < global.numMaps; i++) {
			//do nothing
		//}
	}
}

module.exports = World;