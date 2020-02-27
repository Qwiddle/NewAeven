import Palette from '../components/palette.js';
import Map from '../render/map.js';

export default class MapScene extends Phaser.Scene {
	constructor() {
		super({key: 'map'});
		this.changes = [];
		this.activeTool = 'pencil';
	}

	preload() {
		this.palette = new Palette(this);
		this.map = new Map(this);
		this.map.load(this.cache.json.get('blank'));

		this.mapWidthHalf = Math.floor(this.map.mapWidth / 2);
		this.mapHeightHalf = Math.floor(this.map.mapHeight / 2);
		this.baseTile = 380;
	}

	create() {
		this.cameraSprite = this.add.image();
		this.guideWall = this.add.image(0, 0, 'walls').setOrigin(0.5);
		this.guideObject = this.add.image(0, 200, 'objects').setOrigin(0.5);
		this.guideWall.alpha = 0.0;
		this.guideObject.alpha = 0.0;

		this.drawMap();
		this.palette.show();
		this.cameras.main.fadeIn(750);
		
		const mouseWheelToUpDown = this.plugins.get('rexmousewheeltoupdownplugin').add(this);
		const cursors = this.input.keyboard.createCursorKeys();
		const mouse = mouseWheelToUpDown.createCursorKeys();

		const controlConfig = {
			camera: this.cameras.main,
			left: cursors.left,
			right: cursors.right,
			up: cursors.up,
			down: cursors.down,
			zoomIn: mouse.down,
			zoomOut: mouse.up,
			zoomSpeed: 0.1,
			speed: 0.5
		};

		this.camera_controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

		$("#fill").click(() => {
			this.activeTool = 'paint';
		});

		$("#draw").click(() => {
			this.activeTool = 'pencil';
		});
		
		$("#groundcheck").change(() => {
			this.map.toggleLayer('tile');
		});

		$("#objectcheck").change(() => {
			this.map.toggleLayer('object');
		});

		$("#wallcheck").change(() => {
			this.map.toggleLayer('wall');
		});

		$("#exportdrop").click(() => {
			this.exportToJson(JSON.stringify(this.map.mapJson), this.map.mapJson.name + '.json');
		});

		$("#savedrop").click(() => {
			this.saveMap(this.map);
		});

		$("#imagedrop").click(() => {
			this.exportAsImage(this.map.mapJson.name);
		});

		$("#opendrop").click(() => {
			$("#mapupload").trigger('click');
		});

		$("#undodrop").click(() => {
			this.undo();
		});

		$("#createmap").click(() => {
			const mapName = $("#mapname").val();
			let mapWidth = parseInt($("#mapwidth").val());
			let mapHeight = parseInt($("#mapheight").val());

			this.map.mapName = mapName;
			this.map.mapWidth = mapWidth;
			this.map.mapHeight = mapHeight;
			this.mapWidthHalf = mapWidth / 2;
			this.mapHeightHalf = mapHeight / 2;
			this.drawMap();
		});


		$(document).on('keydown', (e) => {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault()
				if((String.fromCharCode(e.which).toLowerCase() === 's')) {
					this.saveMap(this.map);
				} else if((String.fromCharCode(e.which).toLowerCase() === 'z')) {
					this.undo();
				} else if((String.fromCharCode(e.which).toLowerCase() === 'x')) {
					this.exportToJson(JSON.stringify(this.map.mapJson), this.map.mapJson.name + '.json');
				} else if((String.fromCharCode(e.which).toLowerCase() === 'y')) {
					//this.redo();
				} else if((String.fromCharCode(e.which).toLowerCase() === 'p')) {
					this.exportAsImage(this.map.mapJson.name);
				}
			}
		});

