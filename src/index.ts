import express, { Request, Response} from 'express'
import {runDb} from "./repositories/db";
import {blogsRouter} from "./routers/blogs-router";
import {testingRouter} from "./routers/testing-router";
import {postsRouter} from "./routers/posts-router";
import {usersRouter} from "./routers/users-router";
import {authRouter} from "./routers/auth-router";
import {commentsRouter} from "./routers/comments-router";

const app = express()

const ready = runDb();

app.use(async (_req, _res, next) => {
    await ready; next()
})

app.use(express.json())

app.use('/testing', testingRouter)

app.get('/', (_req: Request, res: Response) => {
    res.send('Всем саламалейкум')
})

app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)

export default app


