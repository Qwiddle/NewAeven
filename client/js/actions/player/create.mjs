import { ViewLoader } from "../../ui/viewLoader.mjs";
import { global } from "../../global.mjs";
export class PlayerCreateAction {
	static async create(playerData, reservation) {
		const params = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ player: playerData, reservation: reservation })
		};

		const response = await fetch('/user/create', params);

		if(!response.ok) {
			//temporary alert, should be handled by ui
			alert(`HTTP error! status: ${response.status}`);
			return false;
		}

		const data = await response.json();
		console.log(data);

		if(!data.output.player) {
			//temporary alert, should be handled by ui
			alert(`HTTP error! status: ${response.status}`);
			return false;
		} else {
			return { player: data.output.player, players: data.output.players, seatReservation: reservation };
		}
	}
}