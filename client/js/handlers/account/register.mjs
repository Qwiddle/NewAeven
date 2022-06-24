import { ViewLoader } from "../../ui/viewLoader.mjs";

export class AccountRegisterHandler {
	onRegister(packet) {
		if (packet.success) {
			ViewLoader.removeView("registration", true, () => {
				ViewLoader.showView("home", true);
			});
		} else {
			alert("registration unsuccessful.");
		}
	}
}