import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const playerSchema = new Schema({
	account: String,
	username: String,
	admin: {
		type: Number,
		default: 0
	},
	sex: Number,
	race: Number,
	hair: {},
	dir: Number,
	pos: {},
	stats: { 
		level: { 
			type: Number, 
			default: 0 
		}, 
		hp: { 
			type: Number, 
			default: 10 
		}, 
		maxHp: { 
			type: Number, 
			default: 10 
		} 
	},
	equipment: { 
		armor: { 
			type: Number, 
			default: 0 
		},
		weapon: { 
			type: Number, 
			default: 0 
		},
		boots: { 
			type: Number, 
			default: 0 
		},
	},
	inventory: [{ 
		id: Number, 
		gridNumber: Number 
	}]
});

export const Player = model('Player', playerSchema);