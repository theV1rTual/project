import {Router, Request, Response} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {blogsCollection, postsCollection, usersCollection} from "../repositories/db";
import {usersRepository} from "../repositories/users-repository";

export const testingRouter = Router({})

testingRouter.get('/', (_req: Request, res: Response) => {
    res.json({ ok: true });
});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    try {
        await blogsCollection.deleteMany({})
        await postsCollection.deleteMany({})
        await usersCollection.deleteMany({})
        console.log('22')
        res.sendStatus(204)
    } catch (e) {
        res.sendStatus(500)
    }
})
