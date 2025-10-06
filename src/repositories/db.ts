import {MongoClient, Collection } from 'mongodb'
import * as dotenv from 'dotenv'
import {BlogDbModel} from "../models/blog.model";
import {PostDbModel} from "../models/post.model";
import {CommentDbModel} from "../models/comment.model";
import {UserDbModel} from "../models/user.model";
dotenv.config()

const url = process.env.MONGO_URL;
if (!url) {
    throw new Error('URL is not found')
}
const client = new MongoClient(url)
//
export const blogsCollection:Collection<BlogDbModel>  = client.db('project2').collection<BlogDbModel>('blogs');
export const postsCollection:Collection<PostDbModel> = client.db('project2').collection<PostDbModel>('posts');
export const usersCollection:Collection<UserDbModel> = client.db('project2').collection<UserDbModel>('users')
export const commentsCollection: Collection<CommentDbModel> = client.db('project2').collection<CommentDbModel>('comments')

export const runDb = async () => {
    try {
        await client.connect();
        console.log('Connected successfully to server')
    } catch (e) {
        console.log('Don\'t connected successfully to server')
        await client.close();
    }
}
