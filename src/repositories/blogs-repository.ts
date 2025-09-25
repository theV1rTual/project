import {blogsCollection} from "./db";
import {BlogDbModel, BlogModel, CreateBlogModel} from "../models/blog.model";
import {ObjectId} from 'mongodb'

const mapBlog = (doc: BlogDbModel): BlogModel => ({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    websiteUrl: doc.websiteUrl,
});

export const blogsRepository = {
    async findAllBlogs(): Promise<BlogModel[]> {
        const docs = await blogsCollection.find({}).toArray();
        return docs.map(mapBlog);
    },

    async findOneBlog(id: string): Promise<BlogModel | null> {
        if (!ObjectId.isValid(id)) return null;

        const doc = await blogsCollection.findOne({_id: new ObjectId(id)})
        return doc ? mapBlog(doc) : null;
    },

    async createBlog(blog: CreateBlogModel): Promise<BlogModel> {
        const insertDoc: BlogDbModel = {
            _id: new ObjectId(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl
        }
        const result = await blogsCollection.insertOne(insertDoc);
        return mapBlog(insertDoc)
    },

    async deleteBLog(id: string) {
        if (!ObjectId.isValid(id)) return null;
        const r = await blogsCollection.deleteOne({_id: new ObjectId(id)})
        return r.deletedCount === 1;
    },

    async update(id: string, blog: CreateBlogModel): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;

        const result = await blogsCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: blog}
        )
        return result.matchedCount === 1;
    }
}
