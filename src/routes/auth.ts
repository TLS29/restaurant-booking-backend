import { Router } from "express";
import { register, login } from "../controllers/auth";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer account
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post("/login", login);

export default router;
