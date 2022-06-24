import { ViewLoader } from "../../ui/viewLoader.mjs";

export class AccountLoginHandler {
	static onLogin(packet) {
		if (packet.success) {
			if(packet.players === 0) {
				ViewLoader.removeView("home", true, () => {
					ViewLoader.loadView("charactercreation", true);
				});
			} else {
				ViewLoader.removeView("home", true, () => {
					ViewLoader.loadView("characterselection", true, () => {
						if(packet.players.length >= 1 || packet.players >= 1) {
							$("#0").children(".create3d").removeClass("create3d").addClass("login3d");
							$("#0").children(".characterbox").append('<div class="playersprite">');
						} if(packet.players.length >= 2 || packet.players >= 2) {
							$("#1").children(".create3d").removeClass("create3d").addClass("login3d");
							$("#1").children(".characterbox").append('<div class="playersprite">');
						} if(packet.players.length >= 3 || packet.players == 3) {
							$("#2").children(".create3d").removeClass("create3d").addClass("login3d");
							$("#2").children(".characterbox").append('<div class="playersprite">');
						}
					});
				});
			}
		} else {
			alert('Login failed. Please check your account information and try again.');
		}
	}
}