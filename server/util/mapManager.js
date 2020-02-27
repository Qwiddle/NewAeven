const fs = require('fs');
const global = require('../../client/js/global.js').default;

export default class MapManager {
	constructor() {
		this.mapsData = [];
		this.mapsJson = [];

		for (let i = 0; i < global.numMaps; i++) {
			this.mapsJson[i] = JSON.parse(fs.readFileSync('./data/maps/' + i + '.json', 'utf8'));
			this.mapsData[i] = this.loadMap(this.mapsJson[i]);
		}
	}

	loadMap(map) {
		const width = map.width;
		const height = map.height;
		let mapData = [];

		for(let i = 0; i < width; i++) {
			mapData[i] = [];
			mapData[i].length = height;
			mapData[i].fill(0);
		}

		let count = 0;

		const TILE_WALL = 2;

		for(let i = 0; i < width; i++) {
			for(let j = 0; j < height; j++) {
				//addwalls
				count++;
			}
		}

		return mapData;
	}
}