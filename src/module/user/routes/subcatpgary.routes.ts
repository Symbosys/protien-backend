import express from "express"
import { getAllCategory, getByIdSubCategory, subCatogaryCreate, updateSubCategory, deleteSubCategory } from "../../sub-category/subcategory.controller";

const router = express.Router();

router.get("/", getAllCategory);
router.post("/", subCatogaryCreate);
router.get("/:id", getByIdSubCategory);
router.put("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);


export default router 