import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const startTime = performance.now();

  // Extract Vercel-specific deployment headers (present when hosted on Vercel)
  const vercelId = request.headers.get("x-vercel-id") || "local-development";
  const vercelRegion = vercelId.includes("::") ? vercelId.split("::")[0] : "local";
  const vercelEnv = process.env.VERCEL_ENV || (process.env.NODE_ENV === "production" ? "production" : "development");
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  const vercelGitCommit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local-dev";
  const vercelCountry = request.headers.get("x-vercel-ip-country") || "Localhost";
  const vercelCity = request.headers.get("x-vercel-ip-city") || "Local Machine";
  const vercelIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

  return NextResponse.json({
    status: "ok",
    message: "Vercel Serverless Function is operational!",
    timestamp: new Date().toISOString(),
    serverDurationMs: durationMs,
    environment: {
      mode: vercelEnv,
      platform: "Vercel / Next.js Serverless",
      nodeVersion: process.version,
      isVercel: Boolean(process.env.VERCEL),
      region: vercelRegion,
      hostUrl: vercelUrl,
      gitCommit: vercelGitCommit,
      hasApiKey: Boolean(process.env.MY_API_KEY && process.env.MY_API_KEY !== "your_secret_api_key_here"),
    },
    geo: {
      ip: vercelIp,
      city: vercelCity,
      country: vercelCountry,
    },
    headers: {
      vercelId,
      userAgent: request.headers.get("user-agent") || "unknown",
      acceptLanguage: request.headers.get("accept-language") || "unknown",
    },
  });
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    const body = await request.json();
    const serverDurationMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json({
      success: true,
      receivedAt: new Date().toISOString(),
      echo: body,
      processedBy: "Vercel Serverless Function (POST handler)",
      serverDurationMs,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON in request payload" },
      { status: 400 }
    );
  }
}
