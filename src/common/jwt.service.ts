import {UserDbModel} from "../models/user.model";
import jwt from 'jsonwebtoken'
import {settings} from "./settings";
import {ObjectId} from 'mongodb'

export const jwtService = {
    async createJWT(user: UserDbModel) {
        const token = jwt.sign({userId: user._id}, settings.JWT_SECRET, {expiresIn: '10s'})

        return {
            accessToken: token
        }
    },

    async createRefreshToken(user: UserDbModel) {
        return jwt.sign({userId: user._id}, settings.REFRESH_SECRET, {expiresIn: '20s'})
    },

    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET);
            return new ObjectId(result.userId)
        }
        catch (error) {
            return null
        }
    }
}
