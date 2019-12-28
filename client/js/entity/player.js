Entity = require('./entitycontroller.js');  

class Player extends Entity {
	constructor(sex, race, username) {
		super()
		this.initCosmetics(sex, race);
		this.initKinematics();
		this.initPacketMetadata();
		this.initMapMetadata();
		this.initMessageMetadata();

		this.username = username;
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
		this.keyPressed = 0;
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

module.exports = Player;