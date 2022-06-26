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
		
		if(!data.output.player) {
			return data.output.player;
		} else {
			return data.output.account;
		}
	}

	static async register(account, password, email) {
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
		
		if(!data.output.player) {
			return data.output.player;
		} else {
			return data.output.account;
		}
	}
}