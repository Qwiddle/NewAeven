import bcrypt from 'bcrypt';
import { DatabaseManager } from "../../util/databaseManager.js";

export class RegisterHandler {
	static onRegister(packet, client) {
		this.register(packet, client);
	}

	static async register(packet, client) {
		const hash = await this.hashPassword(packet.password);

		const data = {
			account: packet.account,
			password: hash,
			email: packet.email,
			ip: '127.0.0.1', //todo pass IP
		};

		await DatabaseManager.createAccount(data);

		const registerPacket = {
			event: 'account_register',
			success: true,
		};

		client.send(registerPacket.event, registerPacket);
	}

	static hashPassword(password) {
		return bcrypt.hash(password, 10);
	}
}