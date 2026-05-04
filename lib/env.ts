import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string({ message: "NEXT_PUBLIC_API_URL is required" })
    .min(1, "NEXT_PUBLIC_API_URL is required")
    .url(
      "NEXT_PUBLIC_API_URL must be a valid URL (e.g. https://api.example.com)",
    )
    .refine(
      (val) =>
        !val.includes("localhost") || process.env.NODE_ENV !== "production",
      "NEXT_PUBLIC_API_URL cannot be localhost in production",
    ),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, msgs]) => `  - ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    console.error(
      `\n❌ Invalid/missing environment variables:\n${errorMessages}\n\n` +
        "Create a .env.local file with the required variables.\n",
    );

    // In production build, fail hard
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing required environment variables. Aborting build.",
      );
    }
  }

  return parsed.success
    ? parsed.data
    : { NEXT_PUBLIC_API_URL: "http://localhost:8000" }; // Dev fallback only
}

export const env = validateEnv();
export const API_URL = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
