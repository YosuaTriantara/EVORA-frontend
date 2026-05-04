import { z } from "zod";

// Enums
export const TransactionStatusEnum = z.enum([
  "PENDING", 
  "PAID", 
  "FAILED", 
  "REFUNDED", 
  "EXPIRED"
]);

export const TransactionTypeEnum = z.enum([
  "REGISTRATION", 
  "VOTE_PURCHASE", 
  "REFUND"
]);

// Main Transaction Schema
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_email: z.string().email(),
  transaction_type: TransactionTypeEnum,
  amount: z.number().positive(),
  status: TransactionStatusEnum,
  payment_proof_url: z.string().url().nullable(),
  payment_provider: z.string().nullable(),
  external_ref_id: z.string().nullable(),
  meta_data: z.object({
    team_id: z.string().uuid().optional(),
    event_id: z.string().uuid().optional(),
    category_id: z.string().uuid().optional(),
    package_id: z.string().uuid().optional(),
  }),
  team_id: z.string().uuid().optional(),
  team_name: z.string().optional(),
  category_name: z.string().optional(),
  verified_by: z.string().uuid().nullable(),
  verified_at: z.string().datetime().nullable(),
  admin_note: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// List Response Schema
export const TransactionListSchema = z.object({
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  data: z.array(TransactionSchema),
});

// Verify Request Schema dengan validasi silang
export const VerifyTransactionRequestSchema = z.object({
  is_approved: z.boolean(),
  admin_note: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validasi: admin_note wajib diisi minimal 10 karakter jika is_approved = false
  if (!data.is_approved && (!data.admin_note || data.admin_note.length < 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Catatan penolakan wajib diisi minimal 10 karakter",
      path: ["admin_note"],
    });
  }
});

// Payment Proof Response Schema
export const PaymentProofSchema = z.object({
  transaction_id: z.string().uuid(),
  proof_url: z.string().url(),
  expires_at: z.string().datetime(),
  filename: z.string(),
  file_size: z.number().int().positive(),
  uploaded_at: z.string().datetime(),
});

// Types
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionList = z.infer<typeof TransactionListSchema>;
export type VerifyTransactionRequest = z.infer<typeof VerifyTransactionRequestSchema>;
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>;
export type TransactionType = z.infer<typeof TransactionTypeEnum>;
export type PaymentProof = z.infer<typeof PaymentProofSchema>;
