import EntityController from './entityController.js';
import PathFinder from '../util/pathFinder.js';
import global from '../global.js';

export default class EnemyController extends EntityController {
	static updateNextAction(enemy) {
		if(enemy.packets.length > 0) {
			let packet = enemy.packets.shift();
			enemy.action = packet.input;
			return packet;
		} else {
			enemy.action = global.direction.none;
			return null;
		}
	}

	static isMovable(entity) {
		let delayTime = Date.now() - entity.lastMoveTime;
		return delayTime >= (entity.walkTime) && !entity.isAttacking;
	}

	static update(enemy) {
		if(this.isMovable(enemy)) {
			if(this.hasTarget(enemy)) {
				const targetInRange = 
					(Math.abs(enemy.target.pos.x - enemy.pos.x) == 1 &&
					enemy.target.pos.y == enemy.pos.y) ||
					(Math.abs(enemy.target.pos.y - enemy.pos.y) == 1 &&
					enemy.target.pos.x == enemy.pos.x);

				if(targetInRange) {
					this.attackTarget(enemy);
				} else {
					enemy.action = global.direction.none;
					this.followTarget(enemy);
				}
			} else {
				enemy.action = global.direction.none;
				enemy.lastMoveTime = Date.now();

				let pos = Math.floor(Math.random() * 5);
				this.updatePosition(enemy, pos);
			}
		}

		//enemy.mapData[enemy.prevPos.x][enemy.prevPos.y] = global.tile.empty;
		//enemy.mapData[enemy.pos.x][enemy.pos.y] = global.tile.enemy;
	}

	static attackTarget(enemy) {
		if (enemy.target.pos.x < enemy.pos.x) {
			enemy.dir = global.direction.left;
		} else if (enemy.target.pos.x > enemy.pos.x) {
			enemy.dir = global.direction.right;
		} else if (enemy.target.pos.y < enemy.pos.y) {
			enemy.dir = global.direction.up;
		} else if (enemy.target.pos.y > enemy.pos.y) {
			enemy.dir = global.direction.down;
		}

		enemy.action = global.key.attack;

		enemy.lastMoveTime = Date.now();
		enemy.packets.push(this.buildPacket(enemy));
	}

	static followTarget(enemy) {
		const targetMoved = 
			enemy.lastTargetPos.x != enemy.target.pos.x ||
			enemy.lastTargetPos.y != enemy.target.pos.y;

		if(targetMoved) {
			enemy.lastTargetPos.x = enemy.targetPos.x;
			enemy.lastTargetPos.y = enemy.targetPos.y;	
			
			let pathFinder = new PathFinder(enemy.mapData);
			let path = pathFinder.search(enemy.pos.x, enemy.pos.y, enemy.target.pos.x, enemy.target.pos.y);
			enemy.pathStack = pathFinder.getPath(enemy.target.pos.x, enemy.target.pos.y);
		}

		let pos = enemy.pathStack.pop();
		enemy.lastMoveTime = Date.now();
		this.updatePosition(enemy, pos);
	}

	static updatePosition(enemy, pos) {
		enemy.prevPos.x = enemy.pos.x;
		enemy.prevPos.y = enemy.pos.y;

		switch (pos) {
			case global.direction.left:
				enemy.dir = global.direction.left;
				enemy.pos.x--;
				break;
			case global.direction.right:
				enemy.dir = global.direction.right;
				enemy.pos.x++;
				break;
			case global.direction.up:
				enemy.dir = global.direction.up;
				enemy.pos.y--;
				break;
			case global.direction.down:
				enemy.dir = global.direction.down;
				enemy.pos.y++;
				break;
			default:
				enemy.dir = global.direction.none;
				break;
		}


		if(this.inBounds(enemy, enemy.pos, enemy.map)) {
			this.updateTargetPos(enemy);
		} else {
			enemy.pos.x = enemy.prevPos.x;
			enemy.pos.y = enemy.prevPos.y;
		}

		enemy.packets.push(this.buildPacket(enemy));
	}

	static inBounds(entity, pos, map) {
		return (pos.x >= 0 && pos.y >= 0 && pos.x < entity.mapData.length && pos.y < entity.mapData.length);
	}

	static buildPacket(enemy) {
		let packet = {
			type: 'action',
			eid: enemy.eid,
			pos: {x: enemy.pos.x, y: enemy.pos.y},
			stats: enemy.stats,
			action: enemy.action,
			dir: enemy.dir
		};

		return packet;
	}

	static buildStatsPacket(enemy) {
		let packet = { 
			type: 'stats',
			eid: enemy.eid,
			pos: {x: enemy.pos.x, y: enemy.pos.y},
			stats: enemy.stats,
			action: enemy.action,
			dir: enemy.dir
		};

		return packet;
	}

	static setTarget(enemy, target, id) {
		enemy.targetId = id;
		enemy.target = target;
	}

	static hasTarget(enemy) {
		for(let key in enemy.target) {
			if(enemy.target.hasOwnProperty(key)) {
				return true;
			}
		}

		return false;
	}
}