import Colyseus from 'colyseus';

import { LoginHandler } from '../handlers/account/login.js';
import { RegisterHandler } from '../handlers/account/register.js';

export class MainRoom extends Colyseus.Room {
	constructor() {
		super();

		this.events = {
			'login': (packet, client) => LoginHandler.onLogin(packet, client),
			'register': (packet, client) => RegisterHandler.onRegister(packet, client)
		};
	}

	onCreate(options) {
		this.onMessage("*", (client, type, packet) => {
			this.handleEvents(client, type, packet);
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