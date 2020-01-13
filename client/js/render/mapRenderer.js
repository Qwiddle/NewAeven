export default class MapRenderer {
    constructor(phaser, map) {
        this.phaser = phaser;
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

    drawObjects(x, y, id, offx, offy, obj) {
        let objHeight = 0;
        let objWidth = 0;

        if (obj=='objects') {
            objHeight = 172;
            objWidth = 56;
        } else if(obj='walls') {
            objHeight = 172;
            objWidth = 531;
        }

        const ox = -objWidth / 2 + offx + 22;
        const oy = (this.tileHeight + objHeight / 2) + 16;

        const iCoord = ox + (y - x) * this.tileWidth / 2 ;
        const jCoord = oy + (y + x) * this.tileHeight / 2 - (objHeight);
        let temp = this.phaser.add.image(iCoord, jCoord, obj, id);

        temp.depth = jCoord + objHeight;

        this.objects.push(temp);
    }

    drawWalls(x, y, id, offx, offy, obj) {
        let objHeight = 0;
        let objWidth = 0;

        if (obj=='objects') {
            objHeight = 172;
            objWidth = 56;
        } else if(obj='walls') {
            objHeight = 531;
            objWidth = 32;
        }

        const ox = -objWidth / 2 + offx;
        const oy = (this.tileHeight + objHeight / 2) + 16;

        const iCoord = ox + (y - x) * this.tileWidth / 2;
        const jCoord = oy + (y + x) * this.tileHeight / 2 - (objHeight);
        let temp = this.phaser.add.image(iCoord, jCoord, obj, id);

        temp.depth = jCoord + 330;

        this.walls.push(temp);
    }

    drawTile(x, y, type, id) {
        const iCoord = (y - x) * this.tileWidth / 2;
        const jCoord = (y + x) * this.tileHeight / 2 + 32;

        let tileSprite = this.phaser.add.image(iCoord, jCoord, type, id).setInteractive({
            pixelPerfect: true,
            alphaTolerance: 0,
        });

        tileSprite.depth = 0;

        this.tiles.push(tileSprite);

        this.addMouseListenersToTile(tileSprite);
    }

    addMouseListenersToTile(tileSprite) {
        const self = this;
        let tileX = tileSprite.x;
        let tileY = tileSprite.y;

        tileSprite.on('pointerover', function(pointer, localX, localY, event) {
            self.updateTileHoverSpritePosition(tileX, tileY);
            console.log(pointer);
        });
        ﻿
        tileSprite.on('pointerout',function(pointer) {
            if(self.tileHover != null) {  
                self.tileHover.visible = false;
            }
        });
    }

    updateTileHoverSpritePosition(x, y) {
        if (this.tileHover == null) {
            this.addTileHoverSprite(x, y);
        } else {
            this.tileHover.visible = true;
            this.tileHover.x = x;
            this.tileHover.y = y;
        }
    }

    addTileHoverSprite(x, y) {
        this.tileHover = this.phaser.add.image(x, y, 'tile_hover').setInteractive();
    }

    drawMap() {
        let tileCount = 0;
 
        for (let i = 0; i < this.mapWidth; i++) {
            for (let j = 0; j < this.mapHeight; j++) {

                this.drawTile(i, j, 'tiles', this.map.layers[0].data[tileCount] - 1);

                if(this.map.layers[1].data[tileCount] != 0) {
                    if(this.map.layers[1].data[tileCount] >= 1561) {
                        this.drawWalls(i, j, this.map.layers[1].data[tileCount] - 2188, 0, 0, 'walls');
                    }
                }

                if(this.map.layers[2].data[tileCount] != 0) {
                    if(this.map.layers[2].data[tileCount] >= 1561) {
                        this.drawWalls(i, j, this.map.layers[2].data[tileCount] - 2188, -32, 0, 'walls');
                    }
                }

                if(this.map.layers[3].data[tileCount] != 0) {
                    if(this.map.layers[3].data[tileCount] >= 1561) {
                        this.drawObjects(i, j, this.map.layers[3].data[tileCount] - 1561, 8, 0, 'objects');
                    }
                }

                if (this.map.layers[4].data[tileCount] != 0) {
                    if(this.map.layers[4].data[tileCount] >= 1561) {
                        this.drawObjects(i, j, this.map.layers[4].data[tileCount] - 1561, 0, 0, 'objects');
                    }
                }

                if (this.map.layers[5].data[tileCount] != 0) {
                    if(this.map.layers[5].data[tileCount] >= 1561) {
                        //draw objectset2
                    }
                }

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