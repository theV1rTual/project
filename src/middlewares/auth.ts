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
    if (!req.headers.authorization) {
        res.send(401)
        return;
    }

    const token =  req.headers.authorization.split(' ')[1];

    const userId = await jwtService.getUserIdByToken(token);
    if (userId) {
        req.user = await UsersService.findUserById(userId.toString());
        next();
    }

    return res.sendStatus(401);
}
