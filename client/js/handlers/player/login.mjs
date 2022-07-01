import { ViewLoader } from "../../ui/viewLoader.mjs";

export class PlayerLoginHandler {
	static onLogin(packet) {
		if(packet.success) {
			ViewLoader.removeView("characterselection", true);
		} else {
			alert('player login attempt unsuccessful. possible hacking attempt');
		}

		playerConnected(packet.player);
	}

	static onWelcome(packet, game) {
		ViewLoader.removeView(ViewLoader.currentView, true, () => {
			ViewLoader.loadView("hotkeys", true);

			ViewLoader.loadView("chat", true, () => {
				$("#chatinput").focus();
			});

			$('.servertext').hide();

			game.playerConnected(packet.player, packet.mapJson);
		});
	}
}