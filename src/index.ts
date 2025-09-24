import express, {Request, Response} from 'express'
import {runDb} from "./repositories/db";

const app = express()

const ready = runDb();

app.use(express.json())

app.use(async (_req, _res, next) => {
    await ready; next()
})

app.get('/', (_req: Request, res: Response) => {
    res.send('Всем саламалейкум')
})

export default app


