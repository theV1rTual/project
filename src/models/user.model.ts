import {ObjectId} from 'mongodb'

export type UserDbModel = {
    _id: ObjectId;
    login: string;
    email: string;
    createdAt: Date;
    password: string;
}

export type UserModel = {
    id: string;
    login: string;
    email: string;
    createdAt: Date;
}

export type CreateUserModel = {
    login: string;
    password: string;
    email: string
}


