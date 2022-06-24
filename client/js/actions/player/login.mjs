export class PlayerLoginAction {
	static login(client, data) {
		const packet = {
			'event': 'playerLogin',
			'playerID': data.id
		};
	
		client.send(packet.event, packet);
	}
}