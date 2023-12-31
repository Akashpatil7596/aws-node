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

router.post("/profile", tokenVerification, usersController.getUserByUId);

router.post("/forgot-password", usersValidation.forgotPasswordValidation, usersController.forgotPassword);

router.post("/verify-forgot-password", usersValidation.resendOtpValidation, usersController.verifyForgotPassword);

router.post("/reset-password", usersValidation.resetPasswordValidation, usersController.resetPassword);

router.post("/logout", tokenVerification, usersController.logout);

router.patch("/:id", usersValidation.updateValidation, usersController.updateUserById);

export default router;
