import Colyseus from 'colyseus';

export class MainRoom extends Colyseus.Room {
	constructor(world) {
		super();

		this.events = {
			'login': (message) => this.onLoginAttempt(message),
			'register': (message) => this.onRegisterAttempt(message),
			'playerCreate': (message, client) => this.onPlayerCreateAttempt(message, client),
			'playerLogin': (message, client) => this.onPlayerLoginAttempt(message, client)
		};

		this.world = world;
	}

	onCreate(options) {
		this.onMessage("*", (client, type, message) => {
			if(Object.prototype.hasOwnProperty.call(this.events, type)) {
				//message.id = client.id;

				this.events[type](message, client);
			}
		});
	}
	
	onJoin(client, options) {
		console.log(`[GameServer] - {client.sessionId}`);
	}

	onLoginAttempt(message) {

	}

	onRegisterAttmpt(message) {

	}

	onPlayerCreateAttempt(message, client) {

	}

	onPlayerLoginAttempt(message, client) {

	}
}