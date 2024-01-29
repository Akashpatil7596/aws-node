import Product from "./product.model.js";

class ProductService {
    static async create(reqBody) {
        try {
            return await new Product(reqBody).save();
        } catch (error) {
            return error;
        }
    }

    static async getOne(query, selectedData) {
        try {
            return await Product.findOne(query, selectedData).lean();
        } catch (error) {
            return error;
        }
    }

    static async list() {
        try {
            return await Product.find();
        } catch (error) {
            return error;
        }
    }
}

export default ProductService;
