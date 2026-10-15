"use client";
import { useState } from "react";
import { apiClient } from "@/services/apiClient";
export function InventoryCalendar({ roomId }: { roomId: number }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [quantity, setQuantity] = useState(1), [blocked, setBlocked] = useState(0), [price, setPrice] = useState(0);
  const [status, setStatus] = useState("open"), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const load = async () => { setBusy(true); try { const end = new Date(Date.parse(date)+86400000).toISOString().slice(0,10);
    const response = await apiClient.get<{data: {total_inventory: number; blocked_quantity: number; price: number; status: string; reserved_quantity: number; held_quantity: number}[]}>(`/host/room-types/${roomId}/availability`, {params:{checkIn:date,checkOut:end}});
    const day=response.data[0];setQuantity(day.total_inventory);setBlocked(day.blocked_quantity);setPrice(day.price);setStatus(day.status);
    setMessage(`Reserved: ${day.reserved_quantity}; held: ${day.held_quantity}`);
  } catch { setMessage("Could not load availability."); } finally { setBusy(false); } };
  const save = async (event: React.FormEvent) => { event.preventDefault();setBusy(true);try {
    await apiClient.patch(`/host/room-types/${roomId}/availability`,{dates:[{date,total_inventory:quantity,blocked_quantity:blocked,status,...(price>0?{price}:{})}]});
    setMessage("Inventory and nightly rate saved.");
  } catch { setMessage("Calendar update failed. Existing reservations may prevent this change."); } finally { setBusy(false); } };
  return <section className="border rounded-2xl p-5 space-y-3"><h2 className="text-lg font-semibold">Daily inventory & pricing</h2><form onSubmit={save} className="flex flex-wrap gap-3 items-end">
    <label>Date<input required type="date" className="block border rounded p-2" value={date} onChange={e=>setDate(e.target.value)}/></label>
    <button type="button" disabled={busy} className="border rounded p-2" onClick={()=>void load()}>Load day</button>
    <label>Total inventory<input required type="number" min={1} className="block border rounded p-2 w-28" value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label>
    <label>Blocked units<input required type="number" min={0} className="block border rounded p-2 w-28" value={blocked} onChange={e=>setBlocked(Number(e.target.value))}/></label>
    <label>Nightly rate (BDT)<input type="number" min={0} step="0.01" className="block border rounded p-2 w-32" value={price} onChange={e=>setPrice(Number(e.target.value))}/></label>
    <label>Status<select className="block border rounded p-2" value={status} onChange={e=>setStatus(e.target.value)}><option value="open">Open</option><option value="close">Closed</option></select></label>
    <button disabled={busy} className="rounded bg-brand-primary text-white p-2">{busy?"Saving…":"Save day"}</button>
  </form><p role="status" className="text-sm">{message}</p></section>;
}
