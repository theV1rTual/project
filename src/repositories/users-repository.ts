import {usersRouter} from "../routers/users-router";
import {usersCollection} from "./db";
import {CreateUserModel, UserDbModel, UserModel} from "../models/user.model";
import {ObjectId} from 'mongodb';
import {UsersService} from "../bll/users-service";
import {hashPassword, verifyPassword} from "../common/hashing";

const USERS_SORTABLE_FIELDS = new Set(['login', 'email', 'createdAt', 'id', '_id'])

const mapUser = (doc: any): UserModel => ({
    id: doc._id.toString(),
    email: doc.email,
    login: doc.login,
    createdAt: doc.createdAt
})

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export const usersRepository = {
    async findAllUsers(params: {
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number,
        searchLoginTerm: string,
        searchEmailTerm: string
    }) {
        const { sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm } = params;

        const or: any[] = [];
        if (searchEmailTerm && searchEmailTerm.trim()) {
            or.push({login: {$regex: searchLoginTerm.trim(), $options: 'i'}})
        }
        if (searchEmailTerm && searchEmailTerm.trim()) {
            or.push({email: {$regex: searchEmailTerm.trim(), $options: 'i'}})
        }

        const filter = or.length ? {$or: or} : {}

        const sortField = USERS_SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt';
        const sortValue = sortDirection === 'asc' ? 1 : -1;

        const sortSpec: Record<string, 1 | - 1> = {
            [sortField === 'id' ? '_id' : sortField]: sortValue
        }
        if (sortField !== 'createdAt') sortSpec['createdAt'] = sortValue
        sortSpec['_id'] = sortValue;

        const totalCount = await usersCollection.countDocuments(filter);

        const docs = await usersCollection.find(filter)
            .sort(sortSpec)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        return {
            pagesCount: Math.ceil(totalCount/pageSize) || 0,
            page: pageNumber,
            pageSize,
            totalCount,
            items: docs.map(mapUser)
        }
    },

    async findById(id: string) {
        return usersCollection.findOne({ _id: new ObjectId(id) });
    },

    async findByLogin(login: string) {
        return usersCollection.findOne({ login });
    },

    async findByEmail(email: string): Promise<UserDbModel | null> {
        return usersCollection.findOne({ email });
    },

    async findByConfirmationCode(code: string): Promise<UserDbModel | null>   {
        return usersCollection.findOne({'confirmation.code': code})
    },

    async findByLoginOrEmail(loginOrEmail: string) {
        return usersCollection.findOne({
            $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
        });
    },

    async login(params: {loginOrEmail: string, password: string}): Promise<boolean> {
        const q = params.loginOrEmail?.trim();
        const p = params.password;
        if (!q || !p) return false;

        const rx = new RegExp(`^${escapeRe(q)}$`, 'i');
        const user = await usersCollection.findOne({ $or: [{ login: rx }, { email: rx }] });
        if (!user?.password) return false;

        return verifyPassword(p, user.password);
    },

    async deleteUser(id: string) {
        if (!ObjectId.isValid(id)) return false;

        const result = await usersCollection.deleteOne({_id: new ObjectId(id)})

        return result.deletedCount === 1;
    },

    async create(data: {login: string, password: string, email: string, isConfirmed: boolean, confirmation: {code: string, expiresAt: Date, sentAt: Date, used: boolean}, createdAt: Date}): Promise<UserModel> {
        const doc: UserDbModel = {
            _id: new ObjectId(),
            createdAt: new Date(),
            login: data.login,
            email: data.email,
            password: data.password
        }

        const {insertedId} = await usersCollection.insertOne(doc);
        const created = await usersCollection.findOne({_id: insertedId})

        return mapUser(created)
    },

    async markConfirmed(_id: ObjectId) {
        await usersCollection.updateOne(
            { _id},
            {$set: {isConfirmed: true}, $unset: { confirmation: '' }}
        )
    },

    async setConfirmation(userId: ObjectId, payload: NonNullable<UserDbModel['confirmation']>) {
        await usersCollection.updateOne(
            {_id: userId},
            {$set: {confirmation: payload}}
        )
    }
}
