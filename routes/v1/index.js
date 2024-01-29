import { Router } from "express";
import users from "../../services/v1/users/index.js";
import products from "../../services/v1/products/index.js";

const router = Router();

router.use("/v1/users", users);
router.use("/v1/products", products);

export default router;
