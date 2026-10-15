import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "@/constants/request";
export async function GET(request: NextRequest) {
  try {
    const query = new URLSearchParams();
    for (const key of ["south", "north", "west", "east", "zoom"]) { const value = request.nextUrl.searchParams.get(key); if (value !== null) query.set(key, value); }
    const response = await fetch(`${baseURL}/hotels/map?${query}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch { return NextResponse.json({ success: false, message: "Could not load map stays" }, { status: 502 }); }
}
