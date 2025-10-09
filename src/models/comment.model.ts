import {ObjectId} from 'mongodb'


export type CommentDbModel = {
    _id: ObjectId,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string,
    }
    createdAt: Date
}

export type CommentModel = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string,
    }
    createdAt: Date
}

export type CreateCommentModel = {
    postId: string,
    content: string
}
