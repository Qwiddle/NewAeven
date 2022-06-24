import { ViewLoader } from "../../ui/viewLoader.mjs";

export class PlayerCreateHandler {
	onCreate(packet) {
		if(packet.success) {
			ViewLoader.removeView("charactercreation", true, () => {
				ViewLoader.loadView("home", false);
			});
		}
	}
}