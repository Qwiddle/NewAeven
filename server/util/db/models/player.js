import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const playerSchema = new Schema({
	account: String,
	username: String,
	admin: Number,
	sex: Number,
	race: Number,
	hairColor: Number,
	hairStyle: Number,
	dir: Number,
	map: Number,
	x: Number,
	y: Number,
	stats: { level: Number, hp: Number, maxhp: Number },
	inventory: [{ id: Number, gridNumber: Number }],
	equipment: { armor: Number, weapon: Number, boots: Number }
});

export const Player = model('Player', playerSchema);