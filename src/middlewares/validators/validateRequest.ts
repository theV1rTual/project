import e, {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";


export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const errorsMessages = result.array({onlyFirstError: true}).map(err => ({
        message: err.msg,
        field: err.type === 'field' ? err.path : 'unknown'
    }))

    return res.status(400).json({errorsMessages})
}
