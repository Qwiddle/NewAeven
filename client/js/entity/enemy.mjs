import { Entity } from './entity.mjs';

export class Enemy extends Entity {
	constructor(map, mapData, eid) {
		super();

		this.eid = eid;
		this.map = map;
		this.mapData = mapData;
		this.type = "mata_mata";
		this.name = "Mata Mata";
		this.lerpTime = 3000;
		this.walkTime = 3000;
		this.lastMoveTime = 0;
		this.action = 0;
		this.inCombat = false;
		this.target = {};
		this.targetId = "";
		this.lastTargetPos = {x: null, y: null};
		this.pathStack = [];
	}
}