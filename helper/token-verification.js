import jwt from "jsonwebtoken";
import UserServices from "../services/v1/users/users.services.js";
import { VERIFICATION_STATUS } from "./constants.js";

const tokenVerification = async (req, res, next) => {
    try {
        const token = req.headers.authorization.replace("Bearer", "").trim();

        const getTokenPayload = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (!err) {
                return decoded;
            }
            return err;
        });

        const userId = getTokenPayload.id;

        const user = await UserServices.getOne({ _id: userId }, { verification_status: 1 });

        if (user && user.verification_status === VERIFICATION_STATUS.VERIFIED) {
            req.user = { id: user._id };
            next();
        } else {
            return res.status(404).json({
                success: false,
                message: "Can't logout, some issue",
            });
        }
    } catch (error) {
        console.log("error | token-verification.js | line 31 : ", error);
    }
};

export default tokenVerification;
