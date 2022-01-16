import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  login: String,
  githubId: Number,
  avatar: String,
  isSiteAdmin: Boolean,
});
