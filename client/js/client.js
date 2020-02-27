import ViewLoader from './ui/viewLoader.js';
import Game from './game.js';

export default class Client {
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

	connect() {
		this.primus = new Primus(this.ip.address + ":" + this.ip.port, {
			reconnect: {
		    	maxDelay: Infinity,
		    	minDelay: 500,
		    	retries: 10
			},
			strategy: ['online', 'disconnect', 'timeout'],
		});

		this.primus.on("open", () => {
			console.log('successfully connected to the game server.');
		});

		this.primus.on('data', (data) => {
			const decodedData = msgpack.decode(data.data);
			const packet = JSON.parse(decodedData);

			//console.log(packet);

			if (this.events.hasOwnProperty(packet.event)) {
				this.events[packet.event](packet);
			};
		});
	}

	login(username, password) {
		const loginPacket = {
			'event': 'login',
			'username': username,
			'password': password,
		};

		this.send(loginPacket);
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

	register(username, password, passwordConfirm, email) {
		const registerPacket = {
			'event': 'register',
			'username': username,
			'password': password,
			'passwordConfirm': passwordConfirm,
			'email': email,
		};

		this.send(registerPacket);
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

	send(packet) {
		this.primus.write(msgpack.encode(JSON.stringify(packet)));
	}
}