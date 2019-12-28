import ViewLoader from './viewLoader.js';

export default class Client {
	constructor() {
		const self = this;

        this.ip = {
            address: '127.0.0.1',
            port: '8443',
        }

		this.events = {
			'pong': (packet) => self.onPong(packet),
			'welcome': (packet) => self.connectedToServer(packet),
			'on_register': (packet) => self.onRegister(packet),
			'on_login': (packet) => self.onLogin(packet),
			'on_create': (packet) => self.onCreate(packet),
			//'server_update': (packet) => self.game.serverUpdate(packet)
		};

        this.viewLoader = new ViewLoader();
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
    }

    startPingPong() {
        const self = this;

        setInterval(function() {
            const pingPacket = {
                'event':'PING',   
            }

            self.pingTime = Date.now();
            self.send(pingPacket);

        }, 1000);
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
        if(packet.success) {
            this.removeView("charactercreation", true, function() {
                this.loadView("home", true);
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
                    self.viewLoader.loadView("charactercreation", true);
                    self.viewLoader.removeView("navbuttons");
                });
                
            } else {
                //this.viewLoader.removeView("home", true, this.connectedToServer());
            }
		} else {
			alert('login failed');
		}
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
		if (packet.success) {
			//this.viewLoader.removeView("register");
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