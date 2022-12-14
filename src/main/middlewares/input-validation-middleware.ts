import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import {HTTP_Status} from "../types/enums";

type ErrorType = {
    message: string
    field: string
}
export type ErrorResultType = {
    errorsMessages: Array<ErrorType>
}
const apiErrorResult: ErrorResultType = {
    errorsMessages: []
}

export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const newRes = validationResult.withDefaults({
        formatter: error => {
            return {
                message: error.msg,
                field: error.param
            }
        }
    })
    apiErrorResult.errorsMessages = newRes(req).array({onlyFirstError: true})

    if (apiErrorResult.errorsMessages.length > 0) {
        return res.status(HTTP_Status.BAD_REQUEST_400).json(apiErrorResult);
    } else {
        next()
    }
}