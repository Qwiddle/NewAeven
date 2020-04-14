import global from '../global.js';

export default class ChatManager {
	constructor() {
		this.messageQueue = [];
		this.commandQueue = [];
		this.state = global.chatState.public;
		this.chatActive = false;
		this.storedMessages = 200;
	}
	
	sendMessage(msg) {
		if (msg != "") {
			if (this.state == global.chatState.global) {
				msg = msg.substring(1);
			}

			msg = this.removeTags(msg);

			let msgPacket = {state: this.state, value: msg};
			this.messageQueue.push(msgPacket);

			$("#chatinput").val("");
		}
	}

	removeTags(value) {
		return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}

	appendToPublic(player, msg) {
		if($('#textarea .chatmsg').length >= this.storedMessages) {
			$('#textarea').find('.chatmsg').first().remove();
		}
		
		$('<div class="chatmsg"><div class="indicator"></div><p class="username">' + player + ':&nbsp;</p><p class="chattext">' + msg + '</p></div').appendTo("#textarea");
	}

	appendToGlobal(msg) {
		$('<p>' + msg + '</p>').appendTo("#globalmsg");
	}

	scrollPublic() {
		let glb = document.getElementById("textarea");
		glb.scrollTop = glb.scrollHeight + 4;
	}

	scrollGlobal() {
		let glb = document.getElementById("globalmsg");
		glb.scrollTop = glb.scrollHeight + 4;
	}

	updateChat(messages) {
		while (messages.length > 0) {
			const msg = messages.shift();
			const formattedMsg = msg.value;
			const playerName = msg.username;

			if (msg.state == global.chatState.public) {
				this.appendToPublic(playerName, formattedMsg);
				this.scrollPublic();
			} else if (msg.state == global.chatState.global) {
				this.appendToGlobal(formattedMsg);
				this.scrollGlobal();
			}
		}
	}
}