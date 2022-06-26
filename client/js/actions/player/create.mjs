import { ViewLoader } from "../../ui/viewLoader.mjs";
import { global } from "../../global.mjs";
export class PlayerCreateAction {
	static init(account, reservation) {
		ViewLoader.removeView("home", true, () => {
			ViewLoader.loadView("charactercreation", true);
		});

		$('#views').on('click', '#charactercreation .ok_button', () => {
			const username = $('#name').val();
			const skin = parseInt($('#skinnum')[0].innerHTML);

			const hair = {
				style: parseInt($('#hairnum')[0].innerHTML),
				color: parseInt($('#colornum')[0].innerHTML)
			}

			const data = {
				account: account,
				username: username,
				sex: 0,
				race: skin,
				hair: hair,
				pos: global.defaultPosition,
				dir: global.defaultDir
			}

			PlayerCreateAction.create(data, reservation);
		});
	}

	static async create(playerData, reservation) {
		const params = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({player: playerData, reservation: reservation})
		};

		const response = await fetch('/user/create', params);

		if(!response.ok) {
			//temporary alert, should be handled by ui
			alert(`HTTP error! status: ${response.status}`);
			return false;
		}

		const data = await response.json();

		if(!data.output.player) {
			//temporary alert, should be handled by ui
			alert(`HTTP error! status: ${response.status}`);
			return false;
		} else {
			return {player: data.output.player, seatReservation: reservation};
		}
	}
}