import { Account } from "./models/account.js";
import { Player } from "./models/player.js";
import { GetController } from "./getController.js";

export class SaveController {
	static async savePlayerState(data) {
		let player = GetController.getPlayer(data.username);

		player.username = data.username;
		player.sex = data.sex;
		player.race = data.race;
		player.hairColor = data.hair.color;
		player.hairStyle = data.hair.style;
		player.map = data.map;
		player.x = data.pos.x;
		player.y = data.pos.y;
		player.dir = data.dir;
		player.stats = data.stats;
		player.inventory = data.inventory;
		player.equipment = data.equipment;

		await player.save();
	}

	static createPlayer(data) {
		return Player.create({
			account: data.account,
			username: data.username,
			admin: data.admin,
			sex: data.sex,
			race: data.race,
			hair: data.hair,
			pos: data.pos,
			dir: data.dir
		});
	}

	static createAccount(data) {
		return Account.create({
			account: data.account,
			password: data.password,
			email: data.email,
			ip: data.ip
		});
	}
}