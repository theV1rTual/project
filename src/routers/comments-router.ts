import {Router, Request, Response} from "express";
import {commentsRepository} from "../repositories/comments-repository";
import {authMiddleware} from "../middlewares/auth";
import {commentsCollection} from "../repositories/db";

export const commentsRouter = Router({})

commentsRouter.get('/:id', async (req: Request, res: Response) => {
    const comment = await commentsRepository.findCommentById(req.params.id)
    if (!comment) return res.sendStatus(404)
    return res.status(200).json(comment)
})

commentsRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    const doc = await commentsRepository.findCommentById(req.params.id);

    if (doc?.commentatorInfo.userId === req.user?._id) {
        const deleted = await commentsRepository.deleteComment(req.params.id);
        if (deleted) {
            return res.sendStatus(204);
        }
        return res.sendStatus(404)
    }

    return res.sendStatus(403);
})

commentsRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    const doc = await commentsRepository.findCommentById(req.params.id);

    if (doc?.commentatorInfo.userId === req.user?._id) {
        const updated = await commentsRepository.update(req.params.id, req.body);
        if (updated) {
            return res.sendStatus(204)
        }
        return res.sendStatus(404)
    }

    return res.sendStatus(403)
})
