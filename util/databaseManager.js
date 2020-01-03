const mysql = require("mysql");
require('dotenv').config();
const CreateController = require('./db/createController.js');
const SaveController = require('./db/saveController.js');
const GetController = require('./db/getController.js');

export default class DatabaseManager {
	constructor() {
        this.dbuser = "";
        this.dbpassword = "";

        this.dbconfig = {
            //leave blank if you are using environment variables
            user: process.env.DBUSER || this.dbuser,
            password: process.env.DBPASSWORD || this.dbpassword,
            host: "localhost",
            database: "new_aeven",
        };

		this.connect();
		CreateController.createTables(this.con);
	}

	connect() {
        this.con = mysql.createConnection(this.dbconfig);

		this.con.connect(function(err) {
			console.log("mysql connecting");

			if (err) {
                console.error(err);
                setTimeout(this.connect, 2000);

            } 
        });

        this.con.on('error', function(err) {
            console.error(err);

            if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                this.connect();
            } else {
                throw err;
            }

			console.log("mysql connected");
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