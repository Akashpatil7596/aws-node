import { Router } from "express";
import UserValidation from "./users.validation.js";
import UsersController from "./users.controller.js";
import tokenVerification from "../../../helper/token-verification.js";

const router = Router();
const usersController = new UsersController();
const usersValidation = new UserValidation();

router.post("/registeration", usersValidation.registerValidation, usersController.createUser);

router.post("/verify-user", usersValidation.verifyValidation, usersController.verifyUser);

router.post("/login", usersValidation.loginValidation, usersController.login);

router.post("/logout", tokenVerification, usersController.logout);

export default router;