		document.getElementById('mapupload').addEventListener('change', this.openMap, false);
	}

	drawMap() {
		this.map.clearMap();
		this.cameraSprite.x = (this.mapWidthHalf - this.mapHeightHalf) * 32;
		this.cameraSprite.y = ((this.mapWidthHalf + this.mapHeightHalf) * 16) + 60;
		this.cameras.main.startFollow(this.cameraSprite, false, 0, 0, 0, 0);
		this.map.drawMap();
		this.saveMap(this.map);
	}

	update(time, delta) {   
		this.camera_controls.update(delta);

		let children = this.children.getChildren();

		for (let child of children) {
			child.visible = false;
		}

		let visible = this.cameras.main.cull(children);

		for (let child of visible) {
			child.visible = true;
		}
	}

	saveChange(type, sprite, prev, remove) {
		const update = {
			type: type,
			sprite: sprite,
			prev: prev,
			remove: remove
		};

		if(update.sprite.frame.name != update.prev) {
			this.changes.push(update);
		}	
	}

	undo() {
		if(this.changes.length > 0){
			const lastChange = this.changes.pop();

			if(lastChange.type == 'tile') {
				lastChange.sprite.setFrame(lastChange.prev);
			} else if(lastChange.type == 'object') {
				lastChange.sprite.destroy();
			}
		}
		
	}

	mouseEvent(tile, pointer) {
		if(pointer.isDown) {
			if(pointer.downElement.nodeName === 'CANVAS') {
				if(pointer.button === 0) {
					if(this.activeTool == 'pencil') {
						let previous = tile.frame.name;
						if(this.palette.getActive() === 'ground') {
							tile.setFrame(parseInt(this.getSelection()) + ".png");
							this.map.tileData[tile.isoX][tile.isoY] = parseInt(this.getSelection());
							this.saveChange('tile', tile, previous, false);
						} else if(this.palette.getActive() === 'walls') {
							this.map.drawWall(tile.isoX, tile.isoY, 0, 0, parseInt(this.getSelection()) + 101, false);
							this.map.wallData[tile.isoX][tile.isoY] = parseInt(this.getSelection()) + 101;
							this.saveChange('wall', tile, previous, false);
						} else if(this.palette.getActive() === 'objects') {
							this.map.drawObject(tile.isoX, tile.isoY, 0, 0, parseInt(this.getSelection()) + 101, false);
							this.map.objectData[tile.isoX][tile.isoY] = parseInt(this.getSelection()) + 101;
							
						}
					} else if(this.activeTool == 'paint') {
						if(this.palette.getActive() === 'ground') {
							const previous = tile.frame.name;
							this.map.fill(tile.isoX, tile.isoY, this.getSelection() + ".png");
							
							//tile.setFrame(parseInt(this.getSelection()) + ".png");
							//this.map.tileData[tile.isoX][tile.isoY] = parseInt(this.getSelection());
							//this.saveChange('tile', tile, previous, false);
						}
					}
				} else if(pointer.button === 2) {
					if(this.palette.getActive() === 'walls') {
						this.map.drawWall(tile.isoX, tile.isoY, 32, 0, parseInt(this.getSelection()) + 101, false);
						this.map.rightWallData[tile.isoX][tile.isoY] = parseInt(this.getSelection()) + 101;
					} else {
						tile.setFrame(this.baseTile + ".png");
						this.map.tileData[tile.isoX][tile.isoY] = this.baseTile;
					}
				}
			}
		} else {
			if(this.palette.getActive() === 'ground') {

			} else if(this.palette.getActive() === 'walls') {
				this.placeGuide(tile.isoX, tile.isoY, parseInt(this.getSelection()) + 101, 'wall');
			} else if(this.palette.getActive() === 'objects') {			
				this.placeGuide(tile.isoX, tile.isoY, parseInt(this.getSelection()) + 101, 'object');
			}
		}
	}

	placeGuide(x, y, id, type) {
		if(this.getSelection() !== undefined) {
			if(type === 'wall') {
				this.map.drawWall(x, y, 0, 0, id, true);
			} else if(type === 'object') {
				this.map.drawObject(x, y, 0, 0, id, true);
			}			
		}
	}

	saveMap(map) {
		let tileCount = 0;

		if(this.map.mapJson.name != this.map.mapName) {
			this.map.mapJson.name = this.map.mapName;
		}

		if(this.map.mapJson.width != map.mapWidth || this.map.mapJson.height != map.mapHeight) {
			this.map.mapJson.width = map.mapWidth;
			this.map.mapJson.height = map.mapHeight;
		}	

		for(let i = 0; i < map.mapHeight; i++) {
			for(let j = 0; j < map.mapWidth; j++) {
				map.mapJson.layers[0].data[tileCount] = map.tileData[i][j];
				map.mapJson.layers[1].data[tileCount] = map.objectData[i][j];
				map.mapJson.layers[2].data[tileCount] = map.wallData[i][j]
				map.mapJson.layers[3].data[tileCount] = map.rightWallData[i][j];
				tileCount++
			}
		}
	}
	
	openMap(e) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			let contents = event.target.result;

			console.log(JSON.parse(contents));
		};

		reader.readAsText(file);
	}

	exportToJson(content, fileName) {
		var a = document.createElement("a");
		var file = new Blob([content], {type: "application/json"});
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	}

	exportAsImage(name) {
		const date = Date.now();
		this.game.renderer.snapshot((image) => {                
            this.downloadCanvas('canvas', name + "_" + date, image.src);
       	});
	}

	downloadCanvas(canvasId, fileName, dataUrl) {
		var canvas_element = document.getElementsByTagName(canvasId)[0];
    	var MIME_TYPE = "image/png";
        var imgURL = dataUrl;
        var dlLink = document.createElement('a');
        dlLink.download = fileName;
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    }

	getSelection() {
		return this.palette.selectedTile || 0;
	}
}