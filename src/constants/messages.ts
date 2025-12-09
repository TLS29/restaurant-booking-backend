/**
 * Centralized message constants for the application
 * Ensures consistency and makes i18n easier in the future
 */

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  NO_TOKEN_PROVIDED: "No token provided",
  INVALID_TOKEN: "Invalid token",

  // Authorization
  SUPER_ADMIN_ONLY: "Access denied. Super admin only.",

  // Generic
  VALIDATION_ERROR: "Validation error",
  INTERNAL_SERVER_ERROR: "Internal server error",

  // Owner
  OWNER_NOT_FOUND: "Owner not found",
} as const;

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: "User registered successfully",
  USER_LOGGED_IN: "User logged in successfully",
  OWNER_CREATED: "Owner created successfully",
  OWNER_UPDATED: "Owner updated successfully",
  OWNER_DEACTIVATED: "Owner deactivated successfully",
} as const;
