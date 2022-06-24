export class AccountLoginAction {
	static login(client, data) {
		const packet = {
			'event': 'account_login',
			'account': data.account,
			'password': data.password,
		};

		client.account = packet.account;

		client.room.send(packet.event, packet);
	}
}