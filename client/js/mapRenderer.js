export default class MapRenderer {
    constructor(game, map) {
        this.game = game;
        this.map = map;
        this.tileOffset = 32;
        this.loadMap(map);
        this.tiles = [];
        this.walls = [];
        this.objects = [];
    }

    loadMap(map) {
        this.mapWidth = map.width;
        this.mapHeight = map.height;
        this.tileWidth = map.tilewidth;
        this.tileHeight = map.tileheight;
    }

    drawTile(x, y, type, id) {
       
    }

    drawMap() {
        let tileCount = 0;

        for (let i = 0; i < this.mapWidth; i++) {
            for (let j = 0; j < this.mapHeight; j++) {

                this.drawTile(i, j, 'tiles', this.map.layers[0].data[tileCount] - 1);

                tileCount++;
            }
        }
    }

    destroyMap() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].destroy();
        }

        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i].destroy();
        }

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].destroy();
        }
        this.tiles = [];
        this.walls = [];
        this.objects = [];
    }
}