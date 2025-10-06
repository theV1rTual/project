import {CreateUserModel, UserDbModel, UserModel} from "../models/user.model";
import {usersRepository} from "../repositories/users-repository";
import {hashPassword} from "../common/hashing";
import bcrypt from 'bcrypt'


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
}
