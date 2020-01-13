import global from '../global.js';

export default class ChatManager {
	constructor() {
		this.messageQueue = [];
		this.commandQueue = [];
		this.state = global.chatState.public;

		this.addEventHandlers();
	}

	addEventHandlers() {
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

    appendToPublic(msg) {
        $('<p class="chattext">' + msg + '</p>').appendTo("#publicmsg");
    }

    appendToGlobal(msg) {
        $('<p>' + msg + '</p>').appendTo("#globalmsg");
    }

    scrollPublic() {
        let glb = document.getElementById("publicmsg");
        glb.scrollTop = glb.scrollHeight + 3;
    }

    scrollGlobal() {
        let glb = document.getElementById("globalmsg");
		glb.scrollTop = glb.scrollHeight + 3;
    }

    updateChat(messages) {
        while (messages.length > 0) {
            const msg = messages.shift();
            const formattedMsg = msg.username + ": " + msg.value;

            if (msg.state == global.chatState.public) {
                this.appendToPublic(formattedMsg);
                this.scrollPublic();
            } else if (msg.state == global.chatState.global) {
                this.appendToGlobal(formattedMsg);
                this.scrollGlobal();
            }
        }
    }
}