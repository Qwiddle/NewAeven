export class PlayerLoginAction {
	static login(client, data) {
		const packet = {
			'event': 'player_login',
			'id': data.id,
			'account': client.account
		};
	
		client.room.send(packet.event, packet);
	}
}