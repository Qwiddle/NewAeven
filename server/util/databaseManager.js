import { CreateController } from './db/createController.js';
import { GetController } from './db/getController.js';
import { SaveController } from './db/saveController.js';
export class DatabaseManager {
	createNewPlayer(formattedPlayerData, formattedStatsData, formattedEquipmentData, onSuccess) {
		SaveController.createNewPlayer(formattedPlayerData, formattedStatsData, formattedEquipmentData, onSuccess);
	}

	createAccount(accountData, passwordHash, ip) {
		const formattedAccountData = {
			account_name: accountData.username,
			password: passwordHash, 
			email: accountData.email, 
			ip: ip,
		}

		SaveController.saveAccountState(formattedAccountData);
	}

	getAccount(accountName, onSuccess, onFail) {
		GetController.getAccount(accountName, onSuccess, onFail);
	}

	getPlayer(username, onSuccess, onFail) {
		GetController.getPlayer(username, onSuccess, onFail);        
	}

	getPlayers(accountName, onSuccess, onFail) {
		GetController.getPlayers(accountName, onSuccess, onFail);
	}

	saveWorldState(world) {
		for (const key in world.players) {
			SaveController.savePlayerState(world.players[key]);
		}
	}
}