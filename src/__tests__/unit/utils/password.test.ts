import { describe, it, expect } from "@jest/globals";
import { hashPassword, comparePassword } from "../../../utils/password";

describe("Password Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "myPassword123";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const password = "myPassword123";
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const password = "myPassword123";
      const hash = await hashPassword(password);

      const result = await comparePassword("wrongPassword", hash);
      expect(result).toBe(false);
    });
  });
});
