import bcrypt from "bcrypt";

/**
 * Hashes a plain text password using bcrypt
 *
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plain text password with a hashed password
 *
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
