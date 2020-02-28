require = require("esm")(module);
const Primus = require('primus');
const express = require('express');
const http = require('http');
const path = require('path');
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const msgpack = require("msgpack-lite");

const global = require('../client/js/global.js').default;
const DatabaseManager = require('./util/databaseManager.js').default;
const WorldManager = require('./util/worldManager.js').default;
const MapManager = require('./util/mapManager.js').default;
const Player = require('../client/js/entity/player.js').default;
const PlayerController = require('../client/js/entity/PlayerController.js').default;

class Server {
	constructor() {
		this.dbManager = new DatabaseManager();
		this.worldManager = new WorldManager();
		this.mapManager = new MapManager();

		this.events = {
			'login': (packet) => this.onLoginAttempt(packet),
			'register': (packet) => this.onRegisterAttempt(packet),
			'playerCreate': (packet, socket) => this.onPlayerCreateAttempt(packet, socket),
			'playerLogin': (packet, socket) => this.onPlayerLoginAttempt(packet, socket),
			'physicsUpdate': (packet) => this.onPhysicsUpdate(packet)
		};
	}

	start() {
		const app = express();
		app.use(express.static(path.join(__dirname, '../client')));

		const server = http.createServer(app);
		const port = process.env.PORT || 8443;

		this.primus = new Primus(server);

		server.listen(port, () => {
			console.log("New Aeven Game Server || Listening on port: " + port +".");
		});

		this.primus.on('connection', (socket) => {
			this.onConnection(socket);
		});

		this.primus.on('disconnection', (socket) => {
			this.onDisconnect(socket);
		});

		setInterval(() => this.serverUpdate(), global.serverTick);
		setInterval(() => this.physicsUpdate(), global.physicsTick);
	}


	onConnection(socket) {
		console.log("client connected: " + socket.id);

		socket.on('data', (data) => {
			let decodedData = msgpack.decode(data.data);
			let packet = JSON.parse(decodedData);
			console.error(packet);

			if(this.events.hasOwnProperty(packet.event)) {
				packet.id = socket.id;
				this.events[packet.event](packet, socket);
			}
		});
	}

	onDisconnect(socket) {
		console.log("client disconnected: " + socket.id);
	}

	onLoginAttempt(packet) {
		this.primus.forEach((socket, id, connections) => {
			if (socket.id === packet.id) {
				this.isValidLoginAttempt(socket, packet.username, packet.password);		
			}
		});
	}

	isValidLoginAttempt(socket, username, password) {
		const onFailure = () => {
			const packet = {
				event: 'login',
				success: false,
			}

			this.send(packet, socket); 
		}

		const onSuccess = (data) => {
			bcrypt.compare(password, data.password, (err, match) => {
				if (match) {
					const onCharactersExist = (data) => {
						const packet = {
							event: 'login',
							success: true,
							characters: data,
						}

						this.send(packet, socket); 
					} 

					const onNoCharacters = () => {
						const packet = {
							event: 'login',
							success: true,
							characters: 0,
						}

						this.send(packet, socket); 
					}

					socket.accountname = username;
					this.dbManager.getCharacters(username, onCharactersExist, onNoCharacters);
				} else {	
					onFailure();
				}
			});
		}

		this.dbManager.getAccount(username, onSuccess, onFailure);
	}

	onRegisterAttempt(packet) {
		this.primus.forEach((socket, id, connections) => {
			if (socket.id === packet.id) {	
				this.attemptRegistration(socket, packet);		
			}
		});
	}

