export default class Palette {
	constructor(scene) {
		this.scene = scene;
		this.numTiles = 1230;
		this.numObjects = 1000;
		this.numWalls = 500;
		this.tileWidth = 64;
		this.tileHeight = 32;
		this.wallWidth = 32;
		this.wallHeight = 531;
		this.createPalette();	
	}

	createPalette() {
		$('#palette').tabs();

		$('#palette').resizable({
			minWidth: 360,
			minHeight: 240,
			maxWidth: 580,
			maxHeight: 860
		});

		$('#palette').draggable({
			drag: function () {
				$(this).css('opacity', '0.5'); 
			},

			stop: function (event, ui) {
				let percent = ui.position.left / ui.helper.parent().width() * 100;
				ui.helper.css('left', percent + '%');
				$(this).css('opacity', '0.85');
			},
			handle: '.ui-tabs-nav',
			cursor: 'move',
			scroll: false,
			containment: '#content'
		}).disableSelection().css('position', 'fixed');

		$(document).on("contextmenu", ".tile", (event) => {
			this.scene.baseTile = event.target.id.slice(5);
		});
	}

	addTiles() {
		const self = this;

		let backgroundX = 0;
		let backgroundY = 0;
		let tileFragment = document.createDocumentFragment();	

		for(let i = 0; i < this.numTiles; i++) {
			if(i % 32 === 0 && i >= 10) {
				backgroundX = 0;
				backgroundY-= 32;
			}

			$('<div>', {
				id: 'tile-' + i,
				width: 64,
				height: 32,
				class: 'tile',
				tabindex: '0'
			}).css('background-position', backgroundX + 'px ' + backgroundY + 'px').appendTo(tileFragment).click(function() {
				$('.tile').removeClass('active');
				$(this).addClass('active');
				self.selectedTile = $(this).attr('id').slice(5);
			});

			backgroundX -= this.tileWidth;
		}

		$('#link-tabs-1').append(tileFragment);
	}

	addObjects() {
		const self = this;

		this.objectJson = this.scene.cache.json.get("objectatlas");
		this.numObjects = this.objectJson.frames.length;

		let backgroundX = 0;
		let backgroundY = 0;
		let objectFragment = document.createDocumentFragment();	

		for(let i = 0; i < this.numObjects; i++) {
			let objectWidth = this.objectJson.frames[i].frame.w;
			let objectHeight = this.objectJson.frames[i].frame.h;
			let objectX = this.objectJson.frames[i].frame.x;
			let objectY = this.objectJson.frames[i].frame.y;

			$('<div>', {
				id: 'object-' + i,
				width: objectWidth,
				height: objectHeight,
				class: 'object',
				tabindex: '0'
			}).css('background-position', -objectX + 'px ' + -objectY + 'px').appendTo(objectFragment).click(function() {
				$('.object').removeClass('active');
				$(this).addClass('active');
				self.selectedTile = $(this).attr('id').slice(7);
			});
		}

		$('#link-tabs-2').append(objectFragment);
	}

	addWalls() {
		const self = this;

		this.wallJson = this.scene.cache.json.get("wallatlas");
		this.numWalls = this.wallJson.frames.length;

		let backgroundX = 0;
		let backgroundY = 0;
		let wallFragment = document.createDocumentFragment();	

		for(let i = 0; i < this.numObjects; i++) {
			let wallWidth = this.wallJson.frames[i].frame.w;
			let wallHeight = this.wallJson.frames[i].frame.h;
			let wallX = this.wallJson.frames[i].frame.x;
			let wallY = this.wallJson.frames[i].frame.y;

			$('<div>', {
				id: 'wall-' + i,
				width: wallWidth,
				height: wallHeight,
				class: 'wall',
				tabindex: '0'
			}).css('background-position', -wallX + 'px ' + -wallY + 'px').appendTo(wallFragment).click(function() {
				$('.wall').removeClass('active');
				$(this).addClass('active');
				self.selectedTile = $(this).attr('id').slice(5);
			});
		}

		$('#link-tabs-3').append(wallFragment);
	}

	show() {
		this.addTiles();
		this.addObjects();
		this.addWalls();

		$("#palette").fadeIn(750);
	}

	getActive() {
		return $('#palette').find('.ui-tabs-active').attr("id");
	}
}