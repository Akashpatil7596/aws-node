import path from "path";
import { readFileSync } from "fs";
import CommonResponses from "../../../helper/commonResponses.js";
import { uploadFile } from "../../../helper/file-upload.js";
import ProductService from "./product.services.js";

const commonResponse = new CommonResponses();

class ProductController {
    async addProduct(req, res) {
        try {
            const isExist = await ProductService.getOne({ name: req.body.name }, { _id: 1 });

            if (isExist) {
                return commonResponse.Error(res, 404, {}, "PRODUCT_ALREADY_EXISTS");
            }

            if (req?.files?.image) {
                req.body.image = uploadFile("product", req.files.image);
            }

            const saveProduct = await ProductService.create(req.body);

            return commonResponse.Success(res, 200, saveProduct, "PRODUCT_ADDED");
        } catch (error) {
            logger.info("🚀 product.controller.js | line 24 | error", error);
            return commonResponse.InternalError(res, 500, {}, "DEFAULT_INTERNAL_ERROR");
        }
    }

    async getProductsList(req, res) {
        try {
            setTimeout(async () => {
                const productsData = await ProductService.list();

                const __filename = new URL(import.meta.url).pathname;
                const __dirname = path.dirname(__filename);

                const data = productsData.map((product) => {
                    const imagePath = path.join(__dirname, "..", "..", "..", "public", "storage", product.image);

                    const getImageBuffer = readFileSync(imagePath);

                    const convertToBase64Image = new Buffer.from(getImageBuffer).toString("base64");

                    product.image = convertToBase64Image;

                    return product;
                });

                return commonResponse.Success(res, 200, productsData, "PRODUCT_LIST");
            }, 3000);
        } catch (error) {
            logger.info("🚀 product.controller.js | line 24 | error", error);
            return commonResponse.InternalError(res, 500, {}, "DEFAULT_INTERNAL_ERROR");
        }
    }
}

export default ProductController;
