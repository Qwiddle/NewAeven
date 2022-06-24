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

		this.events = {
			'register': (packet) => AccountRegisterHandler.onRegister(packet),
			'login': (packet) => AccountLoginHandler.onLogin(packet),
			'playerCreate': (packet) => PlayerCreateHandler.onCreate(packet),
			'playerLogin': (packet) => PlayerLoginHandler.onLogin(packet),
			'playerWelcome': (packet) => PlayerLoginHandler.onWelcome(packet)
		};

		this.connect();
	}

	async connect() {
		this.client = new Colyseus.Client(`ws://${this.ip.address}:${this.ip.port}`);

		const relay = await this.client.joinOrCreate("main_room").then( room => {
			console.log(room.sessionId, "joined", room.name);
			this.room = room;

			this.game = new Game(this);

			room.onMessage("*", (type, packet) => {
				console.log(packet);
				this.handleEvents(type, packet);
			});

		}).catch(e => {
			console.log(e);
		});
	}

	handleEvents(type, packet) {
		if(Object.prototype.hasOwnProperty.call(this.events, type))
			this.events[type](packet);
	}

	send(packet, room) {
		room.send(packet.event, packet);
	}
}