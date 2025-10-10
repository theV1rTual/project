import {CreateUserModel, UserDbModel, UserModel} from "../models/user.model";
import {usersRepository} from "../repositories/users-repository";
import {hashPassword} from "../common/hashing";
import bcrypt from 'bcrypt'
import {afterEach} from "node:test";
import {randomBytes} from "crypto";
import {emailAdapter} from "../adapters/email.adapter";

function genCode(): string {
    return randomBytes(16).toString('hex')
}

const CONFIRM_TTL_HOURS = 24;
const RESEND_COOLDOWN_MIN = 10;

export const UsersService = {
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

        if (!await usersRepository.findByLogin(login) || !await usersRepository.findByEmail(email)) {
            return false;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const now = new Date();
        const code = genCode();
        const expiresAt = new Date(now.getTime() + CONFIRM_TTL_HOURS + 3600_000)

        const created = await usersRepository.create({
            login,
            email,
            password: passwordHash,
            isConfirmed: false,
            confirmation: {code, expiresAt, sentAt: now, used: false},
            createdAt: now
        })

        const link = `https://project-five-sand.vercel.app/confirm?code=${encodeURIComponent(code)}`
        await emailAdapter.sendEmail(
            email,
            'Подтверждение регистрации',
            `<p>Ваш код: <b>${code}</b></p><p><a href="${link}">${link}</a></p>`
        )

        return true
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
