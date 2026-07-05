import express from "express";
import {
  createBrand,
  getAllBrands,
  getBrandById,
  getBrandBySlug,
  updateBrand,
  deleteBrand,
  getBrandProducts,
} from "../controller/brand.controller.js";
import { protect } from "../../../middleware/auth.middleware.js";
import upload from "../../../utils/multer.js";

const router = express.Router();

router.post("/", protect, upload.single("logo"), createBrand);
router.get("/", getAllBrands);
router.get("/:id", getBrandById);
router.get("/slug/:slug", getBrandBySlug);
router.put("/:id", protect, upload.single("logo"), updateBrand);
router.delete("/:id", protect, deleteBrand);
router.get("/:id/products", getBrandProducts);

export default router;
