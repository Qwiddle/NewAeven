import { GetController } from './db/getController.js';
import { SaveController } from './db/saveController.js';

export class DatabaseManager {
	static async createAccount (data) {
		return await SaveController.createAccount(data);
	}

	static async createPlayer (data) {
		return await SaveController.createPlayer(data);
	}

	static async getAccount (account) {
		return await GetController.getAccount(account);
	}

	static async getPlayer (username) {
		return await GetController.getPlayer(username);        
	}

	static async getPlayers (account) {
		return await GetController.getPlayers(account);
	}

	static async saveWorldState (world) {
		for (const key in world.players) {
			SaveController.savePlayerState(world.players[key]);
		}
	}
}