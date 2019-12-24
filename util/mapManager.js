const fs = require('fs');
const global = require('../client/global.js');

class MapManager {
    constructor() {
        this.maps = [];

        for (let i = 0; i < global.NUM_MAPS; i++) {
            this.maps[i] = JSON.parse(this.fs.readFileSync('../maps/' + i + '.json', 'utf8'));
        }
    }
}

module.exports = MapManager;