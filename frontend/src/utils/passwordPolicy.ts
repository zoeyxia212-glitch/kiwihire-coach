/**
 * Client-side mirror of the backend password policy
 * (backend/src/main/java/com/kiwihirecoach/backend/dto/RegisterRequest.java
 * and ChangePasswordRequest.java): at least 8 characters, including an
 * uppercase letter, a lowercase letter, and a number. Checked here too so
 * the user gets immediate feedback instead of a round trip to the server;
 * the backend remains the source of truth and re-validates independently.
 */

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_HELP_TEXT =
  "At least 8 characters, including an uppercase letter, a lowercase letter, and a number.";

export type PasswordValidationResult =
  | { isValid: true }
  | { isValid: false; message: string };

export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must include a lowercase letter.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must include an uppercase letter.",
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must include a number.",
    };
  }

  return { isValid: true };
}
