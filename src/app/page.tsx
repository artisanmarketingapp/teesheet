"use client";
import { useState, useCallback } from "react";
import Link from "next/link";

interface TeeTime {
  id: string;
  courseName: string;
  city: string;
  state: string;
  platform: string;
  teeTime: string;
  price: number;
  availableSpots: number;
  holes: number;
  cartIncluded: boolean;
}

const today = new Date().toISOString().slice(0, 10);

export default function HomePage() {
  const [location, setLocation]   = useState("");
  const [date, setDate]           = useState(today);
  const [timeFrom, setTimeFrom]   = useState("06:00");
  const [timeTo, setTimeTo]       = useState("18:00");
  const [players, setPlayers]     = useState(1);
  const [holes, setHoles]         = useState("any");
  const [maxPrice, setMaxPrice]   = useState(300);
  const [results, setResults]     = useState<TeeTime[] | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [sortBy, setSortBy]       = useState("time");

  const search = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({
        location, date, timeFrom, timeTo,
        players: String(players), holes, maxPrice: String(maxPrice),
      });
      const res = await fetch(`/api/tee-times?${qs}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [location, date, timeFrom, timeTo, players, holes, maxPrice]);

  const sorted = results ? [...results].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return a.teeTime.localeCompare(b.teeTime);
  }) : [];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const platformLabel = (p: string) => {
    if (p === "foreup")     return { label: "ForeUP",     color: "#1565C0" };
    if (p === "lightspeed") return { label: "Lightspeed", color: "#E65100" };
    return                          { label: "Mock",       color: "#6b7280" };
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#111" }}>
          Find tee times
        </h1>
        <p style={{ color: "#6b7280", marginTop: 6, fontSize: 14 }}>
          Search across ForeUP, Lightspeed Golf, and more — one login, one checkout.
        </p>
        <div style={{ marginTop: 8, padding: "6px 12px", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, fontSize: 12, color: "#92400e", display: "inline-block" }}>
          ⚠ Phase 1 — showing mock data. Real API integrations coming in Phase 1 completion.
        </div>
      </div>

      {/* ── Search form ── */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>

          <label style={labelStyle}>
            Location / Course
            <input
              type="text"
              placeholder="City, state, or course name"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Date
            <input
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Time from
            <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} style={inputStyle} />
          </label>

          <label style={labelStyle}>
            Time to
            <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} style={inputStyle} />
          </label>

          <label style={labelStyle}>
            Players
            <select value={players} onChange={e => setPlayers(Number(e.target.value))} style={inputStyle}>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n} player{n > 1 ? "s" : ""}</option>)}
            </select>
          </label>

          <label style={labelStyle}>
            Holes
            <select value={holes} onChange={e => setHoles(e.target.value)} style={inputStyle}>
              <option value="any">Any</option>
              <option value="9">9 holes</option>
              <option value="18">18 holes</option>
            </select>
          </label>

          <label style={labelStyle}>
            Max price / player
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <input
                type="range" min={20} max={500} step={5}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 13, color: "#374151", minWidth: 40 }}>${maxPrice}</span>
            </div>
          </label>

        </div>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={search}
            disabled={loading}
            style={{
              padding: "10px 28px", background: loading ? "#9ca3af" : "#111",
              color: "#fff", border: "none", borderRadius: 6, fontSize: 14,
              fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching…" : "Search tee times"}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, color: "#b91c1c", fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* ── Results ── */}
      {results !== null && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              {results.length} tee time{results.length !== 1 ? "s" : ""} found
            </p>
            <label style={{ fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 8 }}>
              Sort by
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, width: "auto", marginTop: 0 }}>
                <option value="time">Earliest first</option>
                <option value="price">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>

          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 32 }}>⛳</div>
              <p>No tee times found for your search. Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sorted.map(t => {
                const pl = platformLabel(t.platform);
                return (
                  <div key={t.id} style={{
                    border: "1px solid #e5e7eb", borderRadius: 8, padding: "16px 20px",
                    background: "#fff", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 16,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>{t.courseName}</span>
                        <span style={{
                          fontSize: 11, padding: "2px 7px", borderRadius: 4,
                          background: pl.color + "18", color: pl.color, fontWeight: 500,
                        }}>{pl.label}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {t.city}, {t.state} &nbsp;·&nbsp; {t.holes} holes
                        {t.cartIncluded ? " · Cart included" : ""}
                        &nbsp;·&nbsp; {t.availableSpots} spot{t.availableSpots > 1 ? "s" : ""} left
                      </div>
                    </div>

                    <div style={{ textAlign: "right", minWidth: 120 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>
                        {formatTime(t.teeTime)}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        ${t.price} / player
                      </div>
                    </div>

                    <Link href={`/book/${t.id}`} style={{
                      padding: "8px 18px", background: "#111", color: "#fff",
                      borderRadius: 6, textDecoration: "none", fontSize: 13,
                      fontWeight: 600, whiteSpace: "nowrap",
                    }}>
                      Book
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {results === null && !loading && (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#9ca3af" }}>
          <div style={{ fontSize: 40 }}>⛳</div>
          <p style={{ marginTop: 8 }}>Enter a location and date above to find available tee times.</p>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 4,
  fontSize: 13, fontWeight: 500, color: "#374151",
};

const inputStyle: React.CSSProperties = {
  marginTop: 4, padding: "7px 10px", border: "1px solid #d1d5db",
  borderRadius: 6, fontSize: 13, color: "#111", background: "#fff", width: "100%",
  boxSizing: "border-box",
};
