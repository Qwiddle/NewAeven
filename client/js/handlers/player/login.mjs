import { ViewLoader } from "../../ui/viewLoader.mjs";

export class PlayerLoginHandler {
	onLogin(packet) {
		if(packet.success) {
			ViewLoader.removeView("characterselection", true);
		} else {
			alert('player login attempt unsuccessful. possible hacking attempt');
		}
	}

	onWelcome(packet) {
		ViewLoader.removeView(ViewLoader.currentView, true, () => {
			ViewLoader.loadView("hotkeys", true);

			ViewLoader.loadView("chat", true, () => {
				$("#chatinput").focus();
			});

			$('.servertext').hide();

			//welcome player into the game
		});
	}
}