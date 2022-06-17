export class Player {
	constructor(sex, race, username) {
		this.initCosmetics(sex, race);
		this.initKinematics();
		this.initPacketMetadata();
		this.initMapMetadata();
		this.initMessageMetadata();

		this.username = username;
		this.accountname = "";
		this.prevPos = {x: 0, y: 0};
		this.pos = {x: 0, y: 0};
		this.targetPos = {x: 0, y: 0};

		this.stats = { 
			hp: 30,
			maxhp: 30,
			level: 0
		};

		this.map = 0;
		this.mapData = [];	
		this.prevMap = this.map;

		this.packets = [];

		this.lastMoveTime = 0;
		this.walkTime = 450;
		this.attackTime = 450;
		this.dir = 0;
	}

	initCosmetics(sex, race) {
		this.sex = 0;
		this.race = 0;

		this.equipment = {
			armor: {id: ''},
			boots: {id: ''},
			weapon: {id: ''},
		}

		this.hair = {
			style: 0,
			color: 0,
		}
	}

	initKinematics() {
		this.isMoving = false;
		this.keyPressed = 4;
		this.lastRotate = 0;
		this.isAttacking = false;
		this.lastAttackTime = 0;
		this.isPressed = false;
	}

	initPacketMetadata() {
		this.inputQueue = [];
		this.processedPackets = [];
		this.seq = 0;
	}

	initMapMetadata() {
		this.changedMaps = false;
	}

	initMessageMetadata() {
		this.message = "";
		this.messageUpdated = false;
		this.messageDelay = 0;
    }
}