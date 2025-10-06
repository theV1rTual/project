import {body} from "express-validator";

export const commentCreateValidator = [
    body('content')
        .exists().withMessage('content is required')
        .trim()
        .notEmpty().withMessage('content is required')
        .isString().withMessage('content must be a string')
        .isLength({max: 300, min: 20}).withMessage('content length cannot be more than 300 and less than 20'),
]
