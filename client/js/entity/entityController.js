class EntityController {
	static setPosition(entity, x, y) {
		entity.pos.x = x;
		entity.pos.y = y;
	}

	static setPrevPos(entity, x, y) {
		entity.prevPos.x = x;
		entity.prevPos.y = y;
	}

	static updateTargetPos(entity) {
		entity.targetPos.x = (entity.pos.x + entity.pos.y) * 32;
		entity.targetPos.y = (entity.pos.x - entity.pos.y) * 16;
	}

	static positionEquals(posA, posB) {
        return posA.x === posB.x && posA.y === posB.y;
    }

    static isMovable(entity) {
        let delayTime = Date.now() - entity.lastMoveTime;
        return delayTime >= entity.walkTime;
    }

    static inBounds(entity, pos, map) {
        return (pos.x >= 0 && pos.y >= 0 && pos.x < entity.map.length && pos.y < entity.mapData.length);
    }
}

module.exports = EntityController;