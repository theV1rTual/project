import expressBasicAuth from "express-basic-auth";
import e, {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import {jwtService} from "../common/jwt.service";
import {UsersService} from "../bll/users-service";

export const basic = expressBasicAuth({
    users: {admin: 'qwerty'},
    challenge: true
})

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.header('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.sendStatus(401);
    }

    const token = auth.split(' ')[1];

    const userId = await jwtService.getUserIdByToken(token);
    if (!userId) {
        return res.sendStatus(401);
    }

    const user = await UsersService.findUserById(userId.toString());
    if (!user) {
        return res.sendStatus(401);
    }

    req.user = user;
    return next(); // ← важно вернуть, чтобы ниже не ушло в 401
};
