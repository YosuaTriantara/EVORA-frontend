"use server";

import { apiGet, apiPost } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";

const PurchaseTransactionSchema = z.object({
  transaction_id: z.string().uuid(),
  package_id: z.string().uuid(),
  points_amount: z.number().int().positive(),
  amount_idr: z.number().int().positive(),
  status: z.enum(["PENDING", "PAID", "FAILED", "EXPIRED"]),
  payment_provider: z.string(),
  payment_token: z.string().optional(),
  redirect_url: z.string().url().optional(),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

const PurchaseStatusSchema = z.object({
  transaction_id: z.string().uuid(),
  status: z.enum(["PENDING", "PAID", "FAILED", "EXPIRED"]),
  package_id: z.string().uuid(),
  points_amount: z.number().int().positive(),
  amount_idr: z.number().int().positive(),
  paid_at: z.string().datetime().nullable(),
  payment_method: z.string(),
  failure_reason: z.string().nullable(),
  retry_available: z.boolean(),
});

/**
 * Initiate vote points purchase
 * POST /api/v1/votes/purchase
 * 
 * Backend: Endpoint #13 (MEDIUM)
 */
export async function initiatePurchase(
  packageId: string,
  paymentMethod: "midtrans" | "xendit" | "manual_transfer",
  eventId: string
) {
  const data = await apiPost<unknown>("/votes/purchase", {
    package_id: packageId,
    payment_method: paymentMethod,
    event_id: eventId,
  });
  return parseApiResponse(PurchaseTransactionSchema, data, "initiatePurchase");
}

/**
 * Check purchase status
 * GET /api/v1/votes/purchase/{transaction_id}/status
 * 
 * Backend: Endpoint #14 (MEDIUM)
 */
export async function checkPurchaseStatus(transactionId: string) {
  const data = await apiGet<unknown>(`/votes/purchase/${transactionId}/status`);
  return parseApiResponse(PurchaseStatusSchema, data, "checkPurchaseStatus");
}
