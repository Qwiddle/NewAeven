import ViewLoader from './ui/viewLoader.js';
import UIHandler from './ui/uiHandler.js';
import BootScene from './scenes/bootScene.js';
import LoadScene from './scenes/loadScene.js';
import HomeScene from './scenes/homeScene.js';
import GameScene from './scenes/gameScene.js';
import Player from './entity/player.js';
import PlayerController from './entity/playerController.js';
import ClientController from './clientController.js';
import ChatManager from './util/chatManager.js';
import PathFinder from './util/pathFinder.js';
import global from './global.js';

export default class Game {
	constructor(client) {
		this.config = {
			type: Phaser.WEBGL,
			pixelArt: true,
			roundPixels: true,
			disableContextMenu: true,
			antialias: false,
			parent: 'gamecanvas',
			width: 640,
			height: 480,
			scale: {
				mode: Phaser.Scale.RESIZE,
				width: 640,
				height: 480,
				min: {
					width: 640,
					height: 480
				},
				max: {
					width: 1920,
					height: 1080
				},
			},
			scene: [
				BootScene, LoadScene, HomeScene, GameScene
			],
		};

		this.client = client;
		this.phaser = new Phaser.Game(this.config);
		this.uiHandler = new UIHandler(this);
		this.chatManager = new ChatManager();
		this.clientController = new ClientController(this.client, this.phaser);

		this.initialized = false;
		this.isFocused = true;
		
		this.boot();
	}

	boot() {
		this.phaser.scene.start('boot', { client: this.client} );
	}

	checkFocus() {
		if(document.hasFocus()) {
			this.isFocused = true;
		} else {
			this.isFocused = false;
		}
	}

	playerConnected(packet) {
		this.players = {};
		this.initPlayer(packet);
		this.initWorld(packet);
		this.initPhysicsTick();

		this.initialized = true;
	}

	initWorld(packet) {
		this.mapData = packet.mapData;
		this.player.mapData = this.mapData;
		this.player.mapJson = packet.mapJson;

		this.pathFinder = new PathFinder(this.mapData);
		this.pathStack = [];
	}

	initPlayer(packet) {
		this.player = new Player();
		this.player.username = packet.username;
		this.player.sex = packet.sex;
		this.player.race = packet.race;
		this.player.map = packet.map;
		this.player.prevPos.x = packet.pos.x;
		this.player.prevPos.y = packet.pos.y;
		this.player.pos.x = packet.pos.x;
		this.player.pos.y = packet.pos.y;
		this.player.dir = packet.dir;
		this.player.equipment = packet.equipment;
		this.player.hair = packet.hair;
		this.player.stats = packet.stats;
		PlayerController.updateTargetPos(this.player);

	}

	initPhysicsTick() {
		this.physicsInterval = setInterval(() => {
			this.physicsUpdate();
		}, global.physicsTick);
	}

	physicsUpdate() {
		this.checkFocus();
		this.updateKeyPressed();
		this.sendPhysicsPacket();
		this.updatePlayers();
	}

	deleteDisconnectedPlayerData(key) {
		delete this.players[key];
		this.players[key] = [];
		this.clientController.deleteSprite(key);
	}

	updatePlayers() {
		for (let key in this.players) {
			let player = this.players[key];

			if (player.map !== this.player.map) {
				this.deleteDisconnectedPlayerData(key);
				continue;
			}

			PlayerController.updatePosition(this.player);

			if (PlayerController.isMovable(player) && player.packets.length > 0) {
				let packet = player.packets.shift();

				if (packet.input == global.key.attack) {
					player.lastMoveTime = Date.now();
					player.isAttacking = true;
					continue;
				}
				
				player.prevPos.x = player.pos.x;
				player.prevPos.y = player.pos.y;
				player.pos.x = packet.pos.x;
				player.pos.y = packet.pos.y;
				player.dir = packet.input; 

				PlayerController.updateTargetPos(player);

				const rotated = player.pos.x == player.prevPos.x && player.pos.y == player.prevPos.y;

				if (!rotated) {
					player.lastMoveTime = Date.now();
				}
			}
		}
	}

	updateKeyPressed() {
		if(this.isFocused) {
			if (PlayerController.isMovable(this.player)) {
				this.player.keyPressed = this.clientController.getKeyboardInput(this.player.keyPressed);

				if (this.player.keyPressed != global.direction.none) {
					this.pathStack = [];
				} else if (this.pathStack.length > 0) {
					this.player.keyPressed = this.pathStack.pop();
				}
			} else {
				 this.player.keyPressed = global.direction.none;
			}
		}
	}

	movementUpdate() { 
		if (PlayerController.hasAttacked(this.player)) {
			this.player.lastMoveTime = Date.now();
			this.player.isAttacking = true;
		} else if (!PlayerController.hasRotated(this.player)) {
			this.player.lastMoveTime = Date.now();
		}

		PlayerController.updatePosition(this.player);
		const metadata = this.bundleMovementMetadata();
		this.player.keyPressed = global.direction.none;

		return metadata;
	}

