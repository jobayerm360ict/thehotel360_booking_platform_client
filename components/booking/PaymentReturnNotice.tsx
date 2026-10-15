"use client";

import { useEffect, useState } from "react";
import { platformService } from "@/services/platformService";

type Notice = { message: string; tone: "success" | "warning" };

export function PaymentReturnNotice({ onUpdated }: { onUpdated: () => void }) {
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("payment")) return;
    const returnStatus = url.searchParams.get("payment");
    const latest = sessionStorage.getItem("travistay-payment:latest");
    let storedPaymentId = "";
    try {
      storedPaymentId = latest ? String(JSON.parse(latest).paymentId || "") : "";
    } catch {
      storedPaymentId = "";
    }
    const paymentId = url.searchParams.get("paymentId") || storedPaymentId;
    url.searchParams.delete("payment");
    url.searchParams.delete("paymentId");
    url.searchParams.delete("bookingId");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);

    let active = true;
    const verify = async () => {
      if (!paymentId) {
        if (active) {
          setNotice({ tone: "warning", message: "Payment result is unavailable. Check your reservation status or contact support." });
          onUpdated();
        }
        return;
      }
      try {
        const result = await platformService.confirm(paymentId);
        if (!active) return;
        if ("paymentStatus" in result) {
          setNotice({ tone: "warning", message: "Your payment needs support review. Check your reservation before paying again." });
        } else if ((result.paidAmount || 0) > 0) {
          setNotice({
            tone: "success",
            message: (result.remainingAmount || 0) > 0
              ? "Deposit verified. Your reservation is confirmed; the remaining balance is shown below."
              : "Payment verified. Your reservation is confirmed.",
          });
          sessionStorage.removeItem("travistay-payment:latest");
          sessionStorage.removeItem("travistay-payment:" + paymentId);
        } else {
          setNotice({ tone: "warning", message: "Payment is still being verified. Check the reservation before paying again." });
        }
      } catch {
        if (!active) return;
        setNotice({
          tone: "warning",
          message: returnStatus === "failed"
            ? "Payment was not completed or could not be verified. Your reservation status is shown below."
            : "Payment verification is pending. Check your reservation before paying again.",
        });
      }
      onUpdated();
    };
    void verify();
    return () => { active = false; };
  }, [onUpdated]);

  if (!notice) return null;
  return (
    <div role="status" className={"rounded-xl border p-4 text-sm " + (notice.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-amber-200 bg-amber-50 text-amber-900")}>
      {notice.message}
    </div>
  );
}