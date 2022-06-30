import { ViewLoader } from "../../ui/viewLoader.mjs";

export class PlayerLoginAction {
	static async login(id, account, room) {
		const packet = {
			id: id,
			account: account
		}

		room.send("player_login", packet);
	}
}