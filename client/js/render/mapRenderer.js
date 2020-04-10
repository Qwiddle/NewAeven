export default class MapRenderer {
	constructor(scene, json) {
		this.tileWidth = 64;
		this.tileHeight = 32;
		this.tiles = [];
        this.walls = [];
        this.objects = [];
		this.scene = scene;
		this.load(json)
	}

	load(json) {
		this.map = json;
		this.mapWidth = json.width;
        this.mapHeight = json.height;
		
		this.tileGroup = this.scene.add.group();
		this.objectGroup = this.scene.add.group();
		this.wallGroup = this.scene.add.group();
	}

	drawTile(x, y, id) {
		const tileWidthHalf = this.tileWidth / 2;
		const tileHeightHalf = this.tileHeight / 2;

		const iCoord = (y - x) * tileWidthHalf;
		const jCoord = (y + x) * tileHeightHalf + 32;

		let tileSprite = this.scene.add.image(iCoord, jCoord, 'tiles', id + ".png").setInteractive({
			pixelPerfect: true
		});

		tileSprite.isoX = x;
		tileSprite.isoY = y;

		tileSprite.depth = 0;
		tileSprite.setOrigin(0.5);

		this.addMouseListeners(tileSprite);
		this.tileGroup.add(tileSprite, true);
	}

	drawWall(x, y, offx, offy, id) {
		let wallSprite = this.scene.add.image(0, 0, 'walls', id + ".png");

		const tileWidthHalf = this.tileWidth / 2;
		const tileHeightHalf = this.tileHeight / 2;
		const wallHeight = wallSprite.height;
		const wallWidth = wallSprite.width;

		const depthY = this.isoToCartesian(x, y).y + wallHeight / 2;

		const iCoord = ((y - x) * tileWidthHalf) - wallWidth / 2 + offx;
		const jCoord = ((y + x) * tileHeightHalf) - wallHeight / 2 + this.tileHeight + 16;

		wallSprite.depth = jCoord + wallHeight;
		wallSprite.x = iCoord;
		wallSprite.y = Math.floor(jCoord);
		this.wallGroup.add(wallSprite);
	}

	drawObject(x, y, offx, offy, id) {
		let objectSprite = this.scene.add.image(0, 0, 'objects', id + ".png");

		const tileWidthHalf = this.tileWidth / 2;
		const tileHeightHalf = this.tileHeight / 2;
		let objectHeight = objectSprite.height;
		const objectWidth = objectSprite.width;

		const iCoord = ((y - x) * tileWidthHalf);
		const jCoord = ((y + x) * tileHeightHalf) - Math.floor(objectHeight / 2) + this.tileHeight + 16;

		if(objectHeight >= 165)
			objectHeight = 165;

		let depthY = jCoord + objectHeight;

		objectSprite.depth = depthY;
		objectSprite.x = iCoord;
		objectSprite.y = jCoord;
		this.objectGroup.add(objectSprite);

	}

	drawMap() {
		let tileCount = 0;

		for(let i = 0; i < this.mapHeight; i++) {
			for(let j = 0; j < this.mapWidth; j++) {
				this.drawTile(i, j, this.map.layers[0].data[tileCount]);
				tileCount++
			}
		}

		tileCount = 0;

		for(let i = 0; i < this.mapHeight; i++) {
			for(let j = 0; j < this.mapWidth; j++) {
				if(this.map.layers[1].data[tileCount] != 0) {
					this.drawObject(i, j, 0, 0, this.map.layers[1].data[tileCount]);
					//console.log(this.map.layers[1].data[tileCount]);
				}
				tileCount++;
			}
		}

		tileCount = 0;

		for(let i = 0; i < this.mapHeight; i++) {
			for(let j = 0; j < this.mapWidth; j++) {
				if(this.map.layers[2].data[tileCount] != 0) {
					//this.drawWall(i, j, 0, 0, this.map.layers[2].data[tileCount]);
				}
				tileCount++;
			}
		}

		tileCount = 0;

		for(let i = 0; i < this.mapHeight; i++) {
			for(let j = 0; j < this.mapWidth; j++) {
				if(this.map.layers[2].data[tileCount] != 0) {
					//this.drawWall(i, j, 32, 0, this.map.layers[3].data[tileCount] + 101);
					tileCount++;
				}
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
        
        this.walls = [];
        this.objects = [];
	}
	

	toggleLayer(layer) {
		if(layer === 'tile') {
			let children = this.tileGroup.getChildren();

			for (let child of children) {
				if(child.alpha >= 0.7)
					child.alpha = 0.0;
				else
					child.alpha = 1.0;
			}
		} else if(layer === 'object') {
			let children = this.objectGroup.getChildren();

			for (let child of children) {
				if(child.alpha >= 0.5)
					child.alpha = 0.0;
				else
					child.alpha = 1.0;
			}
		} else if(layer === 'wall') {
			let children = this.wallGroup.getChildren();

			for (let child of children) {
				if(child.alpha >= 0.5)
					child.alpha = 0.0;
				else
					child.alpha = 1.0;
			}
		}
	}

	addMouseListeners(sprite) {
		sprite.on('pointerover', (pointer) => {
			this.updateTileHoverSpritePosition(sprite.x, sprite.y);
		});

		sprite.on('pointerout', (pointer) => {
			if(this.tileHover != null) {  
                this.tileHover.visible = false;
                this.tileHover.setAlpha(0);
            }
		});

		sprite.on('pointerdown', (pointer) => {
			if(pointer.downElement.nodeName === 'CANVAS') {
				if(pointer.button === 0) {
					this.updateTileClickSpritePosition(sprite.x, sprite.y, sprite.isoX, sprite.isoY);
				}
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

		this.tileHover.setAlpha(1);
	}
	
	addTileHoverSprite(x, y) {
		this.tileHover = this.scene.add.image(x, y, 'tilehover');
	}

	updateTileClickSpritePosition(x, y, isoX, isoY) {
		if (this.tileClick == null) {
			this.addTileClickSprite(x, y);
			this.tileClick.isoX = isoX;
			this.tileClick.isoY = isoY;
		} else {
			this.tileClick.setAlpha(1);
			this.tileClick.x = x;
			this.tileClick.y = y;
			this.tileClick.isoX = isoX;
			this.tileClick.isoY = isoY;
		}
		if(!this.tileClick.inAnim) {
			this.tileClick.setAlpha(1);
			this.tileClick.inAnim = true;
			this.tileClick.play('click');
		}

		this.scene.client.game.findPath(this.tileClick.isoY, this.tileClick.isoX);
	}

	addTileClickSprite(x, y) {
		this.tileClick = this.scene.add.sprite(x, y, 'tilehover');
		this.createTileAnimation();
		this.tileClick.play('click');
		this.tileClick.inAnim = true;
	}

	createTileAnimation() {
		this.animations = {
			click: { 
				key: 'click',
				frames: this.scene.anims.generateFrameNumbers('tilehover', {start: 0, end: 6}),
				duration: 600,
			}
		}

		this.scene.anims.create(this.animations.click);

		this.tileClick.on('animationcomplete', (animation, frame) => {
			this.tileClick.setAlpha(0);
			this.tileClick.inAnim = false;
		});
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