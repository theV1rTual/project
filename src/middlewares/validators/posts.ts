import {body} from "express-validator";

export const postCreateValidation = [
    body('title')
        .trim()
        .isString().withMessage('title must be a string')
        .isLength({max: 30}).withMessage('title length cannot be more than 30'),

    body('shortDescription')
        .trim()
        .isString().withMessage('shortDescription must be a string')
        .isLength({max: 100}).withMessage('shortDescription length cannot be more than 30'),

    body('content')
        .trim()
        .isString().withMessage('content must be a string')
        .isLength({max: 1000}).withMessage('content length cannot be more than 30'),

    body('blogId')
        .trim()
        .isString().withMessage('blogId must be a string')

]
