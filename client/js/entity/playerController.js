import global from '../global.js';

export default class PlayerController {
	static updateKeyPressed(player) {
		if(player.packets.length > 0) {
			let packet = player.packets.shift();
			packet.mapData = player.mapData;
			player.keyPressed = packet.input;
			player.processedPackets.push(packet);
		} else {
			player.keyPressed = global.direction.none;
		}
	}

	static pressedKey(player) {
		return player.keyPressed != global.direction.none;
	}

	static reapplyInput(player, pos, packet) {
		let prevPos = {x: pos.x, y: pos.y}; 

		switch (packet.input) { 
			case (global.direction.left):
				pos.x--;
				break;
			case (global.direction.right):
				pos.x++;
				break;
			case (global.direction.up):
				pos.y--;
				break;
			case (global.direction.down):
				pos.y++;
				break;
			default:
				break;
		}

		if (!this.inBounds(player, pos, packet.map)) {
			pos.x = prevPos.x;
			pos.y = prevPos.y;
		} 
	}

	static hasRotated(player) {
		return player.keyPressed == global.direction.staticLeft ||
			player.keyPressed == global.direction.staticRight ||
			player.keyPressed == global.direction.staticUp ||
			player.keyPressed == global.direction.staticDown;
	}

	static hasAttacked(player) {
		return player.keyPressed === global.key.attack;
	}

	static setPosition(entity, x, y) {
		entity.pos.x = x;
		entity.pos.y = y;
	}

	static setPrevPos(entity, x, y) {
		entity.prevPos.x = x;
		entity.prevPos.y = y;
	}

	static updateTargetPos(entity) {
		entity.targetPos.x = (entity.pos.x - entity.pos.y) * 32;
		entity.targetPos.y = (entity.pos.x + entity.pos.y) * 16;
	}

	 static updatePosition(player) {
		let playerRotated = player.keyPressed > 4;

		if (!playerRotated) {
			player.prevPos.x = player.pos.x;
			player.prevPos.y = player.pos.y;

			switch (player.keyPressed) {
				case (global.direction.left):
					player.dir = global.direction.left;
					player.pos.x--;
					break;
				case (global.direction.right):
					player.dir = global.direction.right;
					player.pos.x++;
					break;
				case (global.direction.up):
					player.dir = global.direction.up;
					player.pos.y--;
					break;
				case (global.direction.down):
					player.dir = global.direction.down;
					player.pos.y++;
					break;
				default:
					break;
			}

			if(this.inBounds(player, player.pos, player.map)) {
				this.updateTargetPos(player);
			} else {
				player.pos.x = player.prevPos.x;
                player.pos.y = player.prevPos.y;
                this.updateTargetPos(player);
			}	
		} else {
			switch (player.keyPressed) {
				case (global.direction.staticLeft):
					player.dir = global.direction.left;
					break;
				case (global.direction.staticRight):
					player.dir = global.direction.right;
					break;
				case (global.direction.staticUp):
					player.dir = global.direction.up;
					break;
				case (global.direction.staticDown):
					player.dir = global.direction.down;
					break;
				default:
					break;
			}
		}
	}

	static positionEquals(posA, posB) {
		return posA.x === posB.x && posA.y === posB.y;
	}

	static isMovable(entity) {
		let delayTime = Date.now() - entity.lastMoveTime;
		return delayTime >= (entity.walkTime);
	}

	static inBounds(entity, pos, map) {
		return (pos.x >= 0 && pos.y >= 0 && pos.x < entity.mapData.length && pos.y < entity.mapData.length);
	}
}