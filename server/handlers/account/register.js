import bcrypt from 'bcrypt';
import { DatabaseManager } from "../../util/databaseManager.js";

export class RegisterHandler {
	static onRegister(packet, client) {
		console.log(packet);
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

		const account = await DatabaseManager.createAccount(data);

		console.log(account);

		const registerPacket = {
			event: 'register',
			success: true,
		};

		client.send(registerPacket.event, registerPacket);
	}

	static hashPassword(password) {
		return bcrypt.hash(password, 10);
	}
}