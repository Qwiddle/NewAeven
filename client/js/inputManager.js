export default class InputManager {
	constructor(client) {
		this.keys = [];
		this.keyTimer = 0;
		this.keyDelay = 20; //ms between keypress events

		this.client = client;
		this.game = this.client.game;
	}

	addListeners() {
		addEventListener("keydown", (key) => {
			if (!this.keys[key.keyCode]) {
				this.keyTimer = Date.now() + this.keyDelay;
			}

			this.keys[key.keyCode] = true;
		});

		addEventListener("keyup", (key) => {
			if (this.keys[key.keyCode]) {
				this.keyTimer = Date.now() + this.keyDelay;
			}

			this.keys[key.keyCode] = false;
		});
	}
}