import { ViewLoader } from "./viewLoader.mjs";
import { global } from "../global.mjs";

export class UIHandler {
	constructor(game) {
		this.game = game;
		this.loadHandlers();
	}

	loadHandlers() {
		$('#views').on('click', '.login3d', (e) => {
			const playerID = parseInt(e.target.id);

			if(playerID <= 3) {
				this.game.playerLogin({ id: playerID });
			}		
		});

		$('#views').on('click', '.create3d', (e) => {
			console.log(ViewLoader.currentView);
			ViewLoader.hideView(ViewLoader.currentView, false, () => {
				ViewLoader.loadView("charactercreation");
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

		$('#views').on('click', '.cancel_button', () => {
			ViewLoader.hideView(ViewLoader.currentView, false, () => {
				ViewLoader.loadView(ViewLoader.previousView, false);
			});
		});

		$('#views').on('click', "#loginbutton", () => {
			const userInput = $("#username").val();
			const passInput = $("#password").val();

			if(userInput == "" || passInput == "") {
				ViewLoader.showView("checkinput", false);
			} else {
				const data = {
					account: userInput,
					password: passInput
				};

				this.game.accountLogin(data).then(res => {
					if(res) {
						this.game.account = res.account;
						
						this.game.connect(res.seatReservation).then(room => {
							this.game.room = room;

							ViewLoader.removeView(ViewLoader.currentView);
							this.loadPlayers(res);
						})
					}
				});
			}
		});

		$('#views').on('click', "#cancelbutton", () => {
			ViewLoader.hideView(ViewLoader.currentView, false, () => {
				ViewLoader.showView(ViewLoader.previousView, false);
			});
		});

		$('#views').on('click', "#okbutton", () => {
			const userInput = $("#regusername").val();
			const passInput = $("#regpassword").val();
			const passconfirmInput = $("#regpasswordconfirm").val();
			const emailInput = $("#regemail").val();

			if(userInput == "" || passInput == "" || passconfirmInput == "" || emailInput == "") {
				ViewLoader.showView("checkinput", false);
			} else {
				const data = {
					account: userInput,
					password: passInput,
					email: emailInput
				};

				this.game.accountRegister(data).then(res => {
					if(res) {
						ViewLoader.removeView("registration");
						ViewLoader.showView("home");
	
						this.game.account = data.account;
						this.game.seatReservation = data.seatReservation;
					} else {
						alert('failed');
					}
				});
			}
		});

		$('#views').on('click', '#charactercreation .ok_button', () => {
			const username = $('#name').val();
			const skin = parseInt($('#skinnum')[0].innerHTML);

			const hair = {
				style: parseInt($('#hairnum')[0].innerHTML),
				color: parseInt($('#colornum')[0].innerHTML)
			}

			console.log(this.game.seatReservation);

			const data = {
				seatReservation: this.game.seatReservation,
				player: {
					account: this.game.account,
					username: username,
					sex: 0,
					race: skin,
					hair: hair,
					pos: global.defaultPosition,
					dir: global.defaultDir
				}
			}

			this.game.playerCreate(data).then(res => {
				if(res) {
					ViewLoader.removeView(ViewLoader.currentView);
					this.loadPlayers(res);
				} else {
					alert('failed');
				}
			});
		});

		$('#views').on('click', "#createbutton", () => {
			ViewLoader.hideView("home", false, () => {
				ViewLoader.loadView("registration", false);
			});
		});
	}

	loadPlayers(res) {
		ViewLoader.loadView("characterselection", false, () => {
			if(res.players >= 1) {
				console.log($("#0"));
				$("#0").children(".create3d").removeClass("create3d").addClass("login3d");
				$("#0").children(".characterbox").append('<div class="playersprite">');
			} if(res.players >= 2) {
				$("#1").children(".create3d").removeClass("create3d").addClass("login3d");
				$("#1").children(".characterbox").append('<div class="playersprite">');
			} if(res.players >= 3) {
				$("#2").children(".create3d").removeClass("create3d").addClass("login3d");
				$("#2").children(".characterbox").append('<div class="playersprite">');
			}
		});
	}
}