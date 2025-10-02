import {body} from "express-validator";

const WEBSITE_RE = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export const blogCreateValidation = [
    body('name')
        .exists().withMessage('name is required')
        .trim()
        .notEmpty().withMessage('name is required')
        .isString().withMessage('name must be a string')
        .isLength({max: 15}).withMessage('name length cannot be more than 15'),

    body('description')
        .exists().withMessage('description is required')
        .trim()
        .notEmpty().withMessage('description is required')
        .isString().withMessage('description must be a string')
        .isLength({max: 500}).withMessage('description length cannot be more than 500'),

    body('websiteUrl')
        .exists().withMessage('websiteUrl is required')
        .trim()
        .notEmpty().withMessage('websiteUrl is required')
        .isString().withMessage('websiteUrl must be a string')
        .isLength({max: 100}).withMessage('websiteUrl length cannot be more than 100')
        .matches(WEBSITE_RE).withMessage('websiteUrl should be a valid https URL')

]

export const blogPostCreateValidation = [
    body('title')
        .exists().withMessage('title is required')
        .trim()
        .notEmpty().withMessage('title is required')
        .isString().withMessage('title must be a string')
        .isLength({max: 30}).withMessage('title length cannot be more than 30'),

    body('shortDescription')
        .exists().withMessage('shortDescription is required')
        .trim()
        .notEmpty().withMessage('shortDescription is required')
        .isString().withMessage('shortDescription must be a string')
        .isLength({max: 100}).withMessage('shortDescription length cannot be more than 30'),

    body('content')
        .exists().withMessage('content is required')
        .trim()
        .notEmpty().withMessage('content is required')
        .isString().withMessage('content must be a string')
        .isLength({max: 1000}).withMessage('content length cannot be more than 30'),
]
