import express from "express";
import {
    getAddresses,
    getAddressById,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controller/address.controller.js";
import { protect } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// All address routes require user authentication
router.use(protect);

router.get("/", getAddresses);
router.get("/:id", getAddressById);
router.post("/", addAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.put("/:id/default", setDefaultAddress);

export default router;
