import { GetController } from './db/getController.js';
import { SaveController } from './db/saveController.js';
export class DatabaseManager {
	static async createAccount (data) {
		return await SaveController.createAccount(data);
	}

	static async createPlayer (data) {
		return await SaveController.createPlayer(data);
	}

	static async getAccount (accountName, onSuccess, onFail) {
		return await GetController.getAccount(accountName);
	}

	static async getPlayer (username, onSuccess, onFail) {
		return await GetController.getPlayer(username, onSuccess, onFail);        
	}

	static async getPlayers (accountName, onSuccess, onFail) {
		return await GetController.getPlayers(accountName, onSuccess, onFail);
	}

	static async saveWorldState (world) {
		for (const key in world.players) {
			SaveController.savePlayerState(world.players[key]);
		}
	}
}