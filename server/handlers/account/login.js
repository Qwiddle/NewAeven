import bcrypt from 'bcrypt';
import { DatabaseManager } from "../../util/databaseManager.js";

export class LoginHandler {
	static async isValidLoginAttempt(client, account, password) {
		const acc = await DatabaseManager.getAccount(account);

		console.log(acc);

		if(acc !== null) {

			if (await this.comparePassword(password, acc.password)) {
				const characters = await DatabaseManager.getPlayers(acc.account);

				if(characters !== null) {
					const packet = {
						event: 'login',
						success: true,
						characters: characters,
					}

					client.send(packet.event, packet); 
					client.account = acc.account;

				} else { 
					const packet = {
						event: 'login',
						success: true,
						characters: 0,
					}

					client.send(packet.event, packet); 
				}
			} else {
				const packet = {
					event: 'login',
					success: false,
				}

				client.send(packet.event, packet); 
			}
		}
	}

	static onLogin(packet, client) {
		console.log(packet);
		this.isValidLoginAttempt(client, packet.account, packet.password);
	}

	static comparePassword(password, hash) {
		return bcrypt.compare(password, hash);
	}
}