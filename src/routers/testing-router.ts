import {Router, Request, Response} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {blogsCollection, postsCollection} from "../repositories/db";

export const testingRouter = Router({})

testingRouter.get('/', (_req: Request, res: Response) => {
    res.json({ ok: true });
});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    try {
        await blogsCollection.deleteMany({})
        await postsCollection.deleteMany({})
        res.sendStatus(204)
    } catch (e) {
        res.sendStatus(500)
    }
})
