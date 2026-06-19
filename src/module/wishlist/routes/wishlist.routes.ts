import express from "express";
import { getWishlist, toggleWishlistItem } from "../controller/wishlist.controller.js";
import { protect } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all wishlist routes
router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlistItem);

export default router;
