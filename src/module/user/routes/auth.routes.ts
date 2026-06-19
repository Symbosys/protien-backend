import express from "express";
import { requestOtp, verifyOtp, logout } from "../controller/auth.controller";

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);

export default router;
