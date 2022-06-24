import { Account } from "./models/account.js";
import { Player } from "./models/player.js";

export class GetController {
	static getAccount(accountName) {
		return Account.findOne({ account: accountName });
	}

	static getPlayers(accountName) {
		return Player.find({ account: accountName });
	}
	
	static getPlayer(username) {
		return Player.findOne({ username: username });
	}
	
	static getStats(username) {
		return Player.find({ username: username });
	}

	static getInventory(username) {
		return Player.exists({ username: username });
	}

	static getEquipment(username) {
		return Player.exists({ username: username });
	}
}