import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

// Timeout wrapper for fetch
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("evora_session")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Tidak ada sesi aktif." }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${BACKEND_URL}/api/v1/auth/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
      10000 // 10 second timeout
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message === "Request timeout"
        ? "Server terlalu lama merespons. Silakan coba lagi."
        : "Tidak dapat terhubung ke server.";
    return NextResponse.json({ detail: message }, { status: 503 });
  }

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      res.status >= 500
        ? "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi."
        : "Sesi tidak valid. Silakan login kembali.";
    return NextResponse.json({ detail: message }, { status: res.status });
  }

  return NextResponse.json(data);
}
