import "dotenv/config.js";
import mongoose from "mongoose";
import { GetController } from './getController.js';
import { SaveController } from './saveController.js';

export class DatabaseManager {
	static async connect() {
		console.log('hi');
		return mongoose.connect(`mongodb://${process.env.DBHOST || '127.0.0.1'}/${process.env.DB || 'new_aeven'}`);
	}
	
	static async createAccount (data) {
		return await SaveController.createAccount(data);
	}

	static async createPlayer (data) {
		return await SaveController.createPlayer(data);
	}

	static async getAccount (account) {
		return await GetController.getAccount(account);
	}

	static async getAccountBySession (session) {
		return await GetController.getAccountBySession(session);
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