export class PlayerCreateAction {
	static create(client, data) {
		const packet = {
			'event': 'playerCreate',
			'username': data.username,
			'sex': data.sex,
			'race': data.race,
			'hair': data.hair
		}
	
		client.send(packet.event, packet);
	}
}