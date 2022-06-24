export class AccountLoginAction {
	static login(client, data) {
		const packet = {
			'event': 'login',
			'account': data.account,
			'password': data.password,
		};

		client.send(packet.event, packet);
	}
}