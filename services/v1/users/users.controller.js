import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import moment from "moment";
import { generate } from "otp-generator";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
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
                let emailData = {};

                const htmlData = {
                    userName: storeUser.username,
                    confirmationCode: storeUser.otp,
                };

                const __filename = new URL(import.meta.url).pathname;
                const __dirname = path.dirname(__filename);

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
                user.token = jwt.sign({ id: user._id, name: user.username }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });

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
            console.log("error", error);
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
                message: "User LoggedIn successfully",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error,
            });
        }
    }
}

export default UsersController;
