const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const uuid = require('node-uuid');
const bcrypt = require('bcrypt');

const DatabaseManager = require('./util/databaseManager.js');
const MapManager = require('./util/mapManager.js');
const World = require('./util/world.js');
const Player = require('./client/js/entity/player.js');
const PlayerController = require('./client/js/entity/playercontroller.js');
const global = require('./client/global.js');

class Server {
	constructor() {
		const self = this;

		this.db = new DatabaseManager();
		this.mapManager = new MapManager();
		this.world = new World();

		this.world.maps = this.mapManager.maps;

		this.events = {
			'physicsUpdate': (packet) => self.world.updates.push(packet),
			'register': (packet) => self.onRegisterAttempt(packet),
			'login': (packet) => self.onLoginAttempt(packet),
            'create': (packet, socket) => self.onCreateAttempt(packet, socket),
		};
	}

	start() {
		const app = express();
		app.use(express.static(path.join(__dirname, '/client')));

		let https = express();

		const server = http.createServer(app);
		const port = process.env.PORT || 8443;

		this.wss = new WebSocket.Server({server});
	
		server.listen(port, () => {
			console.log("server:: listening on port " + port);
		});

		const self = this;       

		this.wss.on('connection', (socket) => {
		    this.onConnection(socket);
		});

		setInterval(() => self.serverUpdate(), global.serverTick);
		setInterval(() => self.physicsUpdate(), global.physicsTick);
	}

	onConnection(socket) {
        socket.id = uuid.v4();    
        socket.authenticated = true;    
        socket.isAlive = true;
        console.log("ws:: client connected: " + socket.id);
    
        const self = this;

        socket.on('message', function(packet) {
        	if (self.isJsonString(packet)) {
        		const data = JSON.parse(packet);

        		if(self.events.hasOwnProperty(data.event)) {
        			data.id = socket.id;
        			self.events[data.event](data, socket);
        		}
        	}
        });
      	 
        socket.on('error', (err) => {
        	//handle
        });  
    }

    serverUpdate() {
    	this.db.saveWorldState(this.world);
    	const packet = this.bundleServerPacket();
    	const disconnects = this.getDisconnects();

    	this.wss.clients.forEach((socket) => {
    		if(!socket.authenticated)
    			return;

    		let player = this.world.players[socket.id];

    		const bundledPacket = {
    			event: 'serverUpdate',
    			time: Date.now(),
    		};

    		if(socket.readyState === WebSocket.OPEN)
    			socket.send(JSON.stringify(bundledPacket));
    			console.log('sent');
    	});
    }

    physicsUpdate() {
    	this.processUpdates();

    	for (let i = 0; i < global.numMaps; i++) {
    		//process enemies
    	}

    	for (const key in this.world.players) {
    		const player = this.world.players[key];
    		this.world.players[key].map = this.world.dynamicMap[player.mapId];
    		this.world.players[key].map[player.pos.x][player.pos.y] = 9;
    	}

    	for (const id in this.world.players) {
    		this.updatePlayer(this.world.players[id], id);
    	}
    }

    updatePlayer(player, id) {
    	//update player pos based on input
    	if (PlayerController.isMovable(player)) {
    		PlayerController.updateKeyPressed(player);
    	}

    	if (PlayerController.pressedKey(player)) {
    		if(PlayerController.hasAttacked(player)) {
    			//handlecombat
    		} else if(!PlayerController.hasRotated(player)) {
    			player.lastMoveTime = Date.now();
    		}

    		PlayerController.updatePosition(player);
    		player.processedPackets[player.processedPackets.length-1].pos = player.pos;
    		player.keyPressed = global.Direction.NONE;

    	}

     	if(player.changedMaps) {
     		//handle map change
     	}

     	this.world.dynamicMap[player.prevMap][player.prevPos.x][player.prevPos.y] = global.tileEmpty;
     	this.world.dynamicMap[player.map][player.pos.x][player.pos.y] = global.tilePlayer;           

    }

