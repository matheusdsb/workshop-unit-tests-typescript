import { Document } from 'mongoose';

export type UserDocument = User & Document;
export class User {
  login: string;
  githubId: number;
  avatar: string;
  isSiteAdmin: boolean;
}
