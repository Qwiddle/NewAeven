export default class Player {
	constructor(sex, race, username) {
		this.initCosmetics(sex, race);
		this.initKinematics();
		this.initPacketMetadata();
		this.initMapMetadata();
		this.initMessageMetadata();

		this.username = username;
		this.prevPos = {x: 0, y: 0};
		this.pos = {x: 0, y: 0};
		this.targetPos = {x: 0, y: 0};
		
		this.stats = { 
            curr_hp: 30,
            max_hp: 30,
            level: 1
        };

        this.map = 0;
        this.mapData = [];	
		this.prevMap = this.map;

		this.packets = [];

		this.lastMoveTime = 0;
		this.walkTime = 450;
		this.attackTime = 500;
		this.dir = 0;
	}

	initCosmetics(sex, race) {
        this.sex = 0;
        this.race = 0;
		this.account_name = "";

        this.equipment = {
            shirt: {id: '', name: ''},
            pants: {id: '', name: ''},
            weapon: {id: '', name: ''},
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