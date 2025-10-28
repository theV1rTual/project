import {Router, Request, Response} from "express";
import {authMiddleware} from "../middlewares/auth";
import {usersRepository} from "../repositories/users-repository";
import {UsersService} from "../bll/users-service";
import {jwtService} from "../common/jwt.service";
import {
    registerValidation,
    registrationConfirmationValidation,
    registrationResendValidation
} from "../middlewares/validators/auth";
import {validateRequest} from "../middlewares/validators/validateRequest";
import jwt from "jsonwebtoken";

export const authRouter = Router({})

authRouter.post('/login', async (req: Request, res: Response) => {
    const user = await UsersService.checkCredentials(req.body.loginOrEmail, req.body.password);

    if (!user) {
        return res.sendStatus(401);
    }

    const accessToken = jwtService.createAccessToken(user);
    const refreshToken = jwtService.createRefreshToken(user);

    await UsersService.saveRefreshToken(user._id.toString(), refreshToken);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 20 * 1000
    })

    return res.status(200).send(accessToken);
});

authRouter.post('/refresh-token', async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(401);
    }

    const userId = await UsersService.findUserByRefreshToken(refreshToken);
    if (!userId) return res.sendStatus(401);

    const isValid = await UsersService.isRefreshTokenValid(userId, refreshToken);
    if (!isValid) return res.sendStatus(401);

    await UsersService.invalidateRefreshToken(userId, refreshToken);

    const user = await usersRepository.findById(userId);
    if (!user) {
        return res.sendStatus(401);
    }

    const newAccessToken = jwtService.createAccessToken(user);
    const newRefreshToken = jwtService.createRefreshToken(user);

    await UsersService.saveRefreshToken(userId, newRefreshToken)

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 20 * 1000
    })

    return res.status(200).json({accessToken: newAccessToken})

})

authRouter.post('/registration-confirmation', registrationConfirmationValidation, validateRequest, async (req: Request, res: Response) => {
    //  тут чекает код в боди. Типа если он окей, значит 204

    const result = await UsersService.confirmRegistration(req.body.code);
    if (!result) {
        return res.status(400).json({
            errorsMessages: [{ message: 'user is already confirmed or code not found', field: "code" }]
        })
    }
    return res.sendStatus(204).json( 'Email was verified. Account was activated');

})

authRouter.post('/registration', registerValidation, validateRequest, async (req: Request, res: Response) => {
    try {
        const { login, email, password } = req.body ?? {};
        const ok = await UsersService.register(login, email, password);
        return res.status(204).json('Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere')
    } catch (e) {
        console.error('registration error:', e);
        return res.sendStatus(500);
    }
    // отправляется email на почту, которую указал пользователь
})

authRouter.post('/registration-email-resending', registrationResendValidation, validateRequest, async (req: Request, res: Response) => {
    // отпрвляет повторвный email на почту с кодом

    const result = await UsersService.resendingRegistrationEmail(req.body.email)

    if (!result) return res.status(400).json({
        errorsMessages: [{ message: 'email is not found or already confirmed', field: "email" }]
    })
    return res.sendStatus(204).json('Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere')
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

authRouter.post('/logout', async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const userId = await jwtService.getUserIdByRefreshToken(refreshToken);
    if (!userId) return res.sendStatus(401);

    await UsersService.invalidateRefreshToken(userId, refreshToken);
    res.clearCookie("refreshToken");
    return res.sendStatus(204);
})

