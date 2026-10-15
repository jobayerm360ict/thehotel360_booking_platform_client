"use client";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
export function HostSuperhostStandards() {
  const { data, loading, error, reload } = usePlatformData(platformService.standards);
  if (loading) return <div className="p-8">Loading host standards…</div>;
  if (error || !data) return <div role="alert" className="p-8">{error}<button className="ml-3 underline" onClick={reload}>Retry</button></div>;
  const metrics = [["Completed stays", data.completedStays, "At least 10"], ["Guest rating", data.rating, "At least 4.8"],
    ["Response rate", data.responseRate === null ? "No inquiries yet" : `${data.responseRate}%`, "At least 90% within 24 hours"],
    ["Host cancellation rate", `${data.cancellationRate}%`, "Below 1%"]];
  return <div className="rounded-2xl border bg-white dark:bg-neutral-900 p-6 space-y-6"><h2 className="text-2xl font-semibold">Host standards</h2>
    <p>{data.isSuperhost ? "You meet the current Superhost criteria." : "Build your hosting record to meet Superhost criteria."}</p>
    <div className="grid sm:grid-cols-2 gap-4">{metrics.map(([label, value, goal]) => <div key={label} className="rounded-xl border p-5"><h3>{label}</h3><p className="text-3xl font-semibold my-3">{value}</p><p className="text-sm text-neutral-500">Goal: {goal}</p></div>)}</div>
    <p className="text-sm text-neutral-500">Metrics use the last year&apos;s booking, review and message activity.</p><button className="underline" onClick={reload}>Refresh metrics</button>
  </div>;
}
