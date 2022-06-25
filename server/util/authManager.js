import bcrypt from "bcrypt";
import { matchMaker } from "colyseus";
import { DatabaseManager } from "./databaseManager.js";

export class AuthManager {
	static async updateSession(update, sessionId) {
		update.pending_session_id = sessionId;
		update.pending_session_timestamp = Date.now();
		update.updated_at = Date.now();
		await update.save();
	}

	static async register(req, res) {
		try {
			if(!req.body.email || !req.body.account || !req.body.password) {
				throw "Account name, email, or password missing.";
			}

			const acc = await DatabaseManager.getAccount(account);

			if(!acc) {
				const hash = await this.hashPassword(req.body.password);

				const data = {
					account: req.body.account,
					password: hash,
					email: req.body.email,
					ip: '127.0.0.1', //todo pass IP
				};

				let newAcc = await DatabaseManager.createAccount(data);
				const seatReservation = await matchMaker.joinOrCreate("main_room", 0);
				
				this.updateSession(newAcc, seatReservation.sessionId);

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

			const acc = await DatabaseManager.getAccount(account);

			if(acc !== null) {
				if (await this.comparePassword(req.body.password, acc.password)) {					
					//todo: check if user has attempted to sign in recently, block spam

					const seatReservation = await matchMaker.matchMakeToRoom("lobby_room", 0);
					const players = await DatabaseManager.getPlayers(acc.account);

					this.updateSession(acc);

					if(!players) {
						res.status(200).json({
							error: false,
							output: {
								seatReservation,
								account: acc.account
							}
						});
					} else {
						let player = players[0];
						this.updateSession(player);

						res.status(200).json({
							error: false,
							output: {
								seatReservation,
								player: player
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
			res.status(400).json({
				error: true,
				output: error
			});
		}
	}

	static async playerLogin(acc) {
	//todo
	}

	static comparePassword(password, hash) {
		return bcrypt.compare(password, hash);
	}

	static hashPassword(password) {
		return bcrypt.hash(password, 10);
	}
}