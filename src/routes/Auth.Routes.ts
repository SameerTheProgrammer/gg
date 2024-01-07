import exprees, { NextFunction, Request, Response } from "express";

import { AuthController } from "../controllers/Auth.Controller";

import { UserService } from "../services/User.Service";
import { TokenService } from "../services/Token.Service";

import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";

import { User } from "../entity/User.entity";
import { RefreshToken } from "../entity/RefreshToken.entity";

import { registerValidation } from "../validators/register.validator";
import { loginValidation } from "../validators/login.validator";
import { CredentialService } from "./../services/Credential.Service";

const router = exprees.Router();

const userRespository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

const tokenService = new TokenService(refreshTokenRepository);
const userService = new UserService(userRespository);
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    credentialService,
    tokenService,
    logger,
);

router
    .route("/register")
    .post(
        registerValidation,
        (req: Request, res: Response, next: NextFunction) =>
            authController.register(req, res, next),
    );

router
    .route("/login")
    .post(loginValidation, (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
    );

export default router;
