import User from "./users.model.js";

class UserServices {
    static async store(reqData) {
        try {
            return await new User(reqData).save();
        } catch (error) {
            return false;
        }
    }

    static async getOne(query, selectedData) {
        try {
            return await User.findOne(query, selectedData).lean();
        } catch (error) {
            return error;
        }
    }

    static async updateOne(query, updateData) {
        try {
            return await User.findOneAndUpdate(query, updateData, { new: true }).lean();
        } catch (error) {
            return error;
        }
    }
}

export default UserServices;
