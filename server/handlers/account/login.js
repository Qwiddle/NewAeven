import bcrypt from 'bcrypt';
import { DatabaseManager } from "../../util/databaseManager.js";

export class LoginHandler {
	static async isValidLoginAttempt(client, account, password) {
		const acc = await DatabaseManager.getAccount(account);

		if(acc !== null) {
			if (await this.comparePassword(password, acc.password)) {
				const players = await DatabaseManager.getPlayers(acc.account);

				if(players !== null) {
					const packet = {
						event: 'account_login',
						success: true,
						players: players,
					}

					client.send(packet.event, packet); 
					client.account = acc.account;

				} else { 
					const packet = {
						event: 'account_login',
						success: true,
						characters: 0,
					}

					client.send(packet.event, packet); 
				}
			} else {
				const packet = {
					event: 'account_login',
					success: false,
				}

				client.send(packet.event, packet); 
			}
		}
	}

	static onLogin(packet, client) {
		this.isValidLoginAttempt(client, packet.account, packet.password);
	}

	static comparePassword(password, hash) {
		return bcrypt.compare(password, hash);
	}
}