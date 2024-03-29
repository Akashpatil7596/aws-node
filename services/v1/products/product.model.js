import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Product = model("Product", ProductSchema);

export default Product;
