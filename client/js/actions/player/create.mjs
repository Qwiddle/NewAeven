export class PlayerCreateAction {
	static create(client, data) {
		const packet = {
			'event': 'player_create',
			'account': data.account,
			'username': data.username,
			'sex': data.sex,
			'race': data.race,
			'hair': data.hair
		}
	
		client.room.send(packet.event, packet);
	}
}