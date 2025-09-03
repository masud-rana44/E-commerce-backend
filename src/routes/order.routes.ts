import { Router } from "express";
import {
  createOrder,
  listOrders,
  myOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = Router();
router.post("/", protect, createOrder);
router.get("/me", protect, myOrders);
router.get("/", protect, restrictTo("admin"), listOrders);
router.patch("/:id/status", protect, restrictTo("admin"), updateOrderStatus);
export default router;
