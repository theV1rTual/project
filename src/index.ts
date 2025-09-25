import express, {Request, Response} from 'express'
import {runDb} from "./repositories/db";
import {blogsRouter} from "./routers/blogs-router";
import expressBasicAuth from "express-basic-auth";
import {testingRouter} from "./routers/testing-router";

const app = express()

const ready = runDb();

app.use(express.json())

app.use('testing', testingRouter)

app.use(expressBasicAuth({
    users: {'admin': 'qwerty'},
    challenge: true
}))

app.use(async (_req, _res, next) => {
    await ready; next()
})

app.get('/', (_req: Request, res: Response) => {
    res.send('Всем саламалейкум')
})

app.use('/blogs', blogsRouter)

export default app


