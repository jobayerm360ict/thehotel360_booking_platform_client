import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "@/constants/request";

interface VerifiedReturn {
  success?: boolean;
  data?: { paymentStatus?: string; bookingId?: string; paymentId?: string };
}

async function redirectAfterVerification(request: NextRequest, orderId: string | null) {
  const locale = request.cookies.get("NEXT_LOCALE")?.value === "bn" ? "bn" : "en";
  const destination = new URL("/" + locale + "/trips", request.url);
  if (!orderId || !/^[a-zA-Z0-9_-]{1,200}$/.test(orderId)) {
    destination.searchParams.set("payment", "failed");
    return NextResponse.redirect(destination, 303);
  }

  try {
    const response = await fetch(
      baseURL + "/bookings/payment/shurjopay/callback?order_id=" + encodeURIComponent(orderId),
      { cache: "no-store", signal: AbortSignal.timeout(20000) },
    );
    const result = (await response.json().catch(() => null)) as VerifiedReturn | null;
    const status = result?.data?.paymentStatus;
    if (response.ok && result?.success && (status === "paid" || status === "refund_pending")) {
      destination.searchParams.set("payment", status);
      if (result.data?.bookingId) destination.searchParams.set("bookingId", result.data.bookingId);
      if (result.data?.paymentId) destination.searchParams.set("paymentId", result.data.paymentId);
    } else {
      destination.searchParams.set("payment", response.status >= 500 ? "pending" : "failed");
    }
  } catch {
    destination.searchParams.set("payment", "pending");
  }
  return NextResponse.redirect(destination, 303);
}

export function GET(request: NextRequest) {
  return redirectAfterVerification(request, request.nextUrl.searchParams.get("order_id"));
}

export async function POST(request: NextRequest) {
  let orderId = request.nextUrl.searchParams.get("order_id");
  if (!orderId) {
    try {
      if (request.headers.get("content-type")?.includes("application/json")) {
        const body = await request.json();
        orderId = typeof body?.order_id === "string" ? body.order_id : null;
      } else {
        const value = (await request.formData()).get("order_id");
        orderId = typeof value === "string" ? value : null;
      }
    } catch {
      orderId = null;
    }
  }
  return redirectAfterVerification(request, orderId);
}