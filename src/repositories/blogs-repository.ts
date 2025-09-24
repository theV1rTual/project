import {blogsCollection} from "./db";
import {BlogDbModel, BlogModel} from "../models/blog.model";

const mapBlog = (doc: BlogDbModel): BlogModel => ({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    websiteUrl: doc.websiteUrl,
});

export const blogsRepository = {
    async getBlogs(): Promise<BlogModel[]> {
        const docs = await blogsCollection.find({}).toArray();
        return docs.map(mapBlog)
    }
}
