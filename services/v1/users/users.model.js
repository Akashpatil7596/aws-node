import mongoose, { Schema, Model } from "mongoose";
import { VERIFICATION_STATUS } from "../../../helper/constants.js";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        select: false,
    },
    profile_picture: {
        type: String,
    },
    otp: {
        type: String,
    },
    otp_expiration_time: {
        type: Date,
    },
    verification_status: {
        type: String,
        enum: Object.values(VERIFICATION_STATUS),
        required: true,
    },
});

const User = mongoose.model("User", UserSchema);

export default User;