	getMovementUpdate() {
		return PlayerController.pressedKey(this.player) ? this.movementUpdate() : {};
	}

	getMessageUpdate() {
		return this.chatManager.messageQueue.length > 0 ? this.bundleMessageMetadata() : {}; 
	}

	bundleMovementMetadata() {
		this.player.seq++;

		const metadata = {
			seq: this.player.seq,
			input: this.player.keyPressed,
			pos: this.player.pos,
			map: this.player.map, 
			mapData: this.player.mapData,
			time: Date.now(),
		};

		this.player.packets.push(metadata);
		return metadata;
	}

	bundleMessageMetadata() {
		const metadata = {
			messages: this.chatManager.messageQueue
		};

		this.chatManager.messageQueue = [];

		return metadata;
	}

	sendPhysicsPacket() {
		const packet = {
			'event':'physicsUpdate', 
			'movement': this.getMovementUpdate(),
			'message': this.getMessageUpdate()
		};

		this.client.send(packet);
	}

	onServerUpdate(packet) {
		if(!this.initialized) { 
			return; 
		}

		if(this.hasMapUpdated(this.player.map, packet.map)) {
			this.player.changedMaps = true;
			this.player.map = packet.map;
			this.pathStack = [];
			this.pathFinder.setGrid(packet.mapData);
		}

		this.player.mapData = packet.mapData;
		//this.clientController.updateEquipment(this.player, packet.equipment);
		this.updateMyClient(packet);
		this.updateDisconnectedPlayers(packet.disconnects);
		this.updateOtherClients(packet.moves, packet.map);
		this.updateChats(packet.messages, packet.globalMessages);
	}

	updateMyMessage(me) {
		if (me.messages !== "") {
			this.player.message = me.messages.value;
			this.player.messageUpdated = true;
			this.player.messageDelay = Date.now() + 2000;
		}
	}

	updateChats(messages, globalMessages) {
		this.chatManager.updateChat(messages);
		this.chatManager.updateChat(globalMessages);
	}

	updateMyClient(packet) {
		const me = packet.moves[this.clientController.getClientId()];
		this.reconcileClientPredictionsWithServer(me);
		this.updateMyMessage(me);
		delete packet.moves[this.clientController.getClientId()];
	}

	updateOtherClients(packet, map) {
		for (let key in packet) {
			if (this.players.hasOwnProperty(key)) {
				if (packet[key].messages != "") {
					this.players[key].message = packet[key].messages.value;
					this.players[key].messageUpdated = true;
					this.players[key].messageDelay = Date.now() + 2000;
				}

				while (packet[key].processed.length > 0) {
					this.players[key].packets.push(packet[key].processed.shift());
				}
			} else {
				this.createNewPlayer(key, packet, map);
			}
		}
	}

	reconcileClientPredictionsWithServer(packets) {
		let mostRecent = packets.processed;

		if (mostRecent.length == 0) {
			return;
		}

		mostRecent = packets.processed.pop();
		let index = 0;

		for (let i = 0; i < this.player.packets.length; i++) {
			if (this.player.packets[i].seq == mostRecent.seq) {
				index = i;
				break;
			}
		}

		let pos = mostRecent.pos;
		this.player.packets.splice(0, index + 1);

		for (let i = 0; i < this.player.packets.length; i++) {
			PlayerController.reapplyInput(this.player, pos, this.player.packets[i]); 
		}

		this.player.pos = pos;
		PlayerController.updateTargetPos(this.player);
	}

	createNewPlayer(key, packet, map) {
		this.players[key] = new Player();
		this.players[key].map = map;
		this.players[key].prevPos.x = packet[key].pos.x;
		this.players[key].prevPos.y = packet[key].pos.y;
		this.players[key].pos.x = packet[key].pos.x;
		this.players[key].pos.y = packet[key].pos.y;
		this.players[key].username = packet[key].username;
		this.players[key].race = packet[key].race;
		this.players[key].sex = packet[key].sex;
		this.players[key].dir = packet[key].dir;
		this.players[key].hair = packet[key].hair;

		PlayerController.updateTargetPos(this.players[key]);
	}

	sendMessage(message) {
		this.chatManager.sendMessage(message);
	}


	updateDisconnectedPlayers(disconnects) {
		for (let i = 0; i < disconnects.length; i++) {
			if (this.players.hasOwnProperty(disconnects[i])) {
				delete this.players[disconnects[i]];
				//delete sprite
			}
		}
	}

	hasMapUpdated(oldMap, newMap) {
		for (let i = 0; i < oldMap.length; i++) { 
			for (let j = 0; j < oldMap[0].length; j++) {
				if (oldMap[i][j] !== newMap[i][j]) {
					return true;
				}
			}
		}
		return false;
	}

	findPath(i, j) {
		let path = this.pathFinder.search(this.player.pos.x, this.player.pos.y, i, j);
		this.pathStack = this.pathFinder.getPath(i, j);
	}
}