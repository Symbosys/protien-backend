import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../../product/controllre/product.controller";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);


export default router
