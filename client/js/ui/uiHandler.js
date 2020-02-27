export default class UIHandler {
	constructor(game) {
		this.game = game;
		this.client = game.client;
		this.viewLoader = this.client.viewLoader;
		this.loadHandlers();
	}

	loadHandlers() {
		$('#views').on('click', '.login3d', (e) => {
			const playerID = parseInt(e.target.id);
			this.client.playerLogin(playerID);
		});

		$('#views').on('click', '.create3d', (e) => {
			this.viewLoader.removeView("characterselection", true, () => {
				this.viewLoader.loadView("charactercreation", true);
			});
		});

		$('#views').on('click', '.arrow', (e) => {
			console.log('hi');
			let id = $(e.target).data('id');
			let value = $('#' + id)[0].innerHTML;
			let newValue = parseInt(value);

			if($(e.target).hasClass('right')) {
				newValue++;

				$('#' + id)[0].innerHTML = newValue;
			} else if($(e.target).hasClass('left')) {
				if(value > 0) {
					newValue--;
					$('#' + id)[0].innerHTML = newValue;
				}
			}
		});

		$('#views').on('click', '#charactercreation .ok_button', () => {
			const name = $('#name').val();

			const hair = {
				style: parseInt($('#hairnum')[0].innerHTML),
				color: parseInt($('#colornum')[0].innerHTML)
			}

			const skin = parseInt($('#skinnum')[0].innerHTML);

			this.client.playerCreate(name, 0, skin, hair);
		});

		$('#views').on('keydown', '#chatinput', (e) => {
			if(e.keyCode == 13) {
				//$("#chatinput").blur();
			}
		})

		$(document).on('keydown', (e) => {
			if (e.keyCode == 13) {
				if($("#chatinput").val() != "") {
					let message = $("#chatinput").val();
					this.game.sendMessage(message);
				} else {
					$("#chatinput").blur();
					this.game.chatManager.chatActive = false;
				}

				if(this.game.chatManager.chatActive == true) {
					$("#chatinput").blur();
					this.game.chatManager.chatActive = false;
				} else {
					$("#chatinput").focus();
					
					this.game.chatManager.chatActive = true;
				}
			}

		});

		$('#views').on('click', '#charactercreation .cancel_button', () => {
			this.viewLoader.removeView(this.viewLoader.currentView, true, () => {
				this.viewLoader.showView(this.viewLoader.previousView, true);
			});
		});

		$('#views').on('click', "#loginbutton", () => {
			const userInput = $("#username").val();
			const passInput = $("#password").val();

			if(userInput == "" || passInput == "") {
				this.viewLoader.showView("checkinput", true);
			} else {
				this.client.login(userInput, passInput);
			}
		});

		$('#views').on('click', "#cancelbutton", () => {
			this.viewLoader.removeView("registration", true, () => {
				this.viewLoader.showView("home", true);
			});
		});

		$('#views').on('click', "#okbutton", () => {
			const userInput = $("#regusername").val();
			const passInput = $("#regpassword").val();
			const passconfirmInput = $("#regpasswordconfirm").val();
			const emailInput = $("#regemail").val();

			if(userInput == "" || passInput == "" || passconfirmInput == "" || emailInput == "") {
				this.viewLoader.showView("checkinput", true);
			} else {
				this.client.register(userInput, passInput, passconfirmInput, emailInput);
			}
		});

		$('#views').on('click', "#createbutton", () => {
			this.viewLoader.hideView("home", true, () => {
				this.viewLoader.loadView("registration", true);
			});
		});


	}
}