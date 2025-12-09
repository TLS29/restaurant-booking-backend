import { verifyToken } from "../utils/jwt";
import { Request, Response, NextFunction } from "express";
import { ERROR_MESSAGES } from "../constants/messages";

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns 401 if token is missing or invalid, otherwise calls next()
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: ERROR_MESSAGES.NO_TOKEN_PROVIDED });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN });
  }
};
