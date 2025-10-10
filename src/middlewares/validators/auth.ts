import {body} from "express-validator";
import {UsersService} from "../../bll/users-service";
import {usersRepository} from "../../repositories/users-repository";

export const registerValidation = [
    body('login')
        .exists().withMessage('login is required')
        .bail()
        .trim()
        .notEmpty().withMessage('login is required')
        .bail()
        .isString().withMessage('login must be a string')
        .matches('^[a-zA-Z0-9_-]*$')
        .isLength({max: 10, min: 3}).withMessage('login length cannot be more than 10 and less than 3')
        .bail()
        .custom(async(login: string) => {
            const taken = await usersRepository.findByLogin(login)
            if (taken) {
                throw new Error('login is taken')
            }
            return true;
        }),

    body('email')
        .exists().withMessage('email is required')
        .bail()
        .trim()
        .notEmpty().withMessage('email is required')
        .bail()
        .isString().withMessage('email should be a string')
        .isEmail()
        .bail()
        .custom(async (email: string) => {
            const taken = await usersRepository.findByEmail(email)
            if (taken) {
                throw new Error('email is taken')
            }
            return true
        }),

    body('password')
        .exists().withMessage('password is required')
        .bail()
        .trim()
        .notEmpty().withMessage('password is required')
        .bail()
        .isString().withMessage('password should be a string')
        .isLength({min: 6, max: 20}).withMessage('password length should be more than 6 and less than 20')
]

export const registrationResendValidation = [
    body('email')
        .exists().withMessage('email is required')
        .bail()
        .trim()
        .notEmpty().withMessage('email is required')
        .bail()
        .isString().withMessage('email should be a string')
        .isEmail()
        .bail()
        .custom(async (email: string) => {
            const taken = await usersRepository.findByEmail(email)
            if (taken) {
                throw new Error('email is taken')
            }
            return true
        }),
]

export const registrationConfirmationValidation = [
    body('code')
        .exists().withMessage('email is required')
        .bail()
        .trim()
        .notEmpty().withMessage('email is required')
        .bail()
        .isString().withMessage('email should be a string')
        .custom(async (code: string) => {
            const exists = await usersRepository.findByConfirmationCode(code)
            if (exists) {
                throw new Error('code exists')
            }
            return true;
        })
]
