import {Request, Response, Router} from "express";
import {TypeDeviceViewModel} from "../models/DeviceViewModel";
import {securityQueryRepo} from "../repositories/security-queryRepo";
import {HTTP_Status} from "../types/enums";
import {jwtService} from "../application/jwt-service";
import {securityService} from "../domain/security-service";
import {RequestWithParam} from "../types/types";

export const securityRouter = Router({})

securityRouter.get('/security/devices', async (req: Request, res: Response<TypeDeviceViewModel[]>) => {
    const userId = await jwtService.getUserIdByRefreshToken(req.cookies.refreshToken)
    if (!userId) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
    const foundDevices = await securityQueryRepo.findUserDevices(userId)
    if (!foundDevices) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
    return res.status(HTTP_Status.OK_200).json(foundDevices)
})
securityRouter.delete('/security/devices', async (req: Request, res: Response) => {
    const sessionData = await jwtService.getSessionDataByRefreshToken(req.cookies.refreshToken)
    if (!sessionData) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
    const isDeletedSessions = await securityService.deleteSessions(sessionData.userId, sessionData.deviceId)
    if (!isDeletedSessions) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
    return res.sendStatus(HTTP_Status.NO_CONTENT_204)
})
securityRouter.delete('/security/devices/:id', async (req: RequestWithParam, res: Response) => {
    const sessionData = await jwtService.getSessionDataByRefreshToken(req.cookies.refreshToken)
    if (!sessionData) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
    const result = await securityService.deleteSessionByDeviceId(sessionData.userId, req.params.id)
    if (!result) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
    return res.sendStatus(result as HTTP_Status)
})