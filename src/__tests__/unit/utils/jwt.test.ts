import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { generateToken, verifyToken } from "../../../utils/jwt";

describe("JWT Utils", () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-key";
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe("generateToken", () => {
    it("should generate a valid token", () => {
      const payload = { userId: "123", role: "customer" };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should throw error if JWT_SECRET is not defined", () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateToken({ userId: "123", role: "customer" })).toThrow(
        "JWT_SECRET is not defined"
      );

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const payload = { userId: "123", role: "customer" };
      const token = generateToken(payload);

      const decoded = verifyToken(token);

      expect(decoded.userId).toBe("123");
      expect(decoded.role).toBe("customer");
    });

    it("should throw error for invalid token", () => {
      expect(() => verifyToken("invalid-token")).toThrow();
    });

    it("should throw error if JWT_SECRET is not defined", () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => verifyToken("any-token")).toThrow(
        "JWT_SECRET is not defined"
      );

      process.env.JWT_SECRET = originalSecret;
    });
  });
});
