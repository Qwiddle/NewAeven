export class AccountRegisterAction {
	static register(client, data) {
		const packet = {
			'event': 'register',
			'account': data.account,
			'password': data.password,
			'email': data.email,
		};

		client.send(packet.event, packet);
	}
}