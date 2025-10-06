import {Router, Request, Response, NextFunction} from "express";
import {commentsRepository} from "../repositories/comments-repository";
import {authMiddleware} from "../middlewares/auth";
import {commentsCollection} from "../repositories/db";
import {ObjectId} from 'mongodb'

export const commentsRouter = Router({})

commentsRouter.get('/:id', async (req: Request, res: Response) => {
    const comment = await commentsRepository.findCommentById(req.params.id)
    if (!comment) return res.sendStatus(404)
    return res.status(200).json(comment)
})

commentsRouter.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.sendStatus(400);

    // атомарная попытка удалить только свой комментарий
    const ok = await commentsRepository.deleteByIdAndOwner(
        id,
        req.user!._id.toString()
    );
    if (ok) return res.sendStatus(204);

    // если не удалилось — разберёмся: нет такого коммента или чужой
    const doc = await commentsRepository.findCommentById(id);
    if (!doc) return res.sendStatus(404);

    return res.sendStatus(403);
});

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
