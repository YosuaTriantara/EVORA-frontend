"use server";

import { apiGet, apiPatch } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import {
  TransactionListSchema,
  TransactionSchema,
  VerifyTransactionRequestSchema,
  PaymentProofSchema,
  type VerifyTransactionRequest,
  type Transaction,
  type TransactionList,
  type PaymentProof,
} from "@/lib/validation/schemas/transaction.schema";

/**
 * Get transactions for a specific event (Organizer-scoped)
 * GET /api/v1/events/{event_id}/transactions
 */
export async function getEventTransactions(
  eventId: string,
  params?: {
    skip?: number;
    limit?: number;
    status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "EXPIRED";
    transaction_type?: "REGISTRATION" | "VOTE_PURCHASE";
  }
): Promise<TransactionList> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  if (params?.transaction_type) query.set("transaction_type", params.transaction_type);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/events/${eventId}/transactions${queryString}`);
  return parseApiResponse(TransactionListSchema, data, "getEventTransactions");
}

/**
 * Verify (approve/reject) a payment transaction
 * PATCH /api/v1/events/{event_id}/transactions/{transaction_id}/verify
 */
export async function verifyTransaction(
  eventId: string,
  transactionId: string,
  payload: VerifyTransactionRequest
): Promise<Transaction> {
  // Validate request
  VerifyTransactionRequestSchema.parse(payload);
  
  // Additional validation: admin_note required for rejection
  if (!payload.is_approved && (!payload.admin_note || payload.admin_note.length < 10)) {
    throw new Error("Catatan penolakan wajib diisi minimal 10 karakter");
  }
  
  const data = await apiPatch<unknown>(
    `/events/${eventId}/transactions/${transactionId}/verify`,
    payload
  );
  return parseApiResponse(TransactionSchema, data, "verifyTransaction");
}

/**
 * Get secure payment proof URL (signed, temporary)
 * GET /api/v1/events/{event_id}/transactions/{transaction_id}/proof
 */
export async function getPaymentProof(
  eventId: string,
  transactionId: string
): Promise<PaymentProof> {
  const data = await apiGet<unknown>(
    `/events/${eventId}/transactions/${transactionId}/proof`
  );
  return parseApiResponse(PaymentProofSchema, data, "getPaymentProof");
}