    processUpdates() {
    	let toUpdate = this.world.updates.slice();
    	this.world.updates.splice(0, toUpdate.length);

    	for(let i = 0; i < toUpdate.length; i++) {
    		let player = this.world.players[toUpdate.id];
    		this.processMovement(toUpdate[i], player);
    	}
    }

    bundleServerPacket() {
        let packet = [];

        for (let i = 0; i < global.NUM_MAPS; i++) {
            packet[i] = {};
        }
    
        for (let key in this.world.players) {
            let map = this.world.players[key].map;
            packet[map][key] = {
                processed: this.world.players[key].processedPackets.slice(),
                pos: this.world.players[key].pos,
                time: Date.now(),
                race: this.world.players[key].race,
                map: map
            };
    
            this.world.players[key].processedPackets = [];
        }
    
        return packet;
    }

    processMovement(update, player) {
    	if (this.hasMetaData(update, 'movement')) {
    		player.packets.push(update['movement']);
    	}
    }


    initClient(socket, username) {
    	const self = this;
    	const newClient = new Player();

    	newClient.username = username;
    	newClient.mapId = 0;
    	newClient.map = this.mapManager.maps[newClient.mapId];

    	const loadPlayer = function(player, data) {
	    	player.username = data.username;
	    	player.sex = data.sex;
	    	player.race = data.race;
	    	player.map = data.map;
	    	player.pos.x = data.x;
	    	player.pos.y = data.y;
	    	player.dir = data.dir;
	    	player.hair.style = data.hairStyle
	    	player.hair.color = data.hairColor;

	    	player.equipment.shirt.name = data.shirtName;
	    	player.equipment.shirt.id = data.shirtId;
	    	player.equipment.pants.name = data.pantsName;
	    	player.equipment.pants.id = data.pantsId;
	    	player.equipment.weapon.name = data.weaponName;
	    	player.equipment.weapon.id = data.weaponId;

	    	player.stats.hp = data.curr_hp;
	    	player.stats.maxHp = data.max_hp;
	    	player.stats.level = data.level;

	    	this.world.players[socket.id] = player;

	    	let initPacket = {
	    		event: 'welcome',
	    		id: socket.id,
	    		username: player.username,
	    		map: self.mapManager.maps[player.map],
	    		mapId: player.mapId,
	    		pos: player.pos,
	    		dir: player.dir,
	    		race: player.race,
	    		sex: player.sex,
	    		hair: player.hair,
	    		equipment: player.equipment,
	    		stats: player.stats
	    	};

	    	socket.authenticated = true;
	    	socket.send(JSON.stringify(initPacket));
	    }

	    this.db.getPlayerData(newClient, loadPlayer, createPlayer);
    }

    hasMetaData(update, key) {
    	return update.hasOwnProperty(key) && !this.isJsonObjectEmpty(update[key]);
    }

