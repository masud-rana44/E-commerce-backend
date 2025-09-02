import { Router } from "express";
import { listUsers } from "../controllers/user.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = Router();
router.get("/", protect, restrictTo("admin"), listUsers);
export default router;
