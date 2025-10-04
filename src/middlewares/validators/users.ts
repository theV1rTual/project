import {body} from "express-validator";

export const userCreateValidation = [
    body('login')
        .exists().withMessage('login is required')
        .trim()
        .notEmpty().withMessage('login is required')
        .isString().withMessage('login must be a string')
        .matches('/^[a-zA-Z0-9._-]+$/').withMessage('login pattern does not match')
        .isLength({max: 10, min: 3}).withMessage('login length cannot be more than 30'),

    body('password')
        .exists().withMessage('password is required')
        .trim()
        .notEmpty().withMessage('password is required')
        .isString().withMessage('password must be a string')
        .isLength({max: 20, min: 6}),

    body('email')
        .exists().withMessage('email is required')
        .trim()
        .notEmpty().withMessage('email is required')
        .isString().withMessage('email mush be a string')
        .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$').withMessage('email pattern does not match')


]
