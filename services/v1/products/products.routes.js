import { Router } from "express";

import ProductController from "./product.controller.js";

const router = new Router();
const productController = new ProductController();

router.post("/", productController.addProduct);

router.get("/", productController.getProductsList);

export default router;
