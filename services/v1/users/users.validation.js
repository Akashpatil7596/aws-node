import Joi from "joi";
import JoiObjectId from "joi-objectid";
const myJoiObjectId = JoiObjectId(Joi);

class UsersValidation {
    async registerValidation(req, res, next) {
        try {
            const Schema = Joi.object().keys({
                username: Joi.string().required(),
                email: Joi.string().lowercase().required().email(),
                password: Joi.string().required(),
                confirm_password: Joi.any().valid(Joi.ref("password")).required(),
                image: Joi.any(),
            });

            const result = Schema.validate(req.body);

            if (result.hasOwnProperty("error")) {
                return res.json({
                    success: false,
                    error: result.error.details[0].message,
                });
            } else {
                next();
            }
        } catch (error) {
            return error;
        }
    }

    async verifyValidation(req, res, next) {
        try {
            const Schema = Joi.object().keys({
                userId: myJoiObjectId().required(),
                otp: Joi.string().required(),
            });

            const result = Schema.validate(req.body);

            if (result.hasOwnProperty("error")) {
                return res.json({
                    success: false,
                    error: result.error.details[0].message,
                });
            } else {
                next();
            }
        } catch (error) {
            return error;
        }
    }

    async loginValidation(req, res, next) {
        try {
            const Schema = Joi.object().keys({
                email: Joi.string().lowercase().required().email(),
                password: Joi.string().required(),
            });

            const result = Schema.validate(req.body);

            if (result.hasOwnProperty("error")) {
                return res.json({
                    success: false,
                    error: result.error.details[0].message,
                });
            } else {
                next();
            }
        } catch (error) {
            return error;
        }
    }
}

export default UsersValidation;
