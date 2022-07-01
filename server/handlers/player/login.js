import { Player } from '../../../client/js/entity/player.mjs';
import { DatabaseManager } from '../../util/db/databaseManager.js';

export class PlayerLoginHandler {
	static async onLogin(packet, client, world) {

		const players = await DatabaseManager.getPlayers(packet.account);
		const select  = players[packet.id];

		const player = new Player();

		player.id = client.id;
		player.username = select.username;
		player.pos = select.pos;
		player.mapData = world.mapData[select.pos.map];
		player.sex = select.sex;
		player.race = select.race;
		player.hair = select.hair;
		player.equipment = select.equipment;
		player.stats = select.stats;

		const initPacket = {
			event: 'player_welcome',
			player: player,
			mapJson: world.mapJson[player.pos.map],
		};

		world.players[client.id] = player;

		client.send(initPacket.event, initPacket);
	}
}