export class InputManager {
	constructor() {
		this.keys = [];
		this.keyTimer = 0;
		this.keyDelay = 20;
	}

	addListeners() {
		addEventListener("keydown", (key) => {
			if (!this.keys[key.keyCode]) {
				if(key.keyCode == 37 || key.keyCode == 38 || key.keyCode == 39 || key.keyCode == 40 || key.keyCode == 17) {
					this.keyTimer = Date.now() + this.keyDelay;
					this.keys[key.keyCode] = true;
				}
			}
		});

		addEventListener("keyup", (key) => {
			if (this.keys[key.keyCode]) {
				if(key.keyCode == 37 || key.keyCode == 38 || key.keyCode == 39 || key.keyCode == 40 || key.keyCode == 17) {
					this.keyTimer = Date.now() + this.keyDelay;
					this.keys[key.keyCode] = false;
				}
			}
		});
	}
}