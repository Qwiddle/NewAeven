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
		}

		const data = await response.json();
	}
}