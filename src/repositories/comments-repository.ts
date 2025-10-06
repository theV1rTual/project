import {commentsCollection} from "./db";
import {ObjectId} from 'mongodb'
import {BlogDbModel, BlogModel} from "../models/blog.model";
import {CommentDbModel, CommentModel, CreateCommentModel} from "../models/comment.model";
import {CreatePostModel} from "../models/post.model";

const mapComment = (doc: CommentDbModel): CommentModel => ({
    id: doc._id.toString(),
    commentatorInfo: doc.commentatorInfo,
    content: doc.content,
    createdAt: doc.createdAt
});

export const commentsRepository = {
    async findCommentById(id: string): Promise<CommentModel | null> {
        if (!ObjectId.isValid(id)) return null;
        const comment = await commentsCollection.findOne({_id: new ObjectId(id)})
        return comment ? mapComment(comment) : null;
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
    }
}
