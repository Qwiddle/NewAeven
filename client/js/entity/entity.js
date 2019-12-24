class Entity {
	constructor() {
		this.prevPos = {x: 0, y: 0};
		this.pos = {x: 0, y: 0};
		this.targetPos = {x: 0, y: 0};

		this.map = 0;
		this.prevMap = this.map;

		this.packets = [];

		this.lastMoveTime = 0;
		this.walkTime = 450;
		this.attackTime = 500;
		this.dir = 0;
	}
}    

module.exports = Entity;