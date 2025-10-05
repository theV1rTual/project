import {Router, Request, Response} from "express";
import {basic} from "../middlewares/auth";
import {usersRepository} from "../repositories/users-repository";

export const authRouter = Router({})

authRouter.post('/login', basic, async (req: Request, res: Response) => {
    const ok = await usersRepository.login(req.body)
    if (ok) {
        return res.sendStatus(200)
    }
    return res.sendStatus(401)
})