    getDisconnects() {
    	let disconnects = [];

    	for (let i = 0; i < global.numMaps; i++)
    		disconnects[i] = [];

    	let playerKeys = new Set(Object.keys(this.world.players));

    	playerKeys.forEach((key) => {
    		let player = this.world.players[key];
    		disconnects[player.map].push(key);
    		delete this.world.players[key];
    		console.log(key + " disconnected");
    	});

    	this.wss.clients.forEach((socket) => {
    		playerKeys.delete(socket.id);
    	});

    	return disconnects;
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    
    isJsonObjectEmpty(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;    
    }

    onLoginAttempt(packet) {
        const self = this;
        this.wss.clients.forEach((socket) => {
            if (socket.id === packet.id) {
                self.isValidLoginAttempt(socket, packet.username, packet.password);
            }
        });
    }

    isValidLoginAttempt(socket, username, password) {
        const self = this;

        const onFailure = function() {
            const packet = {
                event: 'on_login',
                success: false,
            }
            socket.send(JSON.stringify(packet)); 
        }

        const onSuccess = function(data) {
            bcrypt.compare(password, data.password, function(err, match) {
                if (match) {
                    socket.authenticated = true;

                    const onCharactersExist = function(data) {
                        const packet = {
                            event: 'on_login',
                            success: true,
                            characters: data,
                        }

                        socket.send(JSON.stringify(packet)); 
                    } 

                    const onNoCharacters = function() {
                        const packet = {
                            event: 'on_login',
                            success: true,
                            characters: 0,
                        }

                        socket.send(JSON.stringify(packet)); 
                    }
                    socket.account_name = username;
                    self.db.getCharacters(username, onCharactersExist, onNoCharacters);
                } else {	
                    onFailure();
                }
            });
        }

        if (username && password) {
            let online = false;

            for (const key in this.world.players) {
                let player = this.world.players[key];
                if(player.username = username) { online = true; }
            }

            if(!online) 
            	this.db.getAccount(username, onSuccess, onFailure);
        }
    }

    onRegisterAttempt(packet) {
        const self = this;

        this.wss.clients.forEach((socket) => {
            if (socket.id === packet.id) {
                self.attemptRegistration(socket, packet);
                return;
            }
        });
    }

    attemptRegistration(socket, packet) {
        const self = this;
        
        const registrationSuccessful = function() {
            const packet = {
                event: 'on_register',
                success: true,
            }

            socket.send(JSON.stringify(packet)); 
        }

        const registrationFailed = function() {
            const packet = {
                event: 'on_register',
                success: false,
            }

            socket.send(JSON.stringify(packet));            
        }

        const createAccount = function() {
            bcrypt.hash(packet.password, 10, function(err, hash) {
                self.db.createAccount(packet, hash, socket._socket.remoteAddress);
                registrationSuccessful();              
            });
        }

        this.registerAccount(packet, createAccount, registrationFailed);
    }

    onCreateAttempt(packet, socket) {
        const self = this;

        const onCharactersExist = function() {
            // current limit is 1. As of now, the create button shouldn't even display, so don't tell the client anything. Clearly this was a cheating attempt.
        }

        const onNoCharacters = function() {
            self.createCharacter(packet, socket);
        }

        this.db.getCharacters(socket.account_name, onCharactersExist, onNoCharacters);
    }

    createCharacter(packet, socket) {
        const self = this;
        packet.username = packet.username.charAt(0).toUpperCase() + packet.username.slice(1);

        const nameUnavailable = function() {
            const createPacket = {
                event: 'on_create',
                success: false,
            }
            socket.send(JSON.stringify(createPacket));  
        }

        const nameAvailable = function() {
            const playerData = {
                account_name: socket.account_name,
                username: packet.username,
                sex: packet.sex, 
                race: packet.race,
                hairStyle: packet.style, 
                hairColor: packet.color,
                map: 0, 
                x: 0,
                y: 0, 
                dir: 0,
            }

            const statsData = {
                username: packet.username,
                level: 1,
                curr_hp: 30,
                max_hp: 30,
            }

            const equipmentData = {
                username: packet.username, 
                shirtId: '',
                shirtName: '',
                pantsId: '',
                pantsName: '',
                weaponId: '',
                weaponName: '',
            }

            const onSuccess = function() {
                const createPacket = {
                    event: 'on_create',
                    success: true,
                    username: playerData.username,
                    sex: playerData.sex,
                    race: playerData.race,
                    hairStyle: playerData.hairStyle,
                    hairColor: playerData.hairColor,
                }
                socket.send(JSON.stringify(createPacket));                
            }

            self.db.createNewPlayer(playerData, statsData, equipmentData, onSuccess);
            
        }
        this.db.getPlayer(packet.username, nameUnavailable, nameAvailable);
    }

    registerAccount(packet, createAccount, registrationFailed) {
        if (this.isValidEmail(packet.email) && this.isValidPassword(packet.password, packet.passwordConfirm)) {
            this.isValidUsername(packet.username, createAccount, registrationFailed);
        } else {
            registrationFailed()
        }
    }

    isValidUsername(username, createAccount, registrationFailed) {
        if (!username) {
            registrationFailed();
        } else {
            this.db.isUsernameAvailable(username, createAccount, registrationFailed);
        }
    }

    isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    isValidPassword(password, passwordConfirm) {
        // Will add more requirements later on.
        return password.length > 0 && password === passwordConfirm;
    }
}

new Server().start();