import {blogsCollection, commentsCollection, usersCollection} from "./db";
import {ObjectId} from 'mongodb'
import {BlogDbModel, BlogModel} from "../models/blog.model";
import {CommentDbModel, CommentModel, CreateCommentModel} from "../models/comment.model";
import {CreatePostModel} from "../models/post.model";
import { OptionalUnlessRequiredId } from 'mongodb';
import {UserDbModel} from "../models/user.model";


const mapComment = (doc: CommentDbModel): CommentModel => ({
    id: doc._id.toString(),
    commentatorInfo: doc.commentatorInfo,
    content: doc.content,
    createdAt: doc.createdAt
});

const COMMENT_SORTABLE_FIELDS = new Set(['content', 'createdAt', 'id', '_id'])

export const commentsRepository = {
    async findCommentById(id: string): Promise<CommentModel | null> {
        if (!ObjectId.isValid(id)) return null;
        const comment = await commentsCollection.findOne({_id: new ObjectId(id)})
        return comment ? mapComment(comment) : null;
    },

    async deleteByIdAndOwner(id: string, ownerId: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;

        const res = await commentsCollection.deleteOne({
            _id: new ObjectId(id),
            'commentatorInfo.userId': ownerId, // userId в БД у тебя string
        });

        return res.deletedCount === 1;
    },

    async updateByIdAndOwner(
        id: string,
        ownerId: string,
        update: { content: string }
    ): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;

        const res = await commentsCollection.updateOne(
            { _id: new ObjectId(id), 'commentatorInfo.userId': ownerId },
            { $set: { content: update.content } }
        );
        return res.matchedCount === 1 && res.modifiedCount === 1;
    },

    async findAllComments(
        postId: string,
        params: {
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number,
    }) {
        const { sortBy, sortDirection, pageNumber, pageSize } = params;

        // или «двойной», если в базе могут быть оба формата:
        const filter = ObjectId.isValid(postId)
            ? { $or: [{ postId }, { postId: new ObjectId(postId) }] }
            : { postId };

        const sortField = COMMENT_SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt';
        const sortValue = sortDirection === 'asc' ? 1 : -1;

        const totalCount = await commentsCollection.countDocuments(filter)

        const docs  = await commentsCollection.find(filter)
            .sort({ [sortField === 'id' ? '_id' : sortField] : sortValue})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        return {
            pagesCount: Math.ceil(totalCount / pageSize) || 0,
            page: pageNumber,
            pageSize,
            totalCount,
            items: docs.map(mapComment)
        }
    },

    async deleteComment(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;

        const deletedDoc = await commentsCollection.deleteOne({_id: new ObjectId(id)});
        return deletedDoc.deletedCount === 1;
    },

    async update(id: string, comment: CreateCommentModel): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;
        const result = await commentsCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: comment}
        )

        return result.matchedCount === 1;
    },

    async create(user: UserDbModel, comment: CreateCommentModel, postId: string): Promise<CommentModel> {
        const doc = {
            _id: new ObjectId(),
            postId: postId,
            content: comment.content.trim(),
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.login,
            },
            createdAt: new Date(),
        };

        const {insertedId} = await commentsCollection.insertOne(doc);
        const created = await commentsCollection.findOne({_id: insertedId})

        return mapComment(created!)
    }
}
