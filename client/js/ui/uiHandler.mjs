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
				this.game.playerLogin({ id: playerID});
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
				ViewLoader.showView("home", true);
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

				this.game.accountLogin(data).then(res => {
					if(res) {
						this.game.seatReservation = res.seatReservation;
					
						if(res.player) {
							this.game.playerLogin(res).then(r => {
								if(r) {
									ViewLoader.removeView(ViewLoader.currentView, true, () => {
										ViewLoader.loadView("hotkeys", true);
							
										ViewLoader.loadView("chat", true, () => {
											$("#chatinput").focus();
										});
							
										$('.servertext').hide();
							
										//welcome player into the game
									});
								}
							});
						} else if(res.account) {
							this.game.account = res.account;
							console.log('hi');
							ViewLoader.removeView(ViewLoader.currentView, true, () => {
								ViewLoader.loadView("charactercreation", true);
							});
						} else {
							console.log('failed');
						}
					}
				});
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
					this.game.playerLogin(res).then(r => {
						if(r) {
							ViewLoader.removeView(ViewLoader.currentView, true, () => {
								ViewLoader.loadView("hotkeys", true);
					
								ViewLoader.loadView("chat", true, () => {
									$("#chatinput").focus();
								});
					
								$('.servertext').hide();
					
								//welcome player into the game
							});
						}
					});
				} else {
					alert('failed');
				}
			});
		});

		$('#views').on('click', "#createbutton", () => {
			ViewLoader.hideView("home", true, () => {
				ViewLoader.loadView("registration", true);
			});
		});


	}
}