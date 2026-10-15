import { NextResponse } from "next/server";
import { baseURL } from "@/constants/request";
import { API_ENDPOINTS } from "@/constants/api";

export async function POST(request: Request) {
  try {
    let refreshToken: string | null | undefined;

    // 1. Try reading from request body
    try {
      const body = await request.json();
      refreshToken = body?.refreshToken || body?.refresh_token;
    } catch {
      // Body might be empty
    }

    // 2. Try reading from request cookies if not in body
    if (!refreshToken) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/refresh_token=([^;]+)/);
      if (match) {
        refreshToken = match[1];
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "No refresh token provided",
        },
        { status: 401 }
      );
    }

    // 3. Forward to backend refresh endpoint with Cookie header
    const backendUrl = `${baseURL.replace(/\/+$/, "")}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`;
    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const data = await backendRes.json().catch(() => ({}));

    // 4. Return response to client, preserving any Set-Cookie headers
    const nextResponse = NextResponse.json(data, {
      status: backendRes.status,
    });

    const setCookieHeader = backendRes.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to refresh token";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
