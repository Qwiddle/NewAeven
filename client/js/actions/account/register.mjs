export class AccountRegisterAction {
	static register(client, data) {
		const packet = {
			'event': 'account_register',
			'account': data.account,
			'password': data.password,
			'email': data.email,
		};

		client.room.send(packet.event, packet);
	}
}