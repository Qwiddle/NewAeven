global = require('../../global.js');
EntityController = require('./entitycontroller.js');  

class PlayerController extends EntityController {
	static updateKeyPressed(player) {
		if(player.packets.length > 0) {
			let packet = player.packets.shift();

			player.keyPressed = packet.input;
			player.processedPackets.push(packet);
		} else {
			player.keyPressed = global.Direction.None;
		}
	}

	static pressedKey(player) {
		return player.keyPressed != global.Direction.None;
	}


    static hasRotated(player) {
        return player.keyPressed == global.Direction.STATIC_LEFT ||
        	player.keyPressed == global.Direction.STATIC_RIGHT ||
            player.keyPressed == global.Direction.STATIC_UP ||
            player.keyPressed == global.Direction.STATIC_DOWN;
    }

    static hasAttacked(player) {
        return player.keyPressed === global.Key.ATTACK;
    }
}

module.exports = PlayerController;