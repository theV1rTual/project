import {CreateUserModel} from "../models/user.model";
import {usersRepository} from "../repositories/users-repository";
import {hashPassword} from "../common/hashing";

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
    }
}
