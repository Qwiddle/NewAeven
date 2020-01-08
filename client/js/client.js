import ViewLoader from './viewLoader.js';
import ClientController from './clientController.js';
import BootScene from './scenes/bootScene.js';
import LoadScene from './scenes/loadScene.js';
import HomeScene from './scenes/homeScene.js';
import GameScene from './scenes/gameScene.js';
import Game from './game.js';

export default class Client {
	constructor() {
		const self = this;

        this.ip = {
            address: '157.245.125.191',
            port: '8443',
        }

		this.events = {
			'pong': (packet) => self.onPong(packet),
			'welcome': (packet) => self.connectedToServer(packet),
			'on_register': (packet) => self.onRegister(packet),
			'on_login': (packet) => self.onLogin(packet),
			'on_create': (packet) => self.onCreate(packet),
			'serverUpdate': (packet) => self.game.serverUpdate(packet),
		};

        this.config = {
            type: Phaser.CANVAS,
            pixelArt: true,
            antialias: false,
            roundPixels: false,
            parent: 'cvs',
            scale: {
                mode: Phaser.Scale.RESIZE,
                width: 640,
                height: 480,
                min: {
                    width: 800,
                    height: 600
                },
                max: {
                    width: 1920,
                    height: 1080
                },
            },
            scene: [
                BootScene, LoadScene, HomeScene, GameScene
            ],
        };

        this.phaser = new Phaser.Game(this.config);
        this.phaser.scene.start('boot', { client: this});

        this.viewLoader = new ViewLoader();
        this.game = new Game(new ClientController(this, this.phaser));

        this._socket = {};
        this.id = "";
		this.pingTime = 0;
        this.latency = 0;
	}

	connect() {
		const self = this;
		this._socket = new WebSocket('ws://' + this.ip.address + ':' + this.ip.port);     

        this._socket.onopen = (event) => {
            console.log("ws:: client connected");
        }   

        this._socket.onmessage = function (packet) { 
            const data = JSON.parse(packet.data);

            if (self.events.hasOwnProperty(data.event)) {
            	self.events[data.event](data);
            }
        }

        this._socket.onclose = function (packet) {
            alert("Disconnected from the server");
            location.reload();	
        }
	}

	connectedToServer(packet) {
        this.id = packet.id;

        this.startPingPong();            
        this.addKeyListenersToClient();
        this.game.clientConnected(packet); 

        //this.viewLoader.loadView("settings", true);
        this.viewLoader.loadView("hotkeys", true);
    }

    startPingPong() {
        const self = this;

        setInterval(function() {
            const pingPacket = {
                'event':'ping',   
            }

            self.pingTime = Date.now();
            self.send(pingPacket);

        }, 4000);
    }

    onPong() {
        this.latency = (Date.now() - this.pingTime) / 2;
    }

	send(packet) {
        this._socket.send(JSON.stringify(packet));
    }

    createCharacter(username, race, sex, style, color) {
        const createPacket = {
            'event': 'create',
            'username': username,
            'race': race,
            'sex': sex,
            'style': style,
            'color': color,
        }

        this.send(createPacket);
    }

    onCreate(packet) {
        const self = this;

        if(packet.success) {
            this.viewLoader.removeView("charactercreation", true, function() {
                self.viewLoader.showView("navbuttons", true);
                self.viewLoader.loadView("home", true);
            });
        } else {
            alert('character creation failed.');
        }
    }

	login(username, password) {
		const loginPacket = {
			'event': 'login',
			'username': username,
			'password': password,
		}

		this.send(loginPacket);
	}

	onLogin(packet) {
        const self = this;

		if (packet.success) {
            if(packet.characters == 0) {
                this.viewLoader.removeView("home", true, function() {
                    self.viewLoader.hideView("navbuttons", true);
                    self.viewLoader.loadView("charactercreation", true);
                });
            } else {
                this.viewLoader.removeView("home", true, function() {
                    self.viewLoader.removeView("navbuttons", true);
                    self.loginPlayer();
                });
            }
		} else {
			alert('login failed');
		}
	}

    loginPlayer() {
        const loginPlayerPacket = {
            'event': 'loginPlayer',
        }

        this.send(loginPlayerPacket);
    }

	register(username, password, email) {
		const registerPacket = {
			'event': 'register',
			'username': username,
			'password': password,
			'passwordConfirm': password,
			'email': email,
		}

		this.send(registerPacket);
	}

	onRegister(packet) {
        const self = this;

		if (packet.success) {
			this.viewLoader.removeView("register", true, function() {
                self.viewLoader.showView("navbuttons", true);
                self.viewLoader.loadView("home", true);
            });
		} else {
			alert("registration unsuccessful.");
		}
	}

	addKeyListenersToClient() {
        this.keys = [];
        this.keyTimer = 0;

        const self = this;

        addEventListener("keydown", function (key) {
            if (!self.keys[key.keyCode]) {
                self.keyTimer = Date.now() + 90;
            }
            self.keys[key.keyCode] = true;
        
            self.isEnterKeyPressed(self);
        });

        addEventListener("keyup", function (key) {
            if (self.keys[key.keyCode]) {
                self.keyTimer = Date.now() + 90;
            }
            self.keys[key.keyCode] = false;
        });
    }

    isEnterKeyPressed(client) {
        if (client.keys[13]) {
           //enable chat, enter key pressed
        }
    }
}