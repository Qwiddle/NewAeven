import Colyseus from 'colyseus';

import { LoginHandler } from '../handlers/account/login.js';
import { RegisterHandler } from '../handlers/account/register.js';
import { PlayerCreateHandler } from '../handlers/player/create.js';
import { PlayerLoginHandler } from '../handlers/player/login.js';

export class MainRoom extends Colyseus.Room {
	constructor() {
		super();

		this.events = {
			'account_login': (packet, client) => LoginHandler.onLogin(packet, client),
			'account_register': (packet, client) => RegisterHandler.onRegister(packet, client),
			'player_login': (packet, client) => PlayerLoginHandler.onLogin(packet, client),
			'player_create': (packet, client) => PlayerCreateHandler.onCreate(packet, client),
		};
	}

	onCreate(options) {
		this.onMessage("*", (client, type, packet) => {
			this.handleEvents(client, type, packet);
			console.log(packet);
		});
	}
	
	onJoin(client, options) {
		console.log(`[GameServer] - ${client.sessionId}`);
	}

	handleEvents(client, type, packet) {
		if(Object.prototype.hasOwnProperty.call(this.events, type))
			this.events[type](packet, client);
	}
}