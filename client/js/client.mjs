import { ViewLoader } from './ui/viewLoader.mjs';
import { Game } from './game.mjs';

export class Client {
	constructor() {
		this.ip = {
			address: '127.0.0.1',
			port: '8443',
		};

		this.viewLoader = new ViewLoader();
		this.game = new Game(this);

		this.events = {
			'connection': (packet) => this.onConnection(packet),
			'register': (packet) => this.onRegister(packet),
			'login': (packet) => this.onLogin(packet),
			'playerCreate': (packet) => this.onPlayerCreate(packet),
			'playerLogin': (packet) => this.onPlayerLogin(packet),
			'playerWelcome': (packet) => this.playerWelcome(packet),
			'serverUpdate': (packet) => this.game.onServerUpdate(packet)
		};
	}

	async connect() {
		this.colyseus = new Colyseus.Client(`ws://${this.ip.address}:${this.ip.port}`);

		const relay = await this.colyseus.joinOrCreate("main_room").then( room => {
			console.log(room.sessionId, "joined", room.name);
			this.room = room;
		}).catch(e => {
			console.log(e);
		});

		//this.register('andrewbob', 'password', 'abc@abc.com');
		this.login('andrewbob', 'password');
	}

	login(account, password) {
		const loginPacket = {
			'event': 'login',
			'account': account,
			'password': password,
		};

		this.send(loginPacket, this.room);
	}

	onLogin(packet) {
		if (packet.success) {
			if(packet.characters == 0) {
				this.viewLoader.removeView("home", true, () => {
					this.viewLoader.loadView("charactercreation", true);
				});
			} else {
				this.viewLoader.removeView("home", true, () => {
					this.viewLoader.loadView("characterselection", true, () => {
						if(packet.characters.length >= 1 || packet.characters >= 1) {
							$("#0").children(".create3d").removeClass("create3d").addClass("login3d");
							$("#0").children(".characterbox").append('<div class="playersprite">');
						} if(packet.characters.length >= 2 || packet.characters >= 2) {
							$("#1").children(".create3d").removeClass("create3d").addClass("login3d");
							$("#1").children(".characterbox").append('<div class="playersprite">');
						} if(packet.characters.length >= 3 || packet.characters == 3) {
							$("#2").children(".create3d").removeClass("create3d").addClass("login3d");
							$("#2").children(".characterbox").append('<div class="playersprite">');
						}
					});
				});
			}
		} else {
			alert('Login failed. Please check your account information and try again.');
		}
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

	onRegister(packet) {
		if (packet.success) {
			this.viewLoader.removeView("registration", true, () => {
				this.viewLoader.showView("home", true);
			});
		} else {
			alert("registration unsuccessful.");
		}
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

	onPlayerCreate(packet) {
		if(packet.success) {
			this.viewLoader.removeView("charactercreation", true, () => {
				this.viewLoader.loadView("home", false, () => {
					this.onLogin(packet);
				});
			});
		}
	}

	playerLogin(playerID) {
		const playerLoginPacket = {
			'event': 'playerLogin',
			'playerID': playerID
		};

		this.send(playerLoginPacket);
	}

	onPlayerLogin(packet) {
		if(packet.success) {
			this.viewLoader.removeView("characterselection", true);
		} else {
			alert('player login attempt unsuccessful. possible hacking attempt');
		}
	}

	playerWelcome(packet) {
		this.id = packet.id;
		this.game.playerConnected(packet);

		this.viewLoader.removeView(this.viewLoader.currentView, true, () => {
			this.viewLoader.loadView("hotkeys", true);
			this.viewLoader.loadView("chat", true, () => {
				$("#chatinput").focus();
			});
			$('.servertext').hide();
		});	
	}

	send(packet, room) {
		room.send(packet.event, packet);
	}
}