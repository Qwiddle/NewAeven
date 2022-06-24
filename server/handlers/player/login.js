import { Player } from '../../../client/js/entity/player.mjs';
import { DatabaseManager } from '../../util/databaseManager.js';

export class PlayerLoginHandler {
	static async onLogin(packet, client) {

		const players = await DatabaseManager.getPlayers(packet.account);
		const select  = players[packet.id];

		const player = new Player();

		player.id = client.id;
		player.username = select.username;
		player.pos = select.pos;
		/*todo: need to refactor WorldManager first.
		player.mapData = this.worldManager.mapData[select.pos.map];*/
		player.sex = select.sex;
		player.race = select.race;
		player.hair = select.hair;
		player.equipment = select.equipment;
		player.stats = select.stats;

		const initPacket = {
			event: 'player_welcome',
			player: player,
			/*todo: need to refactor WorldManager first.
			mapJson: this.worldManager.mapJson[player.pos.map],*/
		};

		//this.worldManager.players[client.id] = player;

		client.send(initPacket.event, initPacket);
	}
}