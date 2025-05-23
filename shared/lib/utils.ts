import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Parses server-side validation errors, expecting a specific shape.
 *
 * @param error - The error object, potentially containing field-specific errors.
 * @param fallbackMessage - A fallback message if the error shape is not recognized or fieldErrors is empty.
 * @returns A record of field names to error messages, or null if no specific field errors are found and no fallback is desired.
 */
export function parseServerFieldErrors(
  error: any,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): Record<string, string> | null {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "fieldErrors" in error.response.data &&
    error.response.data.fieldErrors &&
    typeof error.response.data.fieldErrors === "object"
  ) {
    const fieldErrors = error.response.data.fieldErrors as Record<string, string[] | string>;
    const parsedErrors: Record<string, string> = {};
    let hasFieldErrors = false;

    for (const field in fieldErrors) {
      if (Object.prototype.hasOwnProperty.call(fieldErrors, field)) {
        const message = Array.isArray(fieldErrors[field])
          ? (fieldErrors[field] as string[]).join(", ")
          : fieldErrors[field] as string;
        if (message) {
          parsedErrors[field] = message;
          hasFieldErrors = true;
        }
      }
    }
    if (hasFieldErrors) {
      return parsedErrors;
    }
  }
  // If no specific field errors were parsed, return a generic error for a general message display
  // or null if the caller prefers to handle this case specifically.
  // For this prompt, we will return a generic error if no specific field errors are found.
  return { general: fallbackMessage };
}
