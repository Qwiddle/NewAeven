export class EntityController {
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

	static positionEquals(posA, posB) {
		return posA.x === posB.x && posA.y === posB.y;
	}

	static isMovable(entity) {
		let delayTime = Date.now() - entity.lastMoveTime;
		return delayTime >= entity.lerpTime;
	}

	static inBounds(entity, pos, map) {
		return true;
	}	

	static isDead(entity) {
		return entity.stats.hp <= 0;
	}
}