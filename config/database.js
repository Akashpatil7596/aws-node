import mongoose, { mongo } from "mongoose";

const mongo_connection = async (uri) => {
    await mongoose.connect(uri, {
        useNewUrlParser: true,
    });
    console.log("Database connected successfully!!!");
};

export default mongo_connection;
