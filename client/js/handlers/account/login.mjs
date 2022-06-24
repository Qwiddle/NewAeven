import { ViewLoader } from "../../ui/viewLoader.mjs";

export class AccountLoginHandler {
	onLogin(packet) {
		if (packet.success) {
			if(packet.characters == 0) {
				ViewLoader.removeView("home", true, () => {
					ViewLoader.loadView("charactercreation", true);
				});
			} else {
				ViewLoader.removeView("home", true, () => {
					ViewLoader.loadView("characterselection", true, () => {
						if(packet.characters.length >= 1 || packet.characters >= 1) {
							$("#0").children(".create3d").removeClass("create3d").addClass("login3d");
							$("#0").children(".characterbox").append('<div class="playersprite">');
						} if(packet.characters.length >= 2 || packet.characters >= 2) {
							$("#1").children(".create3d").removeClass("create3d").addClass("login3d");
							$("#1").children(".characterbox").append('<div class="playersprite">');
						} if(packet.characters.length >= 3 || packet.characters == 3) {
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