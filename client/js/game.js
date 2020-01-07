import Player from './entity/player.js';
import PlayerController from './entity/playerController.js';
import global from '../global.js';

export default class Game {
    constructor(clientController) {
        this.clientController = clientController;
        this.initialized = false; 

        this.CommandRegex = {
            ITEM: /^\/item (\w+) (\w+)/, 
            EQUIPMENT: /^\/equipment (\w+) (\w+)/
        };
    }

    clientConnected(packet) {
        this.players = {};
        this.equipmentCommand = {command: -1, itemId: ""};
        this.initClientPlayer(packet);
        this.initWorld(packet);
        this.initPhysicsTick();
        this.initialized = true;
    }

    serverUpdate(packet) {
        if(!this.initialized) { return; }

        this.player.map = packet.map;
        this.player.mapData = this.mapData;
        //this.clientController.updateEquipment(this.player, packet.equipment);
        this.updateDisconnectedPlayers(packet.disconnects);
        this.updateOtherClients(packet.moves, packet.map);
    }

    physicsUpdate() {
        this.updateKeyPressed();
        this.updateCommands();
        this.sendPhysicsPacket();
        this.updatePlayers();
    }

    initClientPlayer(packet) {
        this.player = new Player();
        this.player.prevPos.x = packet.pos.x;
        this.player.prevPos.y = packet.pos.y;
        this.player.pos.x = packet.pos.x;
        this.player.pos.y = packet.pos.y;
        this.player.username = packet.username;
        this.player.sex = packet.sex;
        this.player.race = packet.race;
        this.player.dir = packet.dir;
        this.player.equipment = packet.equipment;
        this.player.hair = packet.hair;
        this.player.stats = packet.stats;
        PlayerController.updateTargetPos(this.player);
    }

    initWorld(packet) {
        this.mapData = packet.mapData;
        this.player.mapData = this.mapData;
        this.player.mapJson = packet.mapJson;
        this.player.map = packet.map;
        this.pathStack = [];
    }

    initPhysicsTick() {
        let self = this;

        this.physicsInterval = setInterval(function() {
            self.physicsUpdate();
        }, global.physicsTick);

    }

    updateCommands() {
       //notyet
    }

    updateDisconnectedPlayers(disconnects) {
        for (let i = 0; i < disconnects.length; i++) {
            if (this.players.hasOwnProperty(disconnects[i])) {
                delete this.players[disconnects[i]];
                //this.clientController.deleteSprite(disconnects[i]);
            }
        }
    }

    deleteDisconnectedPlayerData(key) {
        delete this.players[key];
        //this.clientController.deleteSprite(key);
    }

    updatePlayers() {
        for (let key in this.players) {
            let player = this.players[key];

            if (player.map !== this.player.map) {
                this.deleteDisconnectedPlayerData(key);
                continue;
            }

            if (PlayerController.isMovable(player) && player.packets.length > 0) {
                let packet = player.packets.shift();

                if (packet.input == global.key.attack) {
                    player.lastMoveTime = Date.now();
                    player.isAttacking = true;
                    continue;
                }
                
                player.prevPos.x = player.pos.x;
                player.prevPos.y = player.pos.y;

                player.pos.x = packet.pos.x;
                player.pos.y = packet.pos.y;

                player.dir = packet.input;        

                const rotated =
                    player.pos.x == player.prevPos.x &&
                    player.pos.y == player.prevPos.y;

                if (!rotated) {
                    PlayerController.updatePosition(this.player);
                    PlayerController.updateTargetPos(player);
                    player.lastMoveTime = Date.now();
                }
            }
        }
    }

    updateKeyPressed() {
        if (PlayerController.isMovable(this.player)) {
            this.player.keyPressed = this.clientController.getKeyboardInput(this.player.keyPressed);

            if (this.player.keyPressed != global.direction.none) {
                this.pathStack = [];
            } else if (this.pathStack.length > 0) {
                this.player.keyPressed = this.pathStack.pop();
            }
        }
    }

