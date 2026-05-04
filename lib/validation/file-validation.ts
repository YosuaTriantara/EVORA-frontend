/**
 * File validation utilities for EVORA
 * Used for payment proof uploads and other file operations
 */

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a file for upload
 * Default: 5MB max, JPG/PNG/PDF only
 */
export function validateUploadFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const maxSize = options.maxSizeBytes ?? 5 * 1024 * 1024; // 5 MB default
  const allowedTypes = options.allowedMimeTypes ?? [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (file.size > maxSize) {
    const maxMB = (maxSize / 1024 / 1024).toFixed(0);
    const fileMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File too large (${fileMB} MB). Maximum allowed: ${maxMB} MB.`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    const typeNames = allowedTypes.map((t) => {
      if (t === "image/jpeg" || t === "image/jpg") return "JPG";
      if (t === "image/png") return "PNG";
      if (t === "application/pdf") return "PDF";
      return t;
    });
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Accepted: ${typeNames.join(", ")}.`,
    };
  }

  return { valid: true };
}
