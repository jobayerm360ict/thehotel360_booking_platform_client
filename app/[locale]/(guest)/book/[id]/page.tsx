"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGetListingByIdQuery } from "@/store/api/listingsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createReservation } from "@/store/slices/bookingSlice";
import { platformService, type Quote } from "@/services/platformService";
import type { Listing, Reservation, CreateBookingDTO } from "@/types";
import { formatPrice } from "@/lib/utils";

const inputClass = "w-full mt-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3";
const errorText = (error: unknown) => (error as { message?: string }).message || "Request failed. Please retry.";
function Checkout({ listing }: { listing: Listing }) {
  const params = useParams(), search = useSearchParams(), dispatch = useAppDispatch();
  const locale = String(params.locale || "en");
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const filter = useAppSelector(s => s.filter);
  const [checkIn, setCheckIn] = useState(search.get("checkIn") || filter.checkIn || "");
  const [checkOut, setCheckOut] = useState(search.get("checkOut") || filter.checkOut || "");
  const [adults, setAdults] = useState(Number(search.get("adults")) || filter.guests.adults || 1);
  const [children, setChildren] = useState(Number(search.get("children")) || 0);
  const [roomId, setRoomId] = useState(search.get("roomId") || "");
  const [plan, setPlan] = useState<"full" | "partial">("full");
  const [name, setName] = useState(user.name || ""), [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.e164Phone || user.phone || ""), [address, setAddress] = useState(user.address || "");
  const [city, setCity] = useState(""), [note, setNote] = useState("");
  const [quoted, setQuoted] = useState<{ value: Quote; payload: string } | null>(null), [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resume, setResume] = useState<Reservation | null>(null);
  const [created, setCreated] = useState<{ id: string; payload: string } | null>(null);
  const resumeId = search.get("reservationId");
  const body: CreateBookingDTO = { listingId: listing.id, ...(roomId ? { roomId } : {}), checkIn, checkOut,
    guests: { adults, children, infants: Number(search.get("infants")) || filter.guests.infants || 0, pets: Number(search.get("pets")) || filter.guests.pets || 0 },
    paymentPlan: plan, paymentMethod: "card", specialRequests: note };
  const payload = JSON.stringify(body);
  const quote = quoted?.payload === payload ? quoted.value : null;
  const quoting = !quote && !error && !resumeId;
  useEffect(() => {
    if (!isAuthenticated || !user.id) return;
    let cancelled = false;
    if (resumeId) {
      platformService.booking(resumeId).then(r => { if (!cancelled) { setResume(r); setError(""); } }).catch(e => { if (!cancelled) setError(errorText(e)); });
      return () => { cancelled = true; };
    }
    const timer = setTimeout(() => { platformService.quote(JSON.parse(payload)).then(q => { if (!cancelled) { setQuoted({ value: q, payload }); setError(""); } })
      .catch(e => { if (!cancelled) setError(errorText(e)); }); }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [payload, resumeId, isAuthenticated, user.id]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy || (!quote && !resume)) return;
    setBusy(true); setError("");
    try {
      let bookingId = resume?.id || created?.id;
      if (created && created.payload !== payload) throw new Error("Your reservation is already held. Open Trips to cancel it before changing the stay.");
      if (!bookingId) {
        const storageKey = `travistay-checkout:${user.id}:${listing.id}`;
        const previous = JSON.parse(sessionStorage.getItem(storageKey) || "null") as { payload: string; key: string } | null;
        const key = previous?.payload === payload ? previous.key : crypto.randomUUID();
        sessionStorage.setItem(storageKey, JSON.stringify({ payload, key }));
        const booking = await platformService.createBooking(body, key); bookingId = booking.id;
        setCreated({ id: booking.id, payload }); dispatch(createReservation(booking));
      }
      const intent = await platformService.intent(bookingId, { name, email, phone, address, city });
      sessionStorage.setItem(`travistay-payment:${intent.paymentId}`, JSON.stringify({ bookingId, customer: { name, email, phone, address, city } }));
      sessionStorage.setItem("travistay-payment:latest", JSON.stringify({ paymentId: intent.paymentId, bookingId }));
      window.location.assign(intent.checkoutUrl);
    } catch (e) { setError(errorText(e)); setBusy(false); }
  };
  if (!isAuthenticated) return <div className="p-10 text-center">Please sign in before booking.</div>;
  const total = resume?.totalPrice ?? quote?.totalPrice ?? 0;
  const due = resume
    ? resume.paymentType === "partial" && (resume.paidAmount || 0) === 0
      ? Math.round((resume.totalPrice / 2) * 100) / 100
      : resume.remainingAmount ?? 0
    : quote?.dueNow ?? 0;
  return <main className="max-w-5xl mx-auto p-5 sm:p-10 space-y-6">
    <Link href={`/${locale}/listings/${listing.id}`} className="underline">Back to stay</Link>
    <h1 className="text-3xl font-semibold">{resume ? "Pay reservation balance" : "Confirm and pay"}</h1>
    <div className="grid lg:grid-cols-3 gap-8">
      <form onSubmit={submit} className="lg:col-span-2 space-y-6">
        {!resumeId && <fieldset disabled={busy || !!created} className="grid sm:grid-cols-2 gap-4">
          <label>Check-in<input className={inputClass} required type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} /></label>
          <label>Check-out<input className={inputClass} required type="date" value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)} /></label>
          <label>Adults<input className={inputClass} type="number" required min={1} max={100} value={adults} onChange={e => setAdults(Number(e.target.value))} /></label>
          <label>Children<input className={inputClass} type="number" min={0} max={100} value={children} onChange={e => setChildren(Number(e.target.value))} /></label>
          {listing.mainCategory === "hotels" && <label className="sm:col-span-2">Room type<select className={inputClass} required value={roomId} onChange={e => setRoomId(e.target.value)}><option value="">Choose a room</option>{listing.hotelRooms?.map(r => <option key={r.id} value={r.id}>{r.name} — {formatPrice(r.pricePerNight)}</option>)}</select></label>}
          <label className="sm:col-span-2">Payment plan<select className={inputClass} value={plan} onChange={e => setPlan(e.target.value as "full" | "partial")}><option value="full">Pay in full</option><option value="partial">Pay 50% now, remaining balance later</option></select></label>
          <label className="sm:col-span-2">Special requests<textarea className={inputClass} value={note} maxLength={3000} onChange={e => setNote(e.target.value)} /></label>
        </fieldset>}
        <fieldset disabled={busy} className="grid sm:grid-cols-2 gap-4">
          <legend className="text-lg font-semibold mb-3">Billing details</legend>
          <label>Full name<input className={inputClass} required value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Email<input className={inputClass} required type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Phone<input className={inputClass} required type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></label>
          <label>City<input className={inputClass} required value={city} onChange={e => setCity(e.target.value)} /></label>
          <label className="sm:col-span-2">Address<input className={inputClass} required value={address} onChange={e => setAddress(e.target.value)} /></label>
        </fieldset>
        <p className="text-sm text-neutral-600">Continue to ShurjoPay to choose an available card or mobile banking method and complete your payment securely.</p>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button disabled={busy || quoting || (!quote && !resume) || due <= 0} className="rounded-xl bg-brand-primary text-white px-6 py-3 disabled:opacity-50">{busy ? "Opening secure checkout…" : quoting ? "Checking price and availability…" : `Continue to ShurjoPay — ${formatPrice(due)}`}</button>
        {created && <p className="text-sm">Your pending reservation is held for 30 minutes. <Link href={`/${locale}/trips`} className="underline">Open Trips</Link></p>}
      </form>
      <aside className="rounded-2xl border p-5 space-y-4 h-fit"><h2 className="font-semibold text-lg">{listing.title}</h2>
        <p>{listing.location.city}, {listing.location.country}</p><p>{resume?.nights ?? quote?.nights ?? 0} nights</p>
        <div className="flex justify-between"><span>Cleaning fee</span><span>{formatPrice(resume?.cleaningFee ?? quote?.cleaningFee ?? 0)}</span></div>
        <div className="flex justify-between"><span>Service fee</span><span>{formatPrice(resume?.serviceFee ?? quote?.serviceFee ?? 0)}</span></div>
        <div className="flex justify-between font-semibold"><span>Total (BDT)</span><span>{formatPrice(total)}</span></div>
        <div className="flex justify-between"><span>Due now</span><span>{formatPrice(due)}</span></div>
        <p className="text-sm text-neutral-500">Payment is confirmed after ShurjoPay verification. Changing dates or guest counts refreshes the server quote.</p>
      </aside>
    </div>
  </main>;
}
function ConfirmAndPayContent() {
  const params = useParams(); const id = String(params.id);
  const userId = useAppSelector(s => s.auth.user.id);
  const { data: listing, isLoading, error } = useGetListingByIdQuery(id);
  if (isLoading) return <div className="p-10 text-center">Loading stay…</div>;
  if (error || !listing) return <div role="alert" className="p-10 text-center">This stay could not be loaded. Please retry.</div>;
  return <Checkout key={`${id}:${userId}`} listing={listing} />;
}
export default function ConfirmAndPayPage() { return <Suspense fallback={<div className="p-10">Loading checkout…</div>}><ConfirmAndPayContent /></Suspense>; }
