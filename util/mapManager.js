const fs = require('fs');
const global = require('../client/global.js').default;

export default class MapManager {
    constructor() {
        this.maps = [];
        this.mapsJson = [];

        for (let i = 0; i < global.numMaps; i++) {
            this.mapsJson[i] = JSON.parse(fs.readFileSync('./maps/' + i + '.json', 'utf8'));
        	this.maps[i] = this.loadMap(this.mapsJson[i]);
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
    			if (map.layers[5].data[count] != 0) {
                     mapData[j][i] = TILE_WALL;
                }

            	count++;
    		}
    	}

    	return mapData;
    }
}