import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const accountSchema = new Schema({
  id: Number,
  account_name: String,
  password: String,
  email: String,
  ip: String,
  created: Date,
  last_online: Date
});

export const Account = model('Account', accountSchema);