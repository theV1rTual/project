import {MongoClient, Collection } from 'mongodb'
import * as dotenv from 'dotenv'
import {BlogDbModel} from "../models/blog.model";
dotenv.config()

const url = process.env.MONGO_URL;
if (!url) {
    throw new Error('URL is not found')
}
const client = new MongoClient(url)
//
export const blogsCollection:Collection<BlogDbModel>  = client.db('project2').collection<BlogDbModel>('blogs');
// export const postsCollection = client.db('project2').collection('posts');

export const runDb = async () => {
    try {
        await client.connect();
        console.log('Connected successfully to server')
    } catch (e) {
        console.log('Don\'t connected successfully to server')
        await client.close();
    }
}
