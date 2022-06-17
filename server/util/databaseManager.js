import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2';

import { CreateController } from './db/createController.js';
import { GetController } from './db/getController.js';
import { SaveController } from './db/saveController.js';
export default class DatabaseManager {
	constructor() {
		this.dbconfig = {
			//leave blank if you are using environment variables
			user: process.env.DBUSER || '',
			password: process.env.DBPASSWORD || '',
			host: process.env.DBHOST || 'localhost',
      port: process.env.DBPORT || 3306,
			database: process.env.DB || "new_aeven"
		};

		this.connect();
		CreateController.createTables(this.con);
	}

	connect() {
		this.con = mysql.createConnection(this.dbconfig);

		this.con.connect((err) => {
			if (err) {
				console.error(err);
				setTimeout(this.connect, 2000);
			} else {
				console.log("mysql connected to " + this.dbconfig.database);
			}
		});

		this.con.on('error', (err) => {
			if(err.code === 'PROTOCOL_CONNECTION_LOST') {
				this.connect();
			} else {
				throw err;
			}
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
	}
}