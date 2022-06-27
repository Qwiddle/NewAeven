import express from 'express';
import colyseus from 'colyseus';
import mongoose from 'mongoose';
import { WebSocketTransport } from "@colyseus/ws-transport"
import http from 'http';
import path from 'path';
import * as uuid from 'uuid';

import msgpack from 'msgpack-lite';

import { fileURLToPath } from 'url';

import { global } from '../client/js/global.mjs';
import { router } from './util/routes/routes.js';

import { WorldManager } from './util/worldManager.js';
import { DatabaseManager } from './util/databaseManager.js';
import CombatManager from './util/combatManager.js';

import { Enemy } from '../client/js/entity/enemy.mjs';
import { PlayerController } from '../client/js/entity/playerController.mjs';
import { EnemyController } from '../client/js/entity/enemyController.mjs';

import { MainRoom } from './rooms/mainRoom.js';

class Server {
	constructor() {
		this.worldManager = new WorldManager(this);
		this.databaseManager = new DatabaseManager();
	}

	start() {
		const app = express();

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		app.use(express.static(path.join(__dirname, '../client')));
		app.use(express.json());
		app.use(express.urlencoded({ extended: true, limit: "10kb" }));
		app.use("/user", router);

		const server = http.createServer(app);
		const port = 8443;

		const gameServer = new colyseus.Server({
			transport: new WebSocketTransport({
				server: server
			})
		});

		gameServer.listen(port);
		gameServer.define("main_room", MainRoom).filterBy(["map"]);

		mongoose.connect('mongodb://localhost/new_aeven');

		console.log(`Listening on port: ${port}`);
	}

	registerAccount(packet, createAccount, registrationFailed) {
		if (this.isValidEmail(packet.email) && this.isValidPassword(packet.password, packet.passwordConfirm)) {
			this.isValidUsername(packet.username, createAccount, registrationFailed);
		} else {
			registrationFailed();
		}
	}

	isValidUsername(username, createAccount, registrationFailed) {
		if (!username) {
			registrationFailed();
		} else {
			this.dbManager.isUsernameAvailable(username, createAccount, registrationFailed);
		}
	}

