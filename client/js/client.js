export default class Client {
	constructor() {
		const self = this;
		this.latency = 0;

		this._socket = {};
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
	}

	connect() {
		const self = this;
		this._socket = new WebSocket('ws://127.0.0.1:8443');     

        this._socket.onopen = (event) => {
            console.log("ws:: client connected");
            this._socket.send('hi');
        }   

        this._socket.onmessage = function (packet) { 
            const data = JSON.parse(packet.data);
            if (self.events.hasOwnProperty(data.event)) {
            	self.events[data.event](data);
            }
            //console.log(data);
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
        //this.game.clientConnected(packet);
        //this.phaser.state.start(client.MAIN_STATE, true, false, packet.mapJson);
    }

    startPingPong() {
        const self = this;
        setInterval(function() {
            const pingPacket = {
                'event':'PING',   
            }
            self.pingTime = Date.now();
            self._socket.send(JSON.stringify(pingPacket));
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
			alert('login succeed');
		} else {
			alert('login failed');
		}

		console.error(packet);
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
			alert("registration successful.");
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