import express from "express";
import { 
  updateOrderStatus, 
  updatePaymentStatus,
  getAllOrders,
  getOrderById,
  shipOrderViaIthink,
  initiateAdminReturnOrder,
  updateAdminOrderAddress
} from "../controller/order.controller.js";
import {
  createUserOrder,
  verifyPayment,
  getMyOrders,
  getUserOrderById,
  cancelUserOrder,
  trackOrderDetails,
  returnUserOrder,
  updateUserOrderAddress
} from "../controller/user.order.controller.js";
import { protect } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Public Order Tracking route
router.get("/track/:orderNumber", trackOrderDetails);

// User facing checkout/my-orders routes require authentication
router.post("/checkout", protect, createUserOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getUserOrderById);
router.put("/:id/cancel", protect, cancelUserOrder);
router.put("/:id/return", protect, returnUserOrder);
router.put("/:id/address", protect, updateUserOrderAddress);

// Vendor/Admin management routes
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/payment", updatePaymentStatus);
router.post("/:id/ithink-ship", shipOrderViaIthink);
router.post("/:id/ithink-return", initiateAdminReturnOrder);
router.put("/:id/admin-address", updateAdminOrderAddress);

export default router;
