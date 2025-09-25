import {ObjectId} from 'mongodb'

export type PostDbModel = {
    _id: ObjectId;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
}

export type PostModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
}

export type CreatePostModel = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}
