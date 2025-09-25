import {body} from "express-validator";

const WEBSITE_RE = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export const blogCreateValidation = [
    body('name')
        .trim()
        .isString().withMessage('name must be a string')
        .isLength({max: 15}).withMessage('name length cannot be more than 15'),

    body('description')
        .trim()
        .isString().withMessage('description must be a string')
        .isLength({max: 500}).withMessage('description length cannot be more than 500'),

    body('websiteUrl')
        .trim()
        .isString().withMessage('websiteUrl must be a string')
        .isLength({max: 100}).withMessage('websiteUrl length cannot be more than 100')
        .matches(WEBSITE_RE).withMessage('websiteUrl should be a valid https URL')

]
