import { ViewLoader } from "../../ui/viewLoader.mjs";

export class PlayerLoginAction {
	static async login(player, client, seatReservation) {
		try {
			const room = await client.consumeReservation(seatReservation);
			player.room = room;

			console.log(player);

			return { player: player };
		} catch(error) {
			console.log('join error', error);
		}
	}
}