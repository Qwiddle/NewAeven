export class AuthAction {
	static async login(account, password) {
		const params = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ account: account, password: password })
		};

		const response = await fetch('/user/login', params);

		if(!response.ok) {
			//temporary alert, should be handled by ui
			alert(`HTTP error! status: ${response.status}`);
			return false;
		}

		const data = await response.json();
		
		return { players: data.output.players, account: data.output.account, seatReservation: data.output.seatReservation }
	}

	static async register(account, password, email) {
		const params = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ account: account, password: password, email: email })
		};

		const response = await fetch('/user/register', params);

		if(!response.ok) {
			//temporary alert, should be handled by ui
			alert(`HTTP error! status: ${response.status}`);
			return false;
		}

		const data = await response.json();
		
		if(!data.output.account) {
			return false;
		} else {
			return { account: data.output.account, seatReservation: data.output.seatReservation };
		}
	}

	static async connect(client, seatReservation) {
		try {
			const room = await client.consumeReservation(seatReservation);
			return room;
		} catch(error) {
			console.log('join error', error);
		}
	}
}