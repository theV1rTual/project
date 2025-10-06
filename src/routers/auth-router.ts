import {Router, Request, Response} from "express";
import {authMiddleware, basic} from "../middlewares/auth";
import {usersRepository} from "../repositories/users-repository";
import {UsersService} from "../bll/users-service";
import jwt from "jsonwebtoken";
import {jwtService} from "../common/jwt.service";

export const authRouter = Router({})

authRouter.post('/login', async (req: Request, res: Response) => {
    const user = await UsersService.checkCredentials(req.body.loginOrEmail, req.body.password);

    if (user) {
        const token = await jwtService.createJWT(user)
        res.status(201).send(token);
    } else {
        res.sendStatus(401);
    }
});

authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
    const doc = await usersRepository.findById((req.user?._id ? req.user?._id : '').toString());
    if (doc) {
        return res.status(200).json({
            email: doc.email,
            login: doc.login,
            userId: req.user?._id
        })
    }

    return res.sendStatus(404)
})

