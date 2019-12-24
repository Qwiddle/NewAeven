const mysql = require("mysql");
const CreateController = require('./db/createController.js');
const SaveController = require('./db/saveController.js');
const GetController = require('./db/getController.js');


class DatabaseManager {
	constructor() {
		this.con = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "passy101",
			database: "new_aeven",
		});

		this.connect();
		CreateController.createTables(this.con);
	}

	connect() {
		this.con.connect(function(err) {
			console.log("mysql:: connecting");
			if (err) throw err;
			console.log("mysqL:: connected");
		});
	}

	createAccount(accountData, passwordHash, ip) {
        const formattedAccountData = {
            account_name: accountData.username,
            password: passwordHash, 
            email: accountData.email, 
            ip: ip,
        }

        SaveController.saveAccountState(this.con, formattedAccountData);
    }

    getPlayerData(player, loadNewPlayer, createNewPlayer) {
        GetController.getPlayer(this.con, player, loadNewPlayer, createNewPlayer);
    }

    getAllPlayerData(player, loadPlayer) {
        GetController.getAllPlayerData(this.con, player, loadPlayer);
    }

	isUsernameAvailable(username, createAccount, registrationFailed) {
        GetController.getAccount(this.con, username, registrationFailed, createAccount);
    }

    getAccount(username, onSuccess, onFailure) {
        GetController.getAccount(this.con, username, onSuccess, onFailure);
    }

    getPlayer(username, onSuccess, onFailure) {
        GetController.getPlayer(this.con, username, onSuccess, onFailure);        
    }

    createNewPlayer(formattedPlayerData, formattedStatsData, formattedEquipmentData, onSuccess) {
        SaveController.createNewPlayer(this.con, formattedPlayerData, formattedStatsData, formattedEquipmentData, onSuccess);
    }

    getCharacters(accountName, onCharactersExist, onNoCharacters) {
        GetController.getCharacters(this.con, accountName, onCharactersExist, onNoCharacters);
    }

    saveWorldState(world) {
        for (const key in world.players) {
            SaveController.savePlayerState(this.con, world.players[key]);
        }
        
        /*for (const key in world.inventories) {
            SaveController.saveInventoryState(this.con, world.players[key], world.inventories[key]);
        }*/
    }
}

module.exports = DatabaseManager;