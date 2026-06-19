import express from "express";
import { getCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart } from "../controller/cart.controller.js";
import { protect } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/item/:itemId", updateCartItemQuantity);
router.delete("/item/:itemId", removeCartItem);
router.delete("/clear", clearCart);

export default router;