    movementUpdate() { 
        if (PlayerController.hasAttacked(this.player)) {
            this.player.lastMoveTime = Date.now();
            this.player.isAttacking = true;
        } else if (!PlayerController.hasRotated(this.player)) {
            this.player.lastMoveTime = Date.now();
        }

        PlayerController.updatePosition(this.player);

        const metadata = this.bundleMovementMetadata();

        this.player.keyPressed = global.direction.none;

        return metadata;
    }

    equipmentUpdate() {
        const metadata = {
            command: this.equipmentCommand.command,
            itemId: this.equipmentCommand.itemId,
        }
        this.equipmentCommand.command = -1;
        this.equipmentCommand.itemId = "";
        return metadata;
    }

    equipmentUpdated() {
        return this.equipmentCommand.command !== -1;
    }

    getEquipmentUpdate() {
        return this.equipmentUpdated() ? this.equipmentUpdate() : {};
    }

    getMovementUpdate() {
        return PlayerController.pressedKey(this.player) ? this.movementUpdate() : {};
    }

    sendPhysicsPacket() {
        const packet = {
            'event':'physicsUpdate', 
            'movement': this.getMovementUpdate(), 
            'equipment': this.getEquipmentUpdate(),
        };

        this.clientController.sendPacket(packet);
    }   

    bundleMovementMetadata() {
        this.player.seq++;

        const metadata = {
            seq: this.player.seq,
            input: this.player.keyPressed,
            pos: this.player.pos,
            map: this.player.map, 
            mapData: this.player.mapData,
            time: Date.now(),
        };

        this.player.packets.push(metadata);
        return metadata;
    }

    createNewPlayer(key, packet, map) {
        this.players[key] = new Player();
        this.players[key].map = map;
        this.players[key].prevPos.x = packet[key].pos.x;
        this.players[key].prevPos.y = packet[key].pos.y;
        this.players[key].pos.x = packet[key].pos.x;
        this.players[key].pos.y = packet[key].pos.y;
        this.players[key].username = packet[key].username;
        PlayerController.updateTargetPos(this.players[key]);
        this.players[key].race = packet[key].race;
        this.players[key].sex = packet[key].sex;
        this.players[key].dir = packet[key].dir;
        this.players[key].hair = packet[key].hair;
    }

    reconcileClientPredictionsWithServer(packets) {
        let mostRecent = packets.processed;

        if (mostRecent.length == 0) {
            return;
        }

        mostRecent = packets.processed.pop();

        let index = 0;

        for (let i = 0; i < this.player.packets.length; i++) {
            if (this.player.packets[i].seq == mostRecent.seq) {
                index = i;
                break;
            }
        }

        let pos = mostRecent.pos;

        this.player.packets.splice(0, index+1);

        for (let i = 0; i < this.player.packets.length; i++) {
            PlayerController.reapplyInput(this.player, pos, this.player.packets[i]); 
        }

        this.player.pos = pos;

        PlayerController.updateTargetPos(this.player);
    }

    updateMyClient(packet, equipment) {
        delete equipment[this.clientController.getClientId()];
        const me = packet.moves[this.clientController.getClientId()];
        this.reconcileClientPredictionsWithServer(me);
        delete packet.moves[this.clientController.getClientId()];
    }

    updateOtherClients(packet, map) {
        for (let key in packet) {
            if (this.players.hasOwnProperty(key)) {
                while (packet[key].processed.length > 0) {
                    this.players[key].packets.push(packet[key].processed.shift());
                }
            } else {
                this.createNewPlayer(key, packet, map) 
           }

        }
    }

    hasMapUpdated(oldMap, newMap) {
        for (let i = 0; i < oldMap.length; i++) { 
            for (let j = 0; j < oldMap[0].length; j++) {
                if (oldMap[i][j] !== newMap[i][j]) {
                    return true;
                }
            }
        }

        return false;
    }
}