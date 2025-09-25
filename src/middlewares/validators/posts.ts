import {body} from "express-validator";

export const postCreateValidation = [
    body('title')
        .exists().withMessage('title is required')
        .trim()
        .isString().withMessage('title must be a string')
        .isLength({max: 30}).withMessage('title length cannot be more than 30'),

    body('shortDescription')
        .exists().withMessage('shortDescription is required')
        .trim()
        .isString().withMessage('shortDescription must be a string')
        .isLength({max: 100}).withMessage('shortDescription length cannot be more than 30'),

    body('content')
        .exists().withMessage('content is required')
        .trim()
        .isString().withMessage('content must be a string')
        .isLength({max: 1000}).withMessage('content length cannot be more than 30'),

    body('blogId')
        .exists().withMessage('blogId is required')
        .trim()
        .isString().withMessage('blogId must be a string')

]
