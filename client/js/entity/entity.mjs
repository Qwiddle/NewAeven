export class Entity {
	constructor() {
		this.prevPos = {x: 0, y: 0};
		this.pos = {x: 0, y: 0};
		this.targetPos = {x: 0, y: 0};

		this.map = 0;
		this.prevMap = 0;
		this.mapData = [];

		this.packets = [];

		this.lastMoveTime = 0;
		this.lerpTime = 2500;
		this.dir = 3;

		this.stats = { 
			hp: 30,
			maxhp: 30,
			level: 0
		};
	}
}