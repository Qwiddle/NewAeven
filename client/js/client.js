import ViewLoader from './viewLoader.js';

export default class Client {
	constructor() {
		const self = this;
        this.viewLoader = new ViewLoader();

		this._socket = {};

        this.ip = {
            address: '127.0.0.1',
            port: '8443',
        }

		this.id = "";

		this.events = {
			'pong': (packet) => self.onPong(packet),
			'welcome': (packet) => self.connectedToServer(packet),
			'on_register': (packet) => self.onRegister(packet),
			'on_login': (packet) => self.onLogin(packet),
			//'on_create': (packet) => self.onCreate(packet),
			//'server_update': (packet) => self.game.serverUpdate(packet)
		};

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
        this.startPingPong();            
        this.id = packet.id;
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
        console.log()
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
		if (packet.success) {
            if(packet.characters == 0) {
                this.viewLoader.removeView("home", true);
                this.viewLoader.loadView("charactercreation", true);
            } else {
                //this.viewLoader.removeView("home", true, this.connectedToServer());
            }
		} else {
			alert('login failed');
		}

        console.log(packet);
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