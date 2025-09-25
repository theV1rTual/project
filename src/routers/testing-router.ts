import {Router, Request, Response} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {blogsCollection} from "../repositories/db";

export const testingRouter = Router({})

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    try {
        await blogsCollection.deleteMany({})
        res.sendStatus(204)
    } catch (e) {
        res.sendStatus(500)
    }
})
