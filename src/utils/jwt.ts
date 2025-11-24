import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: string;
}

/**
 * Generates a JWT token with user information
 *
 * @param payload - Token payload containing userId and role
 * @returns Signed JWT token string
 * @throws {Error} If JWT_SECRET is not defined in environment variables
 */
export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, secret, { expiresIn }) as string;
};

/**
 * Verifies and decodes a JWT token
 *
 * @param token - JWT token string to verify
 * @returns Decoded token payload
 * @throws {Error} If JWT_SECRET is not defined or token is invalid/expired
 */
export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.verify(token, secret) as TokenPayload;
};
