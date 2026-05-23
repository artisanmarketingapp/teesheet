"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const MOCK_BOOKINGS = [
  { id: "BK-001", courseName: "Pebble Beach Golf Links", teeTime: "2025-06-15T08:00:00", players: 2, totalPaid: 260, status: "confirmed", pointsEarned: 260 },
  { id: "BK-002", courseName: "Torrey Pines Golf Course", teeTime: "2025-06-10T07:30:00", players: 1, totalPaid: 85,  status: "confirmed", pointsEarned: 85  },
  { id: "BK-003", courseName: "Rancho Park Golf Course",  teeTime: "2025-06-01T09:00:00", players: 4, totalPaid: 220, status: "cancelled", pointsEarned: 0   },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return <div style={{ padding:48, textAlign:"center", color:"#9ca3af" }}>Loading…</div>;
  if (!session) return null;

  const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit", hour12:true });
  const totalPoints = MOCK_BOOKINGS.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.pointsEarned, 0);

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"32px 24px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>My account</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:28 }}>{session.user?.email}</p>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, marginBottom:32 }}>
        {[
          { label:"Points balance", value: totalPoints.toLocaleString(), note:"Mock data" },
          { label:"Loyalty tier",   value:"Bronze",                       note:"TODO: from DB" },
          { label:"Total bookings", value: MOCK_BOOKINGS.length,          note:"Mock data" },
        ].map(s => (
          <div key={s.label} style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:16 }}>
            <div style={{ fontSize:12, color:"#9ca3af", marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:700, color:"#111" }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#d97706" }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Bookings */}
      <h2 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Booking history</h2>
      <div style={{ fontSize:12, color:"#f59e0b", marginBottom:12 }}>
        ⚠ Showing mock bookings — Phase 1 TODO: fetch from PostgreSQL via /api/bookings?userId=...
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {MOCK_BOOKINGS.map(b => (
          <div key={b.id} style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"14px 18px", background:"#fff" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:"#111", marginBottom:2 }}>{b.courseName}</div>
                <div style={{ fontSize:13, color:"#6b7280" }}>{fmt(b.teeTime)} at {fmtTime(b.teeTime)} · {b.players} player{b.players>1?"s":""}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:14, fontWeight:600 }}>${b.totalPaid}</div>
                <span style={{
                  fontSize:11, padding:"2px 8px", borderRadius:4, fontWeight:500,
                  background: b.status==="confirmed" ? "#d1fae5" : "#fee2e2",
                  color:      b.status==="confirmed" ? "#065f46"  : "#991b1b",
                }}>
                  {b.status}
                </span>
              </div>
            </div>
            {b.pointsEarned > 0 && (
              <div style={{ marginTop:8, fontSize:12, color:"#059669" }}>+{b.pointsEarned} points earned</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop:32, padding:16, border:"1px dashed #d1d5db", borderRadius:8, fontSize:13, color:"#9ca3af" }}>
        <strong style={{ color:"#374151" }}>Phase 1 TODOs for this page:</strong>
        <ul style={{ marginTop:8, paddingLeft:20, lineHeight:1.8 }}>
          <li>Fetch real bookings from PostgreSQL: <code>GET /api/bookings?userId=</code></li>
          <li>Connect loyalty tier to users table</li>
          <li>Add waitlist entries section</li>
          <li>Add cancellation flow with Stripe refund</li>
        </ul>
      </div>
    </div>
  );
}
