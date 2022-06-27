import bcrypt from "bcrypt";
import { matchMaker } from "colyseus";
import { DatabaseManager } from "./databaseManager.js";
import { Player } from "../../client/js/entity/player.mjs";
export class AuthManager {
	static async updateSession(update, sessionId) {
		update.pending_session_id = sessionId;
		update.pending_session_timestamp = Date.now();
		update.updated_at = Date.now();
		update.save();
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
				if (await AuthManager.comparePassword(req.body.password, acc.password)) {					

					const seatReservation = await matchMaker.joinOrCreate("main_room", 0);
					const players = await DatabaseManager.getPlayers(acc.account);

					await AuthManager.updateSession(acc, seatReservation.sessionId);

					if(players.length === 0) {
						res.status(200).json({
							error: false,
							output: {
								seatReservation,
								account: acc.account
							}
						});
					} else {
						let player = players[0];
						const newPlayer = new Player();

						await AuthManager.updateSession(player, seatReservation.sessionId);

						newPlayer.id = seatReservation.sessionId;
						newPlayer.username = player.username;
						newPlayer.admin = player.admin;
						newPlayer.pos = player.pos;
						newPlayer.dir = player.dir;
						/*todo: need to refactor WorldManager first.
						newPlayer.mapData = this.worldManager.mapData[player.pos.map];*/
						newPlayer.sex = player.sex;
						newPlayer.race = player.race;
						newPlayer.hair = player.hair;
						newPlayer.equipment = player.equipment;
						newPlayer.stats = player.stats;

						console.log(newPlayer);

						res.status(200).json({
							error: false,
							output: {
								seatReservation,
								player: newPlayer
							}
						});
					}	
				} else {
					throw "Incorrect password.";
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

			let player = await DatabaseManager.createPlayer(req.body.player);

			if(!player) {
				throw "Player not created.";
			}

			await AuthManager.updateSession(player, account.pending_session_id);

			const newPlayer = new Player();

			newPlayer.id = player.pending_session_id;
			newPlayer.username = player.username;
			newPlayer.admin = player.admin;
			newPlayer.pos = player.pos;
			newPlayer.dir = player.dir;
			newPlayer.sex = player.sex;
			newPlayer.race = player.race;
			newPlayer.hair = player.hair;
			newPlayer.equipment = player.equipment;
			newPlayer.stats = player.stats;

			res.status(200).json({
				error: false,
				output: {
					seatReservation: req.body.seatReservation,
					player: newPlayer
				}
			});
		} catch(error) {
			res.status(400).json({
				error: true,
				output: error
			});
		}
	}

	static async playerLogin(req, res) {
		try {
			const player = req.body.player;
			const reservation = req.body.seatReservation;


		} catch(error) {

		}
	}

	static comparePassword(password, hash) {
		return bcrypt.compare(password, hash);
	}

	static hashPassword(password) {
		return bcrypt.hash(password, 10);
	}
}