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
        res.status(200).send(token);
    } else {
        res.sendStatus(401);
    }
});

authRouter.post('/registration-confirmation', async (req: Request, res: Response) => {
    //  тут чекает код в боди. Типа если он окей, значит 204

    const result = await UsersService.confirmRegistration(req.body.code);
    if (!result) {
        return res.sendStatus(400)
    }
    return res.sendStatus(204);

})

authRouter.post('/registration', async (req: Request, res: Response) => {
    const {login, email, password} = req.body;
    const result = await UsersService.register(login, email, password)
    if (!result) {
        return res.sendStatus(400)
    }
    return res.sendStatus(204)
    // отправляется email на почту, которую указал пользователь
})

authRouter.post('/registration-email-resending', async (req: Request, res: Response) => {
    // отпрвляет повторвный email на почту с кодом

    const result = await UsersService.resendingRegistrationEmail(req.body.email)

    if (!result) return res.sendStatus(400)
    return res.sendStatus(204)
})



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

