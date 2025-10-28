import {UserDbModel} from "../models/user.model";
import jwt, {Jwt, JwtPayload} from 'jsonwebtoken'
import {settings} from "./settings";
import {ObjectId} from 'mongodb'

export const jwtService = {
    createAccessToken(user: UserDbModel) {
        return jwt.sign({ userId: user._id }, settings.JWT_SECRET, { expiresIn: '10s' });
    },
    createRefreshToken(user: UserDbModel) {
        return jwt.sign({ userId: user._id }, settings.REFRESH_SECRET, { expiresIn: '20s' });
    },
    getUserIdByAccessToken(token: string) {
        try {
            const r = jwt.verify(token, settings.JWT_SECRET) as JwtPayload;
            return r.userId as string;
        } catch { return null; }
    },
    getUserIdByRefreshToken(token: string) {
        try {
            const r = jwt.verify(token, settings.REFRESH_SECRET) as JwtPayload;
            return r.userId as string;
        } catch { return null; }
    }
}
