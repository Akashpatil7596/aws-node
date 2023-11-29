import { Router } from "express";
import users from "../../services/v1/users/index.js";

const router = Router();

router.use("/v1/users", users);

export default router;
