import {blogsCollection, postsCollection} from "./db";
import {BlogDbModel, BlogModel, CreateBlogModel} from "../models/blog.model";
import {ObjectId} from 'mongodb'
import {BlogPost, CreateBlogPost, CreatePostModel, PostDbModel} from "../models/post.model";
import {postsRepository} from "./posts-repository";

const mapBlog = (doc: BlogDbModel): BlogModel => ({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    websiteUrl: doc.websiteUrl,
    isMembership: doc.isMembership,
    createdAt: doc.createdAt
});

export const mapPost = (doc: PostDbModel) => ({
    id: doc._id.toString(),
    title: doc.title,
    shortDescription: doc.shortDescription,
    content: doc.content,
    blogId: doc.blogId,
    blogName: doc.blogName,
    createdAt: doc.createdAt,
});

const BLOG_SORTABLE_FIELDS = new Set(['name', 'description', 'websiteUrl', 'createdAt', 'isMembership', '_id', 'id'])
const POST_SORTABLE_FIELDS = new Set(['title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt', '_id', 'id'])

export const blogsRepository = {
    async findAllBlogs(params: {
        searchNameTerm?: string | null,
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number
    }) {
        const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = params;

        const filter: any = {}

        if (searchNameTerm && searchNameTerm.trim().length > 0) {
            filter.name = {$regex: searchNameTerm.trim(), $options: 'i'}
        }

        const sortField = BLOG_SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt';
        const sortValue = sortDirection === 'asc' ? 1 : -1;

        const totalCount = await blogsCollection.countDocuments(filter)

        const docs  = await blogsCollection.find(filter)
            .sort({ [sortField === 'id' ? '_id' : sortField] : sortValue})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        return {
            pagesCount: Math.ceil(totalCount / pageSize) || 0,
            page: pageNumber,
            pageSize,
            totalCount,
            items: docs.map(mapBlog)
        }
    },

    async findAllBlogPosts(params: {
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number,
        blogId: string
    }) {
        const { sortBy, sortDirection, pageNumber, pageSize, blogId } = params;

        const doc = await postsCollection.findOne({_id: new ObjectId(blogId)})
        if (!doc) {
            return null;
        }

        const filter: any = { blogId }; // ← ОБЯЗАТЕЛЬНО

        const sortField = POST_SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt';
        const sortValue = sortDirection === 'asc' ? 1 : -1;

        const totalCount = await postsCollection.countDocuments(filter);

        const docs = await postsCollection.find(filter)
            .sort({ [sortField === 'id' ? '_id' : sortField]: sortValue })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            pagesCount: Math.ceil(totalCount / pageSize) || 0,
            page: pageNumber,
            pageSize,
            totalCount,
            items: docs.map(mapPost),
        };
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
            isMembership: false,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: new Date()
        }
        const result = await blogsCollection.insertOne(insertDoc);
        return mapBlog(insertDoc)
    },

    async createBlogPost(blogId: string, blogPost: CreateBlogPost): Promise<BlogPost | null> {

        if (!ObjectId.isValid(blogId)) return null;

        const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
        if (!blog) {
            return null;
        }

        const insertDoc = {
            _id: new ObjectId(),
            title: blogPost.title,
            shortDescription: blogPost.shortDescription,
            content: blogPost.content,
            blogId,
            blogName: "123",
            createdAt: new Date()
        }

        const result = await postsCollection.insertOne(insertDoc);
        return {
            id: insertDoc._id.toString(),
            title: insertDoc.title,
            shortDescription: insertDoc.shortDescription,
            content: insertDoc.content,
            blogId: insertDoc.blogId,
            blogName: insertDoc.blogName,
            createdAt: insertDoc.createdAt
        }
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
