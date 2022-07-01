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
			'account_register': (packet) => AccountRegisterHandler.onRegister(packet),
			'account_login': (packet) => AccountLoginHandler.onLogin(packet),
			'player_create': (packet) => PlayerCreateHandler.onCreate(packet),
			'player_login': (packet) => PlayerLoginHandler.onLogin(packet),
			'player_welcome': (packet) => PlayerLoginHandler.onWelcome(packet, this.game)
		};

		this.colyseus = new Colyseus.Client(`ws://${this.ip.address}:${this.ip.port}`);
		this.game = new Game(this);
	}

	async consumeReservation(reservation) {
		const room = await this.colyseus.consumeSeatReservation(reservation);
		this.room = room;

		console.log(room.sessionId, "joined", room.name);

		room.onMessage("*", (type, packet) => {
			console.log(packet);
			this.handleEvents(type, packet);
		});

		return room;
	}

	handleEvents(type, packet) {
		if(Object.prototype.hasOwnProperty.call(this.events, type))
			this.events[type](packet);
	}

	send(packet, room) {
		room.send(packet.event, packet);
	}
}