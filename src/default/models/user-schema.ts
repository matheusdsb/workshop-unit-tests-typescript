import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  login: String,
  avatar: String,
  isSiteAdmin: Boolean,
});
