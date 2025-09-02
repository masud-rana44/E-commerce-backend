import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/product.controller";
import { protect, restrictTo } from "../middlewares/auth";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) =>
    cb(null, path.join(process.cwd(), "src", "uploads")),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = Router();
router.get("/", listProducts);
router.get("/:id", getProduct);
router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.array("images", 6),
  createProduct
);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  upload.array("images", 6),
  updateProduct
);
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);
export default router;
