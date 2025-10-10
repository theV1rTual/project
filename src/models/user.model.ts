import {ObjectId} from 'mongodb'

export type UserDbModel = {
    _id: ObjectId;
    login: string;
    email: string;
    createdAt: Date;
    password: string;
    confirmation?: {
        code: string,
        expiredAt: Date,
        sentAt: Date,
        used: boolean
    }
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


