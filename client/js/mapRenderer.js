class MapRenderer {
    constructor(game, map) {
        this.game = game;
        this.map = map;
        this.tileOffset = 32;
        this.loadMap(map);
        this.tiles = [];
        this.walls = [];
        this.objects = [];
    }

    loadMap() {
        this.mapWidth = this.mapJson.width;
        this.mapHeight = this.mapJson.height;
        this.tileWidth = this.mapJson.tilewidth;
        this.tileHeight = this.mapJson.tileheight;
    }

    drawTile(x, y, id, type) {
        const startOffsetX = -this.tileWidth / 2;
        const startOffsetY = this.tileHeight + this.tileOffset;
        const iCoord = startOffsetX + (y - x) * this.tileWidth / 2;
        const jCoord = startOffsetY + (y + x) * this.tileHeight / 2 - (this.tileHeight);

        let tileSprite = this.phaser.add.image(iCoord, jCoord, type, id);
        //tileSprite.autoCull = true;
        tileSprite.checkWorldBounds = true;

        this.tiles.push(tileSprite);

        this.addMouseListenersToTile(tileSprite);

        return tileSprite;
    }

    drawMap() {
        let tileCount = 0;

        for (let i = 0; i < this.mapWidth; i++) {
            for (let j = 0; j < this.mapHeight; j++) {

                //this.drawTile(i, j, this.mapJson.layers[0].data[tileCount] - 1, 'tiles');

                tileCount++;
            }
        }

        this.drawTile(i, j, this.map.layers[0].data[tileCount], 'tiles');
    }

    drawItemAtXY(x, y, item) {
        const ox = -this.tileWidth / 2;
        const oy = this.tileHeight + this.tileOffset;
        const iCoord = ox + (y - x) * this.tileWidth / 2;
        const jCoord = oy + (y + x) * this.tileHeight / 2 - (this.tileHeight);

        const itemSprite = this.phaser.add.image(iCoord, jCoord, item);
        itemSprite.inputEnabled = true;
        itemSprite.frame = 0;

        itemSprite.events.onInputDown.add(function (itemSprite) {
            this.updateClickTileSpritePosition(tileSprite.x, tileSprite.y);
            itemSprite.itemName.visible = false;
            itemSprite.destroy();
        });
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