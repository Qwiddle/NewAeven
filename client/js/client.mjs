import { ViewLoader } from './ui/viewLoader.mjs';
import { Game } from './game.mjs';

import { AccountLoginHandler } from './handlers/account/login.mjs';
import { AccountRegisterHandler } from './handlers/account/register.mjs';
import { PlayerLoginHandler } from './handlers/player/login.mjs';
import { PlayerCreateHandler } from './handlers/player/create.mjs';

export class Client {
	constructor() {
		this.ip = {
			address: '127.0.0.1',
			port: '8443',
		};
		
		this.game = new Game(this);

		this.accountLoginHandler = new AccountLoginHandler();
		this.accountRegisterHandler = new AccountRegisterHandler();
		this.playerLoginHandler = new PlayerLoginHandler();
		this.playerCreateHandler = new PlayerCreateHandler();

		this.handlers = {
			accountRegister: this.accountRegisterHandler.onRegister,
			accountLogin: this.accountLoginHandler.onLogin,
			playerCreate: this.playerCreateHandler.onCreate,
			playerLogin: this.playerLoginHandler.onLogin,
			playerWelcome: this.playerLoginHandler.onWelcome,
		}

		this.events = {
			'register': (packet) => this.handlers.accountRegister(packet),
			'login': (packet) => this.handlers.accountLogin(packet),
			'playerCreate': (packet) => this.handlers.playerCreate(packet),
			'playerLogin': (packet) => this.handlers.playerLogin(packet),
			'playerWelcome': (packet) => this.handlers.playerWelcome(packet)
		};
	}

	async connect() {
		this.client = new Colyseus.Client(`ws://${this.ip.address}:${this.ip.port}`);

		const relay = await this.client.joinOrCreate("main_room").then( room => {
			console.log(room.sessionId, "joined", room.name);
			this.room = room;

			room.onMessage("*", (type, packet) => {
				console.log(packet);
				this.handleEvents(type, packet);
			});

		}).catch(e => {
			console.log(e);
		});

		//this.register('andrewbob', 'password', 'abc@abc.com');
		this.login('andrewbob', 'password');
	}

	handleEvents(type, packet) {
		if(Object.prototype.hasOwnProperty.call(this.events, type))
			this.events[type](packet);
	}

	login(account, password) {
		const loginPacket = {
			'event': 'login',
			'account': account,
			'password': password,
		};

		this.send(loginPacket, this.room);
	}

	register(username, password, email) {
		const packet = {
			'event': 'register',
			'account': username,
			'password': password,
			'email': email,
		};

		this.send(packet, this.room);
	}

	playerCreate(name, sex, race, hair) {
		const playerCreatePacket = {
			'event': 'playerCreate',
			'username': name,
			'sex': sex,
			'race': race,
			'hair': hair
		}

		this.send(playerCreatePacket);
	}


	playerLogin(playerID) {
		const playerLoginPacket = {
			'event': 'playerLogin',
			'playerID': playerID
		};

		this.send(playerLoginPacket);
	}

	send(packet, room) {
		room.send(packet.event, packet);
	}
}