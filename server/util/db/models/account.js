import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const accountSchema = new Schema({
	account: String,
	password: String,
	email: String,
	ip: String,
	last_online: Date,
	pending_session_timestamp: Date,
	pending_session_id: String,
	active_session_id: String,
	created: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}
});

export const Account = model('Account', accountSchema);