import { apiGet, apiPatch } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import {
  TransactionListSchema,
  TransactionSchema,
  VerifyTransactionRequestSchema,
} from "@/lib/validation/schemas/transaction.schema";

export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionsList = z.infer<typeof TransactionListSchema>;
const VerifyTransactionResponseSchema = z.object({
  message: z.string(),
  transaction_id: z.string().uuid(),
  new_status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "EXPIRED"]),
  team_id: z.string().uuid(),
});

/**
 * Get all transactions across all events (platform admin view)
 * @param params Query parameters (skip, limit, status, event_id)
 * @returns Paginated list of transactions
 */
export async function getAllTransactions(
  params?: { skip?: number; limit?: number; status?: string; event_id?: string }
): Promise<TransactionsList> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  if (params?.event_id) query.set("event_id", params.event_id);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/transactions${queryString}`);
  return parseApiResponse(TransactionListSchema, data, "getAllTransactions");
}

/**
 * Get transactions for a specific event
 * @param eventId Event ID
 * @param params Query parameters (skip, limit, status)
 * @returns Paginated list of transactions
 */
export async function getEventTransactions(
  eventId: string,
  params?: { skip?: number; limit?: number; status?: string }
): Promise<TransactionsList> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}/transactions${queryString}`);
  return parseApiResponse(TransactionListSchema, data, "getEventTransactions");
}

export type VerifyTransactionRequest = z.infer<typeof VerifyTransactionRequestSchema>;

/**
 * Verify (approve or reject) a payment transaction
 * @param transactionId Transaction ID
 * @param payload Verification data
 * @returns Updated transaction
 */
export async function verifyTransaction(
  transactionId: string,
  payload: VerifyTransactionRequest
): Promise<z.infer<typeof VerifyTransactionResponseSchema>> {
  const validatedPayload = VerifyTransactionRequestSchema.parse(payload);
  const data = await apiPatch<unknown>(`/superadmin/transactions/${transactionId}/verify`, validatedPayload);
  return parseApiResponse(VerifyTransactionResponseSchema, data, "verifyTransaction");
}
