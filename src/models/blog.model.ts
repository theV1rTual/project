import {ObjectId} from 'mongodb'

export type BlogDbModel = {
    _id: ObjectId;
    name: string;
    description: string;
    websiteUrl: string
    isMembership: boolean;
    createdAt: Date;
}

export type BlogModel = {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    isMembership: boolean;
    createdAt: Date;
}

export type CreateBlogModel = {
    name: string;
    description: string;
    websiteUrl: string;
}
