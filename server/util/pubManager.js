const fs = require('fs');
const path = require('path');

module.exports = class PubManager {
	constructor() {
		this.items = [];
		this.npcs = [];
		this.mapData = [];
		this.mapJson = [];
	}

	read(path, done) {
		fs.readdir(path, (error, files) => {
			if(error) {
				throw err;
			} else {
				let remaining = files.length;

				for(let i = 0; i < files.length; i++) {
					fs.readFile(path + files[i], (err, data) => {
						if(err)
							throw err;

						let file = JSON.parse(data);
						let length = Object.keys(file).length;
						remaining--;

						if(files[i].includes('items')) {
							this.items = file;
						} else if(files[i].includes('npcs')) {
							this.npcs = file;
						} else {
							this.mapJson.push(file);
							this.mapData.push(this.loadMap(file));
						}

						if(remaining == 0) {
							done();
						}
					});
				}
			}
		});
	}

	loadMap(map) {
		const width = map.width;
		const height = map.height;
		let mapData = [];
		let count = 0;

		for(let i = 0; i < width; i++) {
			mapData[i] = [];
			mapData[i].length = height;
			mapData[i].fill(0);
		}

		const TILE_WALL = 2;

		for(let i = 0; i < width; i++) {
			for(let j = 0; j < height; j++) {
				//check for specs

				count++;
			}
		}

		return mapData;
	}
}
