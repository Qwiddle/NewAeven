export default class Map {
	constructor(scene) {
		this.tileWidth = 64;
		this.tileHeight = 32;
		this.scene = scene;
	}

	load(json) {
		this.mapJson = json;
		this.mapWidth = this.mapJson.width;
		this.mapHeight = this.mapJson.height;
		this.tileData = [];
		this.objectData = [];
		this.wallData = [];
		this.rightWallData = [];
		this.tileSprites = [];

		for(let i = 0; i < this.mapWidth; i++) {
			this.tileData[i] = [];
			this.tileData[i].length = this.mapHeight;
			this.tileData[i].fill(0);

			this.objectData[i] = [];
			this.objectData[i].length = this.mapHeight;
			this.objectData[i].fill(0);

			this.wallData[i] = [];
			this.wallData[i].length = this.mapHeight;
			this.wallData[i].fill(0);

			this.rightWallData[i] = [];
			this.rightWallData[i].length = this.mapHeight;
			this.rightWallData[i].fill(0);

			this.tileSprites[i] = [];
			this.tileSprites[i].length = this.mapHeight;
		}
		
		this.tileGroup = this.scene.add.group();
		this.objectGroup = this.scene.add.group();
		this.wallGroup = this.scene.add.group();
	}

	drawTile(x, y, type, id) {
		const tileWidthHalf = this.tileWidth / 2;
		const tileHeightHalf = this.tileHeight / 2;

		const iCoord = (y - x) * tileWidthHalf;
		const jCoord = (y + x) * tileHeightHalf + 32;

		let tileSprite = this.scene.add.sprite(iCoord, jCoord, 'tiles', id + ".png").setInteractive({
			pixelPerfect: true
		}).setOrigin(0.5);

		tileSprite.isoX = x;
		tileSprite.isoY = y;

		tileSprite.depth = 0;

		this.addMouseListeners(tileSprite);
		this.tileGroup.add(tileSprite, true);

		this.tileData[x][y] = id;
		this.tileSprites[x][y] = tileSprite;
	}

	drawWall(x, y, offx, offy, id, guide) {
		const wallSprite = this.scene.add.image(0, 0, 'walls', id + ".png").setOrigin(0.5);

		const tileWidthHalf = this.tileWidth / 2;
		const tileHeightHalf = this.tileHeight / 2;
		const wallHeight = wallSprite.height;
		const wallWidth = wallSprite.width;

		const depthY = this.isoToCartesian(x, y).y;

		const iCoord = ((y - x) * tileWidthHalf) - wallWidth / 2 + offx;
		const jCoord = ((y + x) * tileHeightHalf) - wallHeight / 2 + this.tileHeight + 16;

		if(!guide) {
			wallSprite.depth = depthY;
			wallSprite.x = iCoord;
			wallSprite.y = jCoord;
			this.wallGroup.add(wallSprite);
			this.wallData[x][y] = id;
			this.scene.saveChange('object', wallSprite, false, false);
		} else {
			this.scene.guideWall.alpha = 0.5;
			this.scene.guideWall.x = iCoord;
			this.scene.guideWall.y = jCoord;
			this.scene.guideWall.setFrame(id + ".png");
			this.scene.guideWall.depth = depthY;
			wallSprite.destroy();
		}
	}

	drawObject(x, y, offx, offy, id, guide) {
		let objectSprite = this.scene.add.image(0, 0, 'objects', id + ".png").setOrigin(0.5);

		const tileWidthHalf = this.tileWidth / 2;
		const tileHeightHalf = this.tileHeight / 2;
		const objectHeight = objectSprite.height;
		const objectWidth = objectSprite.width;

		let depthY = this.isoToCartesian(x, y).y;

		const iCoord = ((y - x) * tileWidthHalf);
		const jCoord = ((y + x) * tileHeightHalf) - objectHeight / 2 + this.tileHeight + 16;

		if(!guide) {
			objectSprite.depth = depthY;
			objectSprite.x = iCoord;
			objectSprite.y = jCoord;
			this.objectGroup.add(objectSprite);
			this.objectData[x][y] = id
			this.scene.saveChange('object', objectSprite, false, false);
		} else {
			this.scene.guideObject.alpha = 0.5;
			this.scene.guideObject.x = iCoord;
			this.scene.guideObject.y = jCoord;
			this.scene.guideObject.setFrame(id + ".png");
			this.scene.guideObject.depth = depthY;
			objectSprite.destroy();
		}
	}

	drawMap() {
		for(let i = 0; i < this.mapHeight; i++) {
			for(let j = 0; j < this.mapWidth; j++) {
				this.drawTile(i, j, 'tiles', this.scene.baseTile);
			}
		}
	}

	clearMap() {
		this.tileGroup.clear(true, true);
		this.wallGroup.clear(true, true);
		this.objectGroup.clear(true, true);

		this.mapJson.layers[0].data = [];
		this.mapJson.layers[0].data.length = this.mapHeight;
		this.mapJson.layers[1].data = [];
		this.mapJson.layers[1].data.length = this.mapHeight;
		this.mapJson.layers[2].data = [];
		this.mapJson.layers[2].data.length = this.mapHeight;
		this.mapJson.layers[3].data = [];
		this.mapJson.layers[3].data.length = this.mapHeight;

       for(let i = 0; i < this.mapWidth; i++) {
			this.tileData[i] = [];
			this.tileData[i].length = this.mapHeight;
			this.tileData[i].fill(0);

			this.objectData[i] = [];
			this.objectData[i].length = this.mapHeight;
			this.objectData[i].fill(0);

			this.wallData[i] = [];
			this.wallData[i].length = this.mapHeight;
			this.wallData[i].fill(0);

			this.rightWallData[i] = [];
			this.rightWallData[i].length = this.mapHeight;
			this.rightWallData[i].fill(0);
		}
	}
	

	toggleLayer(layer) {
		if(layer === 'tile') {
			let children = this.tileGroup.getChildren();

			for (let child of children) {
				if(child.alpha >= 0.7) {
					child.alpha = 0.0;
				}
				else {
					child.alpha = 1.0;
				}
			}
		} else if(layer === 'object') {
			let children = this.objectGroup.getChildren();

			for (let child of children) {
				if(child.alpha >= 0.5) {
					child.alpha = 0.0;
				}
				else {
					child.alpha = 1.0;
				}
			}
		} else if(layer === 'wall') {
			let children = this.wallGroup.getChildren();

			for (let child of children) {
				if(child.alpha >= 0.5) {
					child.alpha = 0.0;
				}
				else {
					child.alpha = 1.0;
				}
			}
		}
	}

	addMouseListeners(sprite) {
		sprite.on('pointerover', (pointer) => {
			this.scene.mouseEvent(sprite, pointer);
			sprite.alpha = 0.7;
		});

		sprite.on('pointerout', (pointer) => {
			this.scene.mouseEvent(sprite, pointer);
			sprite.alpha = 1.0;
			this.scene.guideObject.alpha = 0;
			this.scene.guideWall.alpha = 0;
		});

		sprite.on('pointerdown', (pointer) => {
			this.scene.mouseEvent(sprite, pointer);
		});
	}

	fill(x, y, newValue) {
		let target = this.tileSprites[x][y];
		console.log(target);
		let cnt = 0;

		console.log(this.mapHeight);
		console.log(this.mapWidth);

		const flow = (x, y) => {
			if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
				if(this.tileSprites[x][y].frame.name != newValue && !this.tileSprites[x][y].counted) {					
					flow(x-1, y);    // check up
					flow(x+1, y);    // check down
					flow(x, y-1);    // check left
					flow(x, y+1);    // check right
					console.log('grass');
				}
			}

		}
	
		flow(x, y);
	}


	isoToCartesian(x, y) {
		const xCoord = (y - x) * this.tileHeight / 2;
		const yCoord = (y + x) * this.tileHeight / 2 + 32;

		const coords = {
			x: xCoord,
			y: yCoord
		};

		return coords;
	}
}