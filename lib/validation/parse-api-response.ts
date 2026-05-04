import { ZodSchema } from 'zod';

/**
 * Parse API response with Zod validation
 * Throws in development to catch contract drift early
 * Logs warning in production and returns raw data as graceful fallback
 */
export function parseApiResponse<T>(
  schema: ZodSchema<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten();
    if (process.env.NODE_ENV === 'development') {
      // Throw in dev to catch contract drift immediately
      throw new Error(`[Zod] API validation failed in ${context}: ${JSON.stringify(errors)}`);
    }
    // In production: log warning and return raw data as graceful fallback
    console.warn(`[Zod] Validation warning in ${context}:`, errors);
    return data as T;
  }
  return result.data;
}
