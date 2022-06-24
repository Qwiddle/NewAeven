import { ViewLoader } from "./viewLoader.mjs";

export class UIHandler {
	constructor(game) {
		this.game = game;
		this.loadHandlers();
	}

	loadHandlers() {
		$('#views').on('click', '.login3d', (e) => {
			const playerID = parseInt(e.target.id);

			if(playerID <= 3) {
				this.game.playerLogin(playerID);
			}		
		});

		$('#views').on('click', '.create3d', (e) => {
			ViewLoader.removeView("characterselection", true, () => {
				ViewLoader.loadView("charactercreation", true);
			});
		});

		$('#views').on('click', '.arrow', (e) => {
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

			this.game.playerCreate(name, 0, skin, hair);
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
			ViewLoader.removeView(ViewLoader.currentView, true, () => {
				ViewLoader.showView(ViewLoader.previousView, true);
			});
		});

		$('#views').on('click', "#loginbutton", () => {
			const userInput = $("#username").val();
			const passInput = $("#password").val();

			if(userInput == "" || passInput == "") {
				ViewLoader.showView("checkinput", true);
			} else {
				const data = {
					account: userInput,
					password: passInput
				};

				this.game.accountLogin(data);
			}
		});

		$('#views').on('click', "#cancelbutton", () => {
			ViewLoader.removeView("registration", true, () => {
				ViewLoader.showView("home", true);
			});
		});

		$('#views').on('click', "#okbutton", () => {
			const userInput = $("#regusername").val();
			const passInput = $("#regpassword").val();
			const passconfirmInput = $("#regpasswordconfirm").val();
			const emailInput = $("#regemail").val();

			if(userInput == "" || passInput == "" || passconfirmInput == "" || emailInput == "") {
				ViewLoader.showView("checkinput", true);
			} else {
				const data = {
					account: userInput,
					password: passInput,
					email: emailInput
				};

				this.game.accountRegister(data);
			}
		});

		$('#views').on('click', "#createbutton", () => {
			ViewLoader.hideView("home", true, () => {
				ViewLoader.loadView("registration", true);
			});
		});


	}
}