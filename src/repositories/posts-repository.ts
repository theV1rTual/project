import {CreatePostModel, PostDbModel, PostModel} from "../models/post.model";
import {blogsCollection, postsCollection} from "./db";
import {ObjectId} from 'mongodb';

const mapPost = (doc: any): PostModel => ({
    id: doc._id.toString(),
    blogId: doc.blogId,
    blogName: doc.blogName,
    content: doc.content,
    shortDescription: doc.shortDescription,
    title: doc.title,
    createdAt: doc.createdAt
})

const POST_SORTABLE_FIELDS = new Set(['title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt', '_id', 'id'])


export const postsRepository = {
    async findAllPosts(params: {
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number
    }) {
        const { sortBy, sortDirection, pageNumber, pageSize } = params;

        const filter: any = {};

        const sortField = POST_SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt';
        const sortValue = sortDirection === 'asc' ? 1 : -1;

        const totalCount = await postsCollection.countDocuments(filter);

        const docs = await postsCollection.find(filter) // ← тут была ошибка
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

    async findOnePost(id: string): Promise<PostModel | null> {
        if (!ObjectId.isValid(id)) return null
        const doc = await postsCollection.findOne({_id: new ObjectId(id)})
        return doc ? mapPost(doc) : null
    },

    async createPost(post: CreatePostModel): Promise<PostModel> {
        const insertDoc: PostDbModel = {
            _id: new ObjectId(),
            blogId: post.blogId,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogName: '123',
            createdAt: new Date()
        }

        const result = await postsCollection.insertOne(insertDoc)
        return mapPost(insertDoc)
    },

    async deletePost(id: string) {
        if (!ObjectId.isValid(id)) return false;

        const r = await postsCollection.deleteOne({_id: new ObjectId(id)})
        return r.deletedCount === 1;
    },

    async update(id: string, post: CreatePostModel): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;

        const result = await postsCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: post}
        )

        return result.matchedCount === 1;
    }
}
