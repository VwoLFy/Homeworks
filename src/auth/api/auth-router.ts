import {Router} from "express";
import {
    emailConfirmationAuthValidation,
    emailResendingAuthValidation,
    getMyInfoAuthValidation,
    loginAuthValidation,
    newPasswordAuthValidation,
    passwordRecoveryAuthValidation,
    registrationAuthValidation
} from "../../main/middlewares/user-auth-validators";
import {refreshTokenValidationMiddleware} from "../../main/middlewares/refreshToken-validation-middleware";
import {container} from "../../main/composition-root";
import {AuthController} from "./auth-controller";

const authController = container.resolve(AuthController)

export const authRouter = Router({})

authRouter.post('/login', loginAuthValidation, authController.loginUser.bind(authController))
authRouter.post('/password-recovery', passwordRecoveryAuthValidation, authController.passwordRecovery.bind(authController))
authRouter.post('/new-password', newPasswordAuthValidation, authController.newPassword.bind(authController))
authRouter.post('/refresh-token', refreshTokenValidationMiddleware, authController.refreshToken.bind(authController))
authRouter.post('/registration', registrationAuthValidation, authController.registration.bind(authController))
authRouter.post('/registration-confirmation', emailConfirmationAuthValidation, authController.registrationConfirmation.bind(authController))
authRouter.post('/registration-email-resending', emailResendingAuthValidation, authController.registrationEmailResending.bind(authController))
authRouter.post('/logout', refreshTokenValidationMiddleware, authController.logout.bind(authController))
authRouter.get('/me', getMyInfoAuthValidation, authController.getMyInfo.bind(authController))