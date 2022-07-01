import { DatabaseManager } from "../../util/db/databaseManager.js";
import { global } from "../../../client/js/global.mjs";

export class PlayerCreateHandler {
	static async onCreate(packet, client) {
		const players = await DatabaseManager.getPlayers(acc.account);

		if(players.length >= 3) {
			packet.username = packet.username.charAt(0).toUpperCase() + packet.username.slice(1);

			const data = {
				account: packet.account,
				username: packet.username,
				sex: packet.sex, 
				race: packet.race,
				hair: packet.hair,
				pos: global.defaultPosition,
				dir: global.defaultDir
			}
	
			const exist = await DatabaseManager.getPlayer(packet.username);
	
			if(exist === null) {
				const player = await DatabaseManager.createPlayer(data);
	
				const packet = {
					event: 'player_create',
					success: true,
					player: player,
					players: players.length
				};
	
				client.send(packet.event, packet);
			}
		} else {
			const packet = {
				event: 'player_create',
				success: false,
			}

			client.send(packet.event, packet);
		}
	}
}