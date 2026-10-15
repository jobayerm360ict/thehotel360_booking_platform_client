"use client";
import React, { useState } from "react";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { formatPrice } from "@/lib/utils";
import type { Listing, Reservation } from "@/types";

export function HostReportsSection(_props: { reservations: Reservation[]; hostedListings: Listing[] }) {
  const { data, error, loading, reload } = usePlatformData(platformService.reports);
  const [listingId, setListingId] = useState("all");
  if (loading) return <div className="p-8">Loading host reports…</div>;
  if (error || !data) return <div role="alert" className="p-8">{error || "Report unavailable"}<button className="ml-3 underline" onClick={reload}>Retry</button></div>;
  const ledger = data.ledger.filter(r => listingId === "all" || r.listingId === listingId);
  const exportCSV = () => {
    const escape = (value: unknown) => '"' + String(value ?? "").replace(/"/g, '""').replace(/^[=+@-]/, "'$&") + '"';
    const rows = [["Reservation", "Guest", "Listing", "Check-in", "Check-out", "Total BDT", "Paid BDT", "Remaining BDT", "Status"],
      ...ledger.map(r => [r.id, r.guestName, r.listingTitle, r.checkIn, r.checkOut, r.totalPrice, r.paidAmount || 0, r.remainingAmount || 0, r.status])];
    const url = URL.createObjectURL(new Blob([rows.map(row => row.map(escape).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "travistay-booking-ledger.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-6 rounded-2xl border bg-white dark:bg-neutral-900 p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold">Earnings & reports</h2><button className="border rounded-xl px-4 py-2" onClick={exportCSV}>Export CSV</button><button className="underline" onClick={reload}>Refresh</button></div>
    <p className="text-sm">Hosted properties: {_props.hostedListings.length}</p>
    <p>Net collected earnings: <strong>{formatPrice(data.totalEarnings)}</strong></p>
    <label>Property <select className="border rounded p-2 ml-2" value={listingId} onChange={e => setListingId(e.target.value)}><option value="all">All properties</option>{Array.from(new Map(data.ledger.map(r => [r.listingId, r.listingTitle])).entries()).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>
    <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{["Reservation", "Guest", "Property", "Stay", "Total", "Paid", "Balance", "Status"].map(h => <th key={h} className="p-3 border-b">{h}</th>)}</tr></thead><tbody>{ledger.map(r => <tr key={r.id}><td className="p-3">{r.id}</td><td>{r.guestName}</td><td>{r.listingTitle}</td><td>{r.checkIn} → {r.checkOut}</td><td>{formatPrice(r.totalPrice)}</td><td>{formatPrice(r.paidAmount || 0)}</td><td>{formatPrice(r.remainingAmount || 0)}</td><td>{r.status}</td></tr>)}</tbody></table>{!ledger.length && <p className="p-4">No reservations yet.</p>}</div>
    <h3 className="font-semibold">Payment transactions</h3><ul className="space-y-2">{data.payments.map(p => <li key={p.id} className="flex justify-between border-b py-2"><span>Booking {p.bookingId} · {new Date(p.createdAt).toLocaleDateString()}</span><span>{formatPrice(p.amount)} · {p.status}</span></li>)}</ul>
    {!data.payments.length && <p>No payment transactions yet.</p>}
    <p className="text-sm text-neutral-500">Bank payouts and refunds are processed through merchant operations. A saved payout destination does not execute a transfer.</p>
  </div>;
}
