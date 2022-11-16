import {NextFunction, Request, Response} from "express";
import {atob} from "buffer";
import {jwtService} from "../application/jwt-service";
import {HTTP_Status} from "../enums";

export const checkAuthorizationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
    if (authorization.startsWith("Basic")) {
        try {
            const [login, pass] = atob(authorization.split(" ")[1]).split(":");
            if (login !== "admin" || pass !== "qwerty") {
                return res.sendStatus(HTTP_Status.UNAUTHORIZED_401);
            } else {
                next();
                return
            }
        } catch (e) {
            return res.sendStatus(HTTP_Status.UNAUTHORIZED_401);
        }
    } else if (authorization.startsWith("Bearer")) {
        const token = authorization.split(" ")[1]
        const userId = await jwtService.getUserIdByToken(token)
        if (!userId) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
        req.userId = userId
        next()
        return
    } else {
        return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
    }
}