	attemptRegistration(socket, packet) {
		const registrationSuccessful = () => {
			const registerPacket = {
				event: 'register',
				success: true,
			}

			this.send(registerPacket, socket);
		}

		const registrationFailed = () => {
			const registerPacket = {
				event: 'register',
				success: false,
			}

			this.send(registerPacket, socket);
		}

		const createAccount = () => {
			bcrypt.hash(packet.password, 10, (err, hash) => {
				this.dbManager.createAccount(packet, hash, socket.address);
				registrationSuccessful();
			});
		}

		this.registerAccount(packet, createAccount, registrationFailed);
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
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	isValidPassword(password, passwordConfirm) {
		// Will add more requirements later on.
		return password.length > 0 && password.length < 22 && password === passwordConfirm;
	}

	onPlayerCreateAttempt(packet, socket) {
		const onCharactersExist = (rows) => {
			if(rows.length < 3) {
				if(rows.length == 1) {
					packet.characters = 1;
				}

				if(rows.length == 2) {
					packet.characters = 2;
				}

				if(rows.length <= 2) {
					this.playerCreate(packet, socket);
				}
			}
		}

		const onNoCharacters = () => {
			packet.characters = 0;
			this.playerCreate(packet, socket);
		}

		this.dbManager.getCharacters(socket.accountname, onCharactersExist, onNoCharacters);
	}

	playerCreate(packet, socket) {
		packet.username = packet.username.charAt(0).toUpperCase() + packet.username.slice(1);
		let characters = packet.characters;

		const nameUnavailable = () => {
			const createPacket = {
				event: 'playerCreate',
				success: false,
			}

			this.send(createPacket, socket);
		}

		const nameAvailable = () => {
			characters++;

			const playerData = {
				account_name: socket.accountname,
				username: packet.username,
				sex: packet.sex, 
				race: packet.race,
				hairStyle: packet.hair.style, 
				hairColor: packet.hair.color,
				map: 0, 
				x: 0,
				y: 0, 
				dir: 0,
			}

			const statsData = {
				username: packet.username,
				level: 1,
				hp: 30,
				maxhp: 30,
			}

			const equipmentData = {
				username: packet.username, 
				armorID: 0,
				bootsID: 0,
				weaponID: 0,
			}

			const onSuccess = () => {
				const createPacket = {
					event: 'playerCreate',
					success: true,
					username: playerData.username,
					sex: playerData.sex,
					race: playerData.race,
					hairStyle: playerData.hairStyle,
					hairColor: playerData.hairColor,
					characters: characters
				}

				this.send(createPacket, socket);
			}

			this.dbManager.createNewPlayer(playerData, statsData, equipmentData, onSuccess);
		}

		this.dbManager.getPlayer(packet.username, nameUnavailable, nameAvailable);
	}

	onPlayerLoginAttempt(packet, socket) {
		const onCharactersExist = (rows) => {
			const playerID = packet.playerID;
			const player = rows[playerID];

			this.playerLogin(socket, player.username);
		}

		const onNoCharacters = () => {
			//disconnect
		}

		this.dbManager.getCharacters(socket.accountname, onCharactersExist, onNoCharacters);
	}

	playerLogin(socket, username) {
		const startMapID = global.startMapID;
		const startMapX = global.startMapX;
		const startMapY = global.startMapY;

		const newPlayer = new Player();

		newPlayer.username = username;
		newPlayer.map = startMapID;
		newPlayer.mapData = this.mapManager.mapsData[startMapID];

		const loadPlayer = (player, data) => {
			player.accountname = data.account_name;
			player.username = data.username;
			player.sex = data.sex;
			player.race = data.race;
			player.map = data.map;
			player.pos.x = data.x;
			player.pos.y = data.y;
			player.dir = data.dir;
			player.hair.style = data.hairStyle
			player.hair.color = data.hairColor;

			player.equipment.armor.id = data.armorID;
			player.equipment.weapon.id = data.weaponID;
			player.equipment.boots.id = data.bootsID;

			player.stats.hp = data.hp;
			player.stats.maxhp = data.maxhp;
			player.stats.level = data.level;

			this.worldManager.players[socket.id] = player;

			const initPacket = {
				event: 'playerWelcome',
				id: socket.id,
				username: player.username,
				map: player.map,
				mapData: this.mapManager.mapsData[player.map],
				mapJson: this.mapManager.mapsJson[player.map],
				pos: player.pos,
				dir: player.dir,
				race: player.race,
				sex: player.sex,
				hair: player.hair,
				equipment: player.equipment,
				stats: player.stats
			};

			socket.authenticated = true;

			this.send(initPacket, socket);
		}

		this.dbManager.getAllPlayerData(newPlayer, loadPlayer);
	}

	onPhysicsUpdate(packet) {
		this.worldManager.updates.push(packet);
	}

	physicsUpdate() {
		this.processUpdates();

		for(let i = 0; i < global.numMaps; i++) {
			this.worldManager.dynamicMapData[i] = this.worldManager.mapData[i];
		}

		for (const key in this.worldManager.players) {
			this.updatePlayer(this.worldManager.players[key], key);
			this.worldManager.players[key].mapData = this.worldManager.dynamicMapData[player.map];
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
			}
		}
	}

	updatePlayer(player, id) {
		if (PlayerController.isMovable(player)) {
			PlayerController.updateKeyPressed(player);
		}

		if (PlayerController.pressedKey(player)) {
			if (PlayerController.hasAttacked(player)) {
			   // this.handleCombat(player, id);
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
			this.worldManager.players[key].processedPackets = []
		}
	
		return packet;
	}

	getDisconnects() {
		let disconnects = [];

		for (let i = 0; i < global.numMaps; i++) {
			disconnects[i] = [];
		}

		let playerKeys = new Set(Object.keys(this.worldManager.players));   

		this.primus.forEach((socket, id, connections) => {
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
		const disconnects = this.getDisconnects();

		this.primus.forEach((socket, id, connections) => {
			if(!socket.authenticated) { return; }

			let player = this.worldManager.players[id];	
			if(typeof player === 'undefined') { return; }
			
			const bundledPacket = {
				event: 'serverUpdate',
				username: player.username,
				disconnects: disconnects[player.map],
				map: player.map,
				mapData: this.worldManager.dynamicMapData[player.map],
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

	removeTags(value) {
		return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}

	isJsonObjectEmpty(obj) {
		return Object.keys(obj).length === 0 && obj.constructor === Object;    
	}

	hasMetaData(update, key) {
		return update.hasOwnProperty(key) && !this.isJsonObjectEmpty(update[key]);
	}

	send(packet, socket) {
		socket.write(msgpack.encode(JSON.stringify(packet)));
	}
}

new Server().start();