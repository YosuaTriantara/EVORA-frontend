import { NextRequest, NextResponse } from "next/server";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { CastVoteDetailedResponseSchema } from "@/lib/validation/schemas/voting.schema";
import { randomUUID } from "crypto";

// Backend API URL from environment
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000/api/v1";

/**
 * BFF API Route for casting votes
 * POST /api/vote/cast
 * 
 * This route:
 * 1. Generates idempotency key server-side (security)
 * 2. Forwards request to backend with Idempotency-Key header
 * 3. Returns parsed response
 * 
 * Security:
 * - Idempotency key generated server-side prevents client manipulation
 * - Rate limiting handled by backend (5 votes/min per user)
 * - Atomic transaction on backend (deduct balance + record vote)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { candidate_id, points, event_id } = body;

    // Validate required fields
    if (!candidate_id || !points || !event_id) {
      return NextResponse.json(
        { message: "Missing required fields: candidate_id, points, event_id" },
        { status: 400 }
      );
    }

    // Generate idempotency key server-side (UUID v4)
    const idempotencyKey = randomUUID();

    // Get auth token from request cookie
    const cookie = request.headers.get("cookie");
    
    // Forward to backend with idempotency key header
    const backendResponse = await fetch(`${BACKEND_URL}/voting/votes/cast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        ...(cookie ? { "Cookie": cookie } : {}),
      },
      body: JSON.stringify({
        candidate_id,
        event_id,
        points,
      }),
    });

    // Handle no-content responses (204)
    if (backendResponse.status === 204) {
      return NextResponse.json(
        { message: "Vote berhasil dicatat" },
        { status: 200 }
      );
    }

    // Parse response body
    let response: unknown;
    try {
      response = await backendResponse.json();
    } catch {
      throw new Error(`HTTP ${backendResponse.status}: Empty response`);
    }

    // Handle backend errors
    if (!backendResponse.ok) {
      const errorMessage =
        typeof response === "object" && response !== null && "detail" in response
          ? String((response as { detail: unknown }).detail)
          : `HTTP ${backendResponse.status}`;
      throw new Error(errorMessage);
    }

    // Parse and validate response
    const parsedResponse = parseApiResponse(
      CastVoteDetailedResponseSchema,
      response,
      "castVote"
    );

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("[BFF Vote Cast] Error:", error);
    
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes("Insufficient")) {
        return NextResponse.json(
          { message: "Saldo poin tidak mencukupi" },
          { status: 400 }
        );
      }
      if (error.message.includes("Rate limit")) {
        return NextResponse.json(
          { message: "Terlalu banyak vote. Tunggu sebentar." },
          { status: 429 }
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { message: "Kandidat tidak ditemukan" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Gagal mengirim vote" },
      { status: 500 }
    );
  }
}
