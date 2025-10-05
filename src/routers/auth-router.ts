import {Router, Request, Response} from "express";
import {basic} from "../middlewares/auth";
import {usersRepository} from "../repositories/users-repository";

export const authRouter = Router({})

authRouter.post('/login', async (req: Request, res: Response) => {
    const ok = await usersRepository.login({
        loginOrEmail: req.body?.loginOrEmail,
        password: req.body?.password,
    });
    return ok ? res.sendStatus(204) : res.sendStatus(401);
});

