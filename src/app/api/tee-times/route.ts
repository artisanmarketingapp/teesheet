// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tee-times?location=&date=&timeFrom=&timeTo=&players=&holes=&maxPrice=
//
// Phase 1 placeholder: returns mock data.
// TODO Phase 1: Swap searchTeeTimes() for real ForeUP + Lightspeed API calls.
//              Add Redis caching layer here (5-min TTL).
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { searchTeeTimes } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const params = {
    location:  searchParams.get("location")  ?? "",
    date:      searchParams.get("date")      ?? new Date().toISOString().slice(0,10),
    timeFrom:  searchParams.get("timeFrom")  ?? "06:00",
    timeTo:    searchParams.get("timeTo")    ?? "18:00",
    players:   parseInt(searchParams.get("players") ?? "1"),
    holes:     (searchParams.get("holes")    ?? "any") as "9"|"18"|"any",
    maxPrice:  parseInt(searchParams.get("maxPrice") ?? "500"),
  };

  try {
    const results = await searchTeeTimes(params);
    return NextResponse.json({ results, total: results.length });
  } catch (err) {
    console.error("[tee-times] search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
