import { Account } from "./models/account.js";
import { Player } from "./models/player.js";

export class GetController {
	static async getAccount(accountName, onSuccess, onFail) {
		const account = await Account.exists({ account: accountName }, (err, account) => {
			if (err) 
				onFail(err);
			else
				onSuccess(account);
		});
	}

	static async getPlayers(accountName, onSuccess, onFail) {
		const characters = await Player.find({ account: accountName }, (err, player) => {
			if (err) 
				onFail(err);
			else
				onSuccess(player);
		});
	}
	
	static async getPlayer(username, onSuccess, onFail) {
		const player = await Player.exists({ username: username }, (err, player) => {
			if (err) 
				onFail(err);
			else
				onSuccess(player);
		});
	}
	
	static async getStats(username, onSuccess, onFail) {
		const stats = await Player.find({ username: username }, (err, player) => {
			if (err) 
				onFail(err);
			else
				onSuccess(player.stats);
		});
	}

	static async getInventory(username, onSuccess, onFail) {
		const inventory = await Player.exists({ username: username }, (err, player) => {
			if (err) 
				onFail(err);
			else
				onSuccess(player.inventory);
		});
	}

	static async getEquipment(username, onSuccess, onFail) {
		const inventory = await Player.exists({ username: username }, (err, player) => {
			if (err) 
				onFail(err);
			else
				onSuccess(player.equipment);
		});
	}
}