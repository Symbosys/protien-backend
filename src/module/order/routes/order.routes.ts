import express from "express";
import { 
  updateOrderStatus, 
  updatePaymentStatus,
  getAllOrders,
  getOrderById
} from "../controller/order.controller.js";
import {
  createUserOrder,
  verifyPayment,
  getMyOrders,
  getUserOrderById,
  cancelUserOrder
} from "../controller/user.order.controller.js";
import { protect } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// User facing checkout/my-orders routes require authentication
router.post("/checkout", protect, createUserOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getUserOrderById);
router.put("/:id/cancel", protect, cancelUserOrder);

// Vendor/Admin management routes (currently open for dashboard integration)
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/payment", updatePaymentStatus);

export default router;

