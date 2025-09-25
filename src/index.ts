import express, {NextFunction, Request, Response} from 'express'
import {runDb} from "./repositories/db";
import {blogsRouter} from "./routers/blogs-router";
import expressBasicAuth from "express-basic-auth";
import {testingRouter} from "./routers/testing-router";

const app = express()

const ready = runDb();

app.use(async (_req, _res, next) => {
    await ready; next()
})

app.use(express.json())

app.use('/testing', testingRouter)

const basic = expressBasicAuth({ users: { admin: 'qwerty' }, challenge: true });
app.use((req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl || req.url;
    if (url.startsWith('/testing') || url === '/health') return next();
    return basic(req, res, next);
});

app.get('/', (_req: Request, res: Response) => {
    res.send('Всем саламалейкум')
})

app.use('/blogs', blogsRouter)

export default app