	isValidEmail(email) {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	isValidPassword(password, passwordConfirm) {
		// Will add more requirements later on.
		return password.length > 0 && password.length < 22 && password === passwordConfirm;
	}

	onPhysicsUpdate(packet) {
		this.worldManager.updates.push(packet);
	}

	physicsUpdate() {
		this.processUpdates();

		for(let i = 0; i < global.numMaps; i++) {
			this.worldManager.dynamicMapData[i] = this.worldManager.mapData[i];
		}

		for(let i = 0; i < this.worldManager.enemies[0].length; i++) {
			//this.worldManager.enemies[0][i].mapData = this.worldManager.dynamicMapData[0];
			EnemyController.update(this.worldManager.enemies[0][i]);
			//this.worldManager.enemies[0][i].mapData[enemy.pos.x][enemy.pos.y] = global.tile.enemy;
		}

		for (const key in this.worldManager.players) {
			this.updatePlayer(this.worldManager.players[key], key);
			//this.worldManager.players[key].mapData = this.worldManager.dynamicMapData[this.worldManager.players[key].map];
		}
	}

	processUpdates() {
		let toUpdate = this.worldManager.updates.slice();

		this.worldManager.updates.splice(0, toUpdate.length);

		for(let i = 0; i < toUpdate.length; i++) {
			let player = this.worldManager.players[toUpdate[i].id];
			this.processMovement(toUpdate[i], player);
			this.processMessages(toUpdate[i], player);
		}
	}

	processMovement(update, player) {
		if (this.hasMetaData(update, 'movement')) {
			player.packets.push(update['movement']);
		}
	}

	processMessages(update, player) {
		if(this.hasMetaData(update, 'message')) {
			const messageContainer = update['message'];

			if(messageContainer.messages.length > 0) {
				const message = messageContainer.messages[messageContainer.messages.length - 1];
				let messageLength = message.value.length;

				if(messageLength <= global.messageCap) {
					if(message.state == global.chatState.public) {
						player.message = messageContainer.messages[messageContainer.messages.length - 1];
						player.message.value = this.removeTags(player.message.value);
						let msg = messageContainer.messages.shift();

						msg.id = update.id;
						msg.username = player.username;
						msg.value = this.removeTags(msg.value);

						if (msg.state == global.chatState.public) {
							this.worldManager.messages.publicMessages[player.map].push(msg);
						} else if (msg.state == global.chatState.global) {
							this.worldManager.messages.globalMessages.push(msg);
						}
					}
				} else {
					messageContainer.messages.shift();
				}
			}
		}
	}

	updatePlayer(player, id) {
		if (PlayerController.isMovable(player)) {
			PlayerController.updateKeyPressed(player);
		}

		if (PlayerController.pressedKey(player)) {
			if (PlayerController.hasAttacked(player)) {
				this.handleCombat(player, id);
			} else if (!PlayerController.hasRotated(player)) {
				player.lastMoveTime = Date.now();
			}

			PlayerController.updatePosition(player);
			player.processedPackets[player.processedPackets.length - 1].pos = player.pos;
			player.keyPressed = global.direction.none;
		}
		
		//this.worldManager.dynamicMapData[player.prevMap][player.prevPos.x][player.prevPos.y] = global.TILE_EMPTY;
		//this.worldManager.dynamicMapData[player.map][player.pos.x][player.pos.y] = global.TILE_PLAYER;           
	}

	bundleServerPacket() {
		let packet = [];

		for (let i = 0; i < global.numMaps; i++) {
			packet[i] = {};
		}
	
		for (let key in this.worldManager.players) {
			let map = this.worldManager.players[key].map;

			packet[map][key] = {
				processed: this.worldManager.players[key].processedPackets.slice(),
				pos: this.worldManager.players[key].pos,
				map: map,
				race: this.worldManager.players[key].race,
				username: this.worldManager.players[key].username,
				sex: this.worldManager.players[key].sex,
				dir: this.worldManager.players[key].dir,
				hair: this.worldManager.players[key].hair,
				messages: this.worldManager.players[key].message,
				globalMessages: this.worldManager.messages.globalMessages,
				time: Date.now(),
			};
			
			this.worldManager.players[key].message = "";
			this.worldManager.players[key].processedPackets = [];
		}
	
		return packet;
	}

	getDisconnects() {
		let disconnects = [];

		for (let i = 0; i < global.numMaps; i++) {
			disconnects[i] = [];
		}

		let playerKeys = new Set(Object.keys(this.worldManager.players));   

		this.primus.forEach((socket) => {
			playerKeys.delete(socket.id);
		});

		playerKeys.forEach((key) => {
			let player = this.worldManager.players[key];
			disconnects[player.map].push(key)
			delete this.worldManager.players[key];
			console.log(key + " disconnected");
		});

		return disconnects;
	}

	serverUpdate() {
		this.dbManager.saveWorldState(this.worldManager);

		let packet = this.bundleServerPacket();
		let ePackets = this.bundleEnemyPackets();
		let disconnects = this.getDisconnects();

		this.removeDeadEnemies();

		this.primus.forEach((socket, id) => {
			if(!socket.authenticated) { 
				return;
			}

			let player = this.worldManager.players[id];	

			if(typeof player === 'undefined') { 
				return;
			}
			
			const bundledPacket = {
				event: 'serverUpdate',
				username: player.username,
				disconnects: disconnects[player.map],
				map: player.map,
				mapData: this.worldManager.dynamicMapData[player.map],
				enemies: ePackets[player.map],
				moves: packet[player.map],
				equipment: player.equipment,
				stats: player.stats,
				messages: this.worldManager.messages.publicMessages[player.map],
				globalMessages: this.worldManager.messages.globalMessages,
				time: Date.now(),
			};

			this.send(bundledPacket, socket);
		});

		this.worldManager.clearMessages();
	}

	spawnEnemies(numEnemies, map) {
		this.worldManager.numEnemiesSpawned = 0;
		this.worldManager.enemySpawnInterval = setInterval(() => this.spawnEnemy(numEnemies, map), 1000);
	}

	spawnEnemy(numEnemies, map) {
		if (this.worldManager.numEnemiesSpawned === numEnemies) { 
			clearInterval(this.worldManager.enemySpawnInterval);
			return;
		}

		let enemy = new Enemy(map, this.worldManager.dynamicMapData[map], uuid.v4());
		
		//hard coded temporarily
		enemy.prevPos = {x: 5, y: 2};
		enemy.pos = {x: 5, y: 2};
		enemy.map = map;
		EnemyController.updateTargetPos(enemy);

		this.worldManager.enemies[map].push(enemy);
		this.worldManager.numEnemiesSpawned++;
	}

	getEnemiesTargettingPlayer(id, map) {
		for(let i = 0; i < this.worldManager.enemies[map].length; i++) {
			if(this.worldManager.enemies[map][i].targetId === id) {
				this.worldManager.enemies[map][i].target = {};
				this.worldManager.enemies[map][i].targetId = "";
			}
		}
	}

	findPlayerAtCoordinate(coord, map) {
		for (let key in this.worldManager.players) {
			let player = this.worldManager.players[key];

			if (player.map == map && player.pos.x == coord.x && player.pos.y == coord.y) {
				console.log("hit!");
				break;
			}
		}
	}
	
	findEnemyAtCoord(coord, map) {
		for (let i = 0; i < this.worldManager.enemies[map].length; i++) {
			let enemy = this.worldManager.enemies[map][i];

			if (EnemyController.positionEquals(enemy.pos, coord) && !enemy.inCombat) {
				return enemy;
			}
		}

		return null;
	}

	getAttackCoordinate(player) {
		let pos = {x: 0, y: 0};

		switch (player.dir) {
			case 0: // left
				pos = {x: player.pos.x - 1, y: player.pos.y};
				break;
			case 1: // right
				pos = {x: player.pos.x + 1, y: player.pos.y};
				break;
			case 2: // up
				pos = {x: player.pos.x, y: player.pos.y - 1};
				break;
			case 3: // down
				pos = {x: player.pos.x, y: player.pos.y + 1};
				break;
			default:
				return null;
		}
		
		return pos;
	}

	handleCombat(player, id) {
		player.lastMoveTime = Date.now();
		let coord = this.getAttackCoordinate(player);

		if(coord != undefined) {
			let enemy = this.findEnemyAtCoord(coord, player.map);
			if (enemy != null) {
				CombatManager.attack(player, enemy);
				EnemyController.setTarget(enemy, player, id);
				enemy.packets.push(EnemyController.buildStatsPacket(enemy));
			}
		}
	}

	removeDeadEnemies() {
		for(let i = 0; i < global.numMaps; i++) {
			for(let j = 0; j < this.worldManager.enemies[i].length; j++) {
				let enemy = this.worldManager.enemies[i][j];

				if(CombatManager.isDead(enemy)) {
					//drop item
					this.worldManager.enemies[i].splice(j, 1);
				}
			}
		}
	}

	bundleEnemyPackets() {
		let packets = [];

		for(let i = 0; i < global.numMaps; i++) {
			packets[i] = {};
		}

		for(let i = 0; i < global.numMaps; i++) {
			for(let j = 0; j < this.worldManager.enemies[i].length; j++) {
				let enemy = this.worldManager.enemies[i][j];	
				packets[i][enemy.eid] = this.worldManager.enemies[i][j].packets.slice();
				this.worldManager.enemies[i][j].packets.splice(0, this.worldManager.enemies[i][j].packets.length);
			}

			return packets;
		}
	}

	getDistance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}

	removeTags(value) {
		return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}

	isJsonObjectEmpty(obj) {
		return Object.keys(obj).length === 0 && obj.constructor === Object;    
	}

	hasMetaData(update, key) {
		return Object.prototype.hasOwnProperty.call(update, key) && !this.isJsonObjectEmpty(update[key]);
	}

	send(packet, socket) {
		socket.write(msgpack.encode(JSON.stringify(packet)));
	}
}

new Server();