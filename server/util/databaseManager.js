import { CreateController } from './db/createController.js';
import { GetController } from './db/getController.js';
import { SaveController } from './db/saveController.js';
export class DatabaseManager {
	createAccount(accountData, passwordHash, ip) {
		const formattedAccountData = {
			account_name: accountData.username,
			password: passwordHash, 
			email: accountData.email, 
			ip: ip,
		}

		SaveController.saveAccountState(formattedAccountData);
	}

	getPlayerData(player, loadNewPlayer, createNewPlayer) {
		GetController.getPlayer(player, loadNewPlayer, createNewPlayer);
	}

	getAllPlayerData(player, loadPlayer) {
		GetController.getAllPlayerData(player, loadPlayer);
	}

	isUsernameAvailable(username, createAccount, registrationFailed) {
		GetController.getAccount(username, registrationFailed, createAccount);
	}

	getAccount(username, onSuccess, onFailure) {
		GetController.getAccount(username, onSuccess, onFailure);
	}

	getPlayer(username, onSuccess, onFailure) {
		GetController.getPlayer(username, onSuccess, onFailure);        
	}

	createNewPlayer(formattedPlayerData, formattedStatsData, formattedEquipmentData, onSuccess) {
		SaveController.createNewPlayer(formattedPlayerData, formattedStatsData, formattedEquipmentData, onSuccess);
	}

	getCharacters(accountName, onCharactersExist, onNoCharacters) {
		GetController.getCharacters(accountName, onCharactersExist, onNoCharacters);
	}

	saveWorldState(world) {
		for (const key in world.players) {
			SaveController.savePlayerState(world.players[key]);
		}
	}
}