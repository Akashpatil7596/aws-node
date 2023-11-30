import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import moment from "moment";
import { generate } from "otp-generator";
import ejs from "ejs";
import path from "path";
import { readFileSync } from "fs";
import { logger } from "../../../helper/logger.js";
import UserServices from "./users.services.js";
import Detail from "../../../config/class.js";
import { uploadFile } from "../../../helper/file-upload.js";
import sendMail from "../../../helper/aws-email.js";
import sendNodeMail from "../../../helper/nodemailer.js";
import CommonFunctions from "../../../helper/commonFunctions.js";
import { VERIFICATION_STATUS } from "../../../helper/constants.js";

class UsersController {
    async createUser(req, res) {
        try {
            req.body.email = req.body.email.toLowerCase();

            const isExist = await UserServices.getOne({ email: req.body.email });

            if (isExist) {
                return res.status(404).json({
                    success: false,
                    message: "Email already registered try with different one",
                });
            }

            if (req?.files?.image) {
                req.body.profile_picture = uploadFile("users", req.files.image);
            }

            req.body.otp = generate(4, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
                digits: true,
            });

            req.body.otp_expiration_time = moment().add(5, "minutes");

            req.body.password = await bcrypt.hash(req.body.password, 8);

            req.body.verification_status = VERIFICATION_STATUS.PENDING;

            const storeUser = await UserServices.store(req.body);

            if (storeUser) {
                /*
                 * This code here Will Use Amazon SES server to send mail
                 */

                //     const emailData = {
                //         from: process.env.SENDER_MAIL,
                //         to: storeUser.email,
                //         template: "Verification-mail",
                //         templateData: {
                //             name: storeUser.username,
                //             otp: storeUser.otp,
                //         },
                //     };

                //     await sendMail(emailData);

                /*
                 * This code here Will Use nodemailer service to send mail
                 */

                let emailData = {};

                const htmlData = {
                    userName: storeUser.username,
                    confirmationCode: storeUser.otp,
                };

                const __filename = new URL(import.meta.url).pathname;
                const __dirname = path.dirname(__filename);

                const templatePath = path.join(__dirname, "../../../", "views", "verification.ejs");

                ejs.renderFile(templatePath, htmlData, function (err, data) {
                    if (err) {
                        console.log("🚀 ~ file: user.controller.js:165 ~ err:", err);
                    } else {
                        emailData = {
                            from: "altair",
                            to: storeUser.email,
                            subject: "Just Testing, Don't Worry!",
                            html: data,
                            headers: {
                                "Content-Type": "text/html",
                            },
                        };
                    }
                });

                sendNodeMail(emailData);
            }

            return res.status(200).json({
                success: true,
                data: storeUser,
                message: "Register successfully",
            });
        } catch (error) {
            logger.info("🚀 user.controller.js | line 88 | error", error);
            return res.status(500).json({
                success: false,
                error: error,
            });
        }
    }

    async verifyUser(req, res) {
        try {
            const { userId, otp } = req.body;

            const user = await UserServices.getOne({ _id: userId });

            const isOtpExpired = new Date(moment().toISOString()) > new Date(moment(user.otp_expiration_time.toISOString()));

            if (isOtpExpired) {
                return res.status(400).json({
                    success: false,
                    message: "Otp provided by you is  expired, try registering process again.",
                });
            }

            const verifyOtp = await CommonFunctions.matchString(otp, user.otp);

            if (!verifyOtp) {
                return res.status(404).json({
                    success: false,
                    message: "Otp provided by you is not valid.",
                });
            }

            const updateUser = await UserServices.updateOne({ _id: userId }, { verification_status: VERIFICATION_STATUS.VERIFIED });

            const apiResonse = new Detail(updateUser);

            return res.status(200).json({
                success: true,
                data: apiResonse,
                message: "User verified successfully",
            });
        } catch (error) {
            logger.info("🚀 user.controller.js | line 130 | error", error);
            return res.status(500).json({
                success: false,
                error: error,
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await UserServices.getOne({ email: email }, { email: 1, username: 1, password: 1, verification_status: 1 });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User Not Found",
                });
            }

            if (user.verification_status !== VERIFICATION_STATUS.VERIFIED) {
                return res.status(400).json({
                    success: false,
                    message: "User Not registered, Verify Your Account First",
                });
            }

            const isVerify = await CommonFunctions.decryptedPassword(password, user.password);

            if (isVerify) {
                user.token = jwt.sign({ id: user._id, name: user.username }, process.env.JWT_SECRET_KEY || "secretkey", { expiresIn: "30d" });

                return res.status(200).json({
                    success: true,
                    data: user,
                    message: "User LoggedIn successfully",
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Password does not match",
                });
            }
        } catch (error) {
            logger.info("🚀 user.controller.js | line 175 | error", error);
            return res.status(500).json({
                success: false,
                error: error,
            });
        }
    }

    async logout(req, res) {
        try {
            return res.status(200).json({
                success: true,
                data: {},
                message: "User LoggedOut successfully",
            });
        } catch (error) {
            logger.info("🚀 user.controller.js | line 191 | error", error);

            return res.status(500).json({
                success: false,
                error: error,
            });
        }
    }

    async getUserByUId(req, res) {
        try {
            const { id } = req.user;

            const user = await UserServices.getOne({ _id: id });

            const __filename = new URL(import.meta.url).pathname;
            const __dirname = path.dirname(__filename);

            const imagePath = path.join(__dirname, "..", "..", "..", "public", "storage", user.profile_picture);

            const getImageBuffer = readFileSync(imagePath);

            const convertToBase64Image = new Buffer.from(getImageBuffer).toString("base64");

            user.profile_picture = convertToBase64Image;

            if (!user) {
                return res.status(404).json({
                    success: false,
                    data: {},
                    message: "User Not Exists",
                });
            }

            return res.status(200).json({
                success: true,
                data: user,
                message: "User LoggedIn successfully",
            });
        } catch (error) {
            logger.info("🚀 user.controller.js | line 251 | error", error);

            return res.status(500).json({
                success: false,
                error: error,
            });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const user = await UserServices.getOne({ email: email }, { email: 1 });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User Not Found",
                });
            }

            req.body.forgot_password_otp = generate(4, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
                digits: true,
            });

            req.body.forgot_password_otp_expiration_time = moment().add(5, "minutes");

            const updateUserWithOtp = await UserServices.updateOne({ _id: user._id }, req.body);

            if (updateUserWithOtp) {
                let emailData = {};

                const htmlData = {
                    userName: updateUserWithOtp.username,
                    confirmationCode: updateUserWithOtp.forgot_password_otp,
                };

                const __filename = new URL(import.meta.url).pathname;
                const __dirname = path.dirname(__filename);

                const templatePath = path.join(__dirname, "../../../", "views", "forgot-password.ejs");

                ejs.renderFile(templatePath, htmlData, function (err, data) {
                    if (err) {
                        console.log("🚀 ~ file: user.controller.js:165 ~ err:", err);
                    } else {
                        emailData = {
                            from: "altair",
                            to: updateUserWithOtp.email,
                            subject: "Just Testing, Don't Worry!",
                            html: data,
                            headers: {
                                "Content-Type": "text/html",
                            },
                        };
                    }
                });

                sendNodeMail(emailData);
            }

            return res.status(200).json({
                success: true,
                data: updateUserWithOtp,
                message: "Forgot password sent successfully",
            });
        } catch (error) {
            logger.info("🚀 user.controller.js | line 322 | error", error);

            return res.status(500).json({
                success: false,
                error: error,
            });
        }
    }

    async verifyForgotPassword(req, res) {
        try {
            const { email, otp } = req.body;

            const user = await UserServices.getOne({ email: email }, { forgot_password_otp: 1, forgot_password_otp_expiration_time: 1 });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    data: {},
                    message: "User Not Exists",
                });
            }

            const isOtpExpired = new Date(moment().toISOString()) > new Date(moment(user.forgot_password_otp_expiration_time.toISOString()));

            if (isOtpExpired) {
                return res.status(400).json({
                    success: false,
                    message: "Otp provided by you is  expired, go to forgot password page.",
                });
            }

            const verifyOtp = await CommonFunctions.matchString(otp, user.forgot_password_otp);

            if (!verifyOtp) {
                return res.status(404).json({
                    success: false,
                    message: "Otp provided by you is not valid.",
                });
            }

            return res.status(200).json({
                success: true,
                data: user,
                message: "Otp Verified Successfully",
            });
        } catch (error) {
            logger.info("🚀 user.controller.js | line 369 | error", error);
            return res.status(500).json({
                success: false,
                error: error,
            });
        }
    }
}

export default UsersController;
