import bcrypt from "bcrypt";
import { matchMaker } from "colyseus";
import { DatabaseManager } from "./db/databaseManager.js";
import { Player } from "../../client/js/entity/player.mjs";
export class AuthManager {
	static async updateSession(update, sessionId) {
		update.pending_session_id = sessionId;
		update.pending_session_timestamp = Date.now();
		update.updated_at = Date.now();
		update.save();
	}

	static async disconnect(client) {
		let account = await DatabaseManager.getAccountBySession(client.id);

		account.active_session_id = "";
		account.pending_session_timestamp = "";
		account.updated_at = Date.now();
		await account.save();
	}

	static async register(req, res) {
		try {
			if(!req.body.email || !req.body.account || !req.body.password) {
				throw "Account name, email, or password missing.";
			}

			const acc = await DatabaseManager.getAccount(req.body.account);

			if(!acc) {
				const hash = await AuthManager.hashPassword(req.body.password);

				const data = {
					account: req.body.account,
					password: hash,
					email: req.body.email,
					ip: '127.0.0.1', //todo pass IP
				};

				let newAcc = await DatabaseManager.createAccount(data);
				const seatReservation = await matchMaker.joinOrCreate("main_room", 0);
				
				await AuthManager.updateSession(newAcc, seatReservation.sessionId);

				res.status(200).json({
					error: false,
					output: {
						seatReservation,
						account: newAcc.account
					}
				});

			} else {
				throw "Account name already exists.";
			}
		} catch(error) {
			res.status(400).json({
				error: true,
				output: error
			});
		}
	}

	static async login(req, res) {
		try {
			if(!req.body.account || !req.body.password) {
				throw "Account name or password missing.";
			}

			const acc = await DatabaseManager.getAccount(req.body.account);

			if(acc) {
				if(!acc.active_session_id) {
					if (await AuthManager.comparePassword(req.body.password, acc.password)) {					

						const seatReservation = await matchMaker.joinOrCreate("main_room", 0);
						const players = await DatabaseManager.getPlayers(acc.account);

						await AuthManager.updateSession(acc, seatReservation.sessionId);

						res.status(200).json({
							error: false,
							output: {
								seatReservation,
								players: players.length,
								account: req.body.account
							}
						});	
					} else {
						throw "Incorrect password.";
					}
				} else {
					throw "Already logged in";
				}
			} else {
				throw "Account does not exist.";
			}
		} catch(error) {
			console.log(error);
			res.status(400).json({
				error: true,
				output: error
			});
		}
	}

	static async playerCreate(req, res) {
		try {
			//check to see if account exists & has pending session
			const account = await DatabaseManager.getAccount(req.body.player.account);

			if(!account) {
				throw "Account does not exist.";
			}

			if(!account.pending_session_id) {
				throw "Request failed.";
			}

			if(await DatabaseManager.getPlayer(req.body.player.username)) {
				throw "Username already exists.";
			}
		
			const players = await DatabaseManager.getPlayers(req.body.player.account);

			if(players.length == 3) {
				throw "Max player count reached.";
			} 

			let player = await DatabaseManager.createPlayer(req.body.player);

			if(!player) {
				throw "Player not created.";
			}

			await AuthManager.updateSession(player, account.pending_session_id);

			res.status(200).json({
				error: false,
				output: {
					seatReservation: req.body.seatReservation,
					player: true,
					players: (players.length + 1)
				}
			});
		} catch(error) {
			res.status(400).json({
				error: true,
				output: error
			});
		}
	}

	static comparePassword(password, hash) {
		return bcrypt.compare(password, hash);
	}

	static hashPassword(password) {
		return bcrypt.hash(password, 10);
	}
}