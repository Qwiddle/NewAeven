import { Account } from "./models/account.js";
import { Player } from "./models/player.js";
import { GetController } from "./getController.js";

export class SaveController {
	static async savePlayerState(player) {
		const playerData = this._getFormattedPlayerData(player);
		const playerStats = this._getFormattedPlayerStats(player);
		const playerEquipment = this._getFormattedEquipmentData(player);

		GetController.getPlayer(player.username, onSuccess, onFail);

		const onSuccess = async (result) => {
			result.username = player.username;
			result.sex = player.sex;
			result.race = player.race;
			result.hairColor = player.hair.color;
			result.hairStyle = player.hair.style;
			result.map = player.map;
			result.x = player.pos.x;
			result.y = player.pos.y;
			result.dir = player.dir;
			result.stats = player.stats;
			result.inventory = player.inventory;
			result.equipment = player.equipment;

			await result.save();
		}

		const onFail = (err) => { 
			console.log(err);
		}
	}

	static async createNewPlayer(data, onSuccess, onFail) {
		await Player.create({
			account: data.account,
			username: data.username,
			admin: data.admin,
			sex: data.sex,
			race: data.race,
			hairColor: data.hairColor,
			hairStyle: data.hairStyle,
			dir: data.dir,
			map: data.map,
			x: data.x,
			y: data.y,
		}, (err, player) => {
			if (err)
				onFail(err);
			else
				onSuccess(player);
		});
	}

	static async createNewAccount(data, onSuccess, onFail) {
		await Account.create({
			account: data.account,
			email: data.email,
			ip: data.ip
		}, (err, account) => {
			if (err)
				onFail(err);
			else
				onSuccess(account);
		});
	}
}