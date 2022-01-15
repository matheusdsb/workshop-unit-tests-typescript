import { Document } from 'mongoose';

export type UserDocument = User & Document;
export class User {
  login: string;
  id: number;
  avatar: string;
  isSiteAdmin: boolean;
}
