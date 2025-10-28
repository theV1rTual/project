import {CreateUserModel, UserDbModel} from "../models/user.model";
import {usersRepository} from "../repositories/users-repository";
import {hashPassword} from "../common/hashing";
import bcrypt from 'bcrypt'
import {randomBytes} from "crypto";
import {emailAdapter} from "../adapters/email.adapter";
import jwt from "jsonwebtoken";
import {settings} from "../common/settings";

function genCode(): string {
    return randomBytes(16).toString('hex')
}

const CONFIRM_TTL_HOURS = 24;
const RESEND_COOLDOWN_MIN = 10;

const refreshTokenStorage = new Map<string, string[]>();

export const UsersService = {

    async saveRefreshToken(userId: string, token: string) {
        const tokens = refreshTokenStorage.get(userId) || [];
        refreshTokenStorage.set(userId, [...tokens, token]);
    },

    async isRefreshTokenValid(userId: string, token: string) {
        const tokens = refreshTokenStorage.get(userId) || [];
        return tokens.includes(token);
    },

    async invalidateRefreshToken(userId: string, token: string){
        const tokens = refreshTokenStorage.get(userId) || [];
        refreshTokenStorage.set(
            userId,
            tokens.filter((t) => t !== token)
        )
    },

    async createUser(user: CreateUserModel) {
        const login = user.login.trim();

        const exists = await usersRepository.findByLogin(login);
        if (exists) {
            return null
        }

        const passwordHash = await hashPassword(user.password);

        return usersRepository.create({
            login,
            email: user.email,
            password: passwordHash
        })
    },

    async findUserById(id: string): Promise<UserDbModel| null> {
        return usersRepository.findById(id);
    },

    async findUserByAccessToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET);
            return result.userId
        } catch {
            return null
        }
    },

    async findUserByRefreshToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.REFRESH_SECRET);
            return result.userId
        } catch {
            return null
        }
    },

    async checkCredentials(
        loginOrEmail: string,
        password: string
    ): Promise<UserDbModel | null> {
        const identifier = loginOrEmail.trim();

        // Предпочтительно один метод репозитория:
        const user =
            (await usersRepository.findByLoginOrEmail?.(identifier)) ??
            (await usersRepository.findByLogin?.(identifier)) ??
            (await usersRepository.findByEmail?.(identifier));

        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        return ok ? user : null;
    },

    async register(login: string, email: string, password: string) {
        email = email.toLowerCase();

        const passwordHash = await bcrypt.hash(password, 10);
        const now = new Date();
        const code = genCode();
        const expiresAt = new Date(now.getTime() + CONFIRM_TTL_HOURS * 3600_000)

        const created = await usersRepository.create({
            login,
            email,
            password: passwordHash,
            isConfirmed: false,
            confirmation: {code, expiresAt, sentAt: now, used: false},
            createdAt: now
        })

        const link = `https://project-five-sand.vercel.app/confirm?code=${encodeURIComponent(code)}`
        try {
            return await emailAdapter.sendEmail(
                email,
                'Подтверждение регистрации',
                `<p>Ваш код: <b>${code}</b></p><p><a href="${link}">${link}</a></p>`
            );
        } catch (e) {
            // Варианты:
            // 1) Логируем и всё равно возвращаем 204 (потом юзер нажмёт "resend")
            // 2) Откатываем пользователя и возвращаем 500
            console.error('sendEmail failed:', e);
            return false;
            // реши стратегию сам; чаще выбирают (1)
        }
    },

    async confirmRegistration(code: string) {
        const user = await usersRepository.findByConfirmationCode(code);

        // validation if user not found
        if (!user) {
            return false;
        }


        const {confirmation} = user;
        const now = new Date();
        if (confirmation?.used) {
            return
        }

        if (confirmation!.expiredAt.getTime() < now.getTime()) {
            return;
        }

        await usersRepository.markConfirmed(user._id);
        return true
    },

    async resendingRegistrationEmail(email: string) {
        email = email.toLowerCase();
        const user = await usersRepository.findByEmail(email);

        if (!user || user.confirmation?.used) {
            return false // ошибку надо оформить
        }

        const now = new Date();
        const code = genCode();
        const expiredAt = new Date(now.getTime() + CONFIRM_TTL_HOURS * 3600_000)

        await usersRepository.setConfirmation(user._id, {code, expiredAt, sentAt: now, used: false});

        const link = `${process.env.APP_BASE_URL}/confirm?code=${encodeURIComponent(code)}`;
        await emailAdapter.sendEmail(
            user.email,
            'Повторное подтверждение регистрации',
            `<p>Новый код: <b>${code}</b></p><p><a href="${link}">${link}</a></p>`
        );

        return true;
    }

}
