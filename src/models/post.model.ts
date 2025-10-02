import {ObjectId} from 'mongodb'

export type PostDbModel = {
    _id: ObjectId;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: Date;
}

export type PostModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: Date;
}

export type CreatePostModel = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}

export type CreateBlogPost =  {
    title: string;
    shortDescription: string;
    content: string;
}

export type BlogPost = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
}
