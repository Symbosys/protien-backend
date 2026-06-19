import express from "express"
import { categoryCreate, getAllcategory, UpdateCategory, getById, deleteCategory } from "../../category/controller/category.controller.js";

const router = express.Router();

router.get("/", getAllcategory);
router.post("/", categoryCreate);
router.get("/:id", getById);
router.put("/:id", UpdateCategory);
router.delete("/:id", deleteCategory);

export default router;