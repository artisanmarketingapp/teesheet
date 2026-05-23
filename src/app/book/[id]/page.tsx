"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface TeeTime {
  id: string; courseName: string; city: string; state: string;
  platform: string; teeTime: string; price: number;
  availableSpots: number; holes: number; cartIncluded: boolean;
}

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [teeTime, setTeeTime]     = useState<TeeTime | null>(null);
  const [players, setPlayers]     = useState(1);
  const [loading, setLoading]     = useState(true);
  const [booking, setBooking]     = useState(false);
  const [confirmation, setConf]   = useState<any>(null);
  const [error, setError]         = useState("");

  useEffect(() => {
    // Fetch tee time details
    // TODO Phase 1: this calls the mock route — swap for real API
    fetch(`/api/tee-times?date=${id.split("-").slice(2,5).join("-")}&maxPrice=500&players=1&holes=any&timeFrom=00:00&timeTo=23:59`)
      .then(r => r.json())
      .then(d => {
        const found = d.results?.find((t: TeeTime) => t.id === id);
        setTeeTime(found ?? null);
        setLoading(false);
      });
  }, [id]);

  async function handleBook() {
    if (!session) { router.push("/login"); return; }
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teeTimeId: id, players, paymentMethodId: "pm_mock" }),
      });
      if (!res.ok) throw new Error("Booking failed");
      const data = await res.json();
      setConf(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBooking(false);
    }
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit", hour12:true });
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  if (loading) return <div style={{ padding:48, textAlign:"center", color:"#9ca3af" }}>Loading…</div>;
  if (!teeTime) return (
    <div style={{ padding:48, textAlign:"center" }}>
      <p>Tee time not found.</p>
      <Link href="/" style={{ color:"#111" }}>← Back to search</Link>
    </div>
  );

  if (confirmation) return (
    <div style={{ maxWidth:520, margin:"80px auto", padding:"0 24px", textAlign:"center" }}>
      <div style={{ fontSize:40 }}>✅</div>
      <h1 style={{ fontSize:22, fontWeight:700, margin:"16px 0 8px" }}>Booking confirmed!</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:28 }}>
        Confirmation #{confirmation.bookingId}
      </p>
      <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:20, textAlign:"left", marginBottom:24 }}>
        <Row label="Course"    value={confirmation.courseName} />
        <Row label="Date/Time" value={`${formatDate(confirmation.teeTime)} at ${formatTime(confirmation.teeTime)}`} />
        <Row label="Players"   value={`${confirmation.players}`} />
        <Row label="Total paid" value={`$${confirmation.totalPaid}`} />
        <Row label="Points earned" value={`${confirmation.pointsEarned} pts`} />
        <div style={{ marginTop:12, fontSize:12, color:"#9ca3af" }}>
          {confirmation.confirmationEmail}
        </div>
      </div>
      <div style={{ fontSize:12, color:"#f59e0b", marginBottom:20 }}>
        ⚠ Stripe payment placeholder — no real charge was made.
      </div>
      <Link href="/" style={{ padding:"10px 24px", background:"#111", color:"#fff", borderRadius:6, textDecoration:"none", fontSize:14 }}>
        Find more tee times
      </Link>
    </div>
  );

  return (
    <div style={{ maxWidth:560, margin:"48px auto", padding:"0 24px" }}>
      <Link href="/" style={{ fontSize:13, color:"#6b7280", textDecoration:"none" }}>← Back to results</Link>

      <h1 style={{ fontSize:22, fontWeight:700, margin:"20px 0 4px" }}>{teeTime.courseName}</h1>
      <p style={{ color:"#6b7280", fontSize:14, margin:"0 0 24px" }}>{teeTime.city}, {teeTime.state}</p>

      <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:20, marginBottom:24 }}>
        <Row label="Date"        value={formatDate(teeTime.teeTime)} />
        <Row label="Tee time"    value={formatTime(teeTime.teeTime)} />
        <Row label="Holes"       value={`${teeTime.holes} holes`} />
        <Row label="Cart"        value={teeTime.cartIncluded ? "Included" : "Not included"} />
        <Row label="Available"   value={`${teeTime.availableSpots} spot(s)`} />
        <Row label="Price"       value={`$${teeTime.price} / player`} />
        <Row label="Platform"    value={teeTime.platform} />
      </div>

      <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13,fontWeight:500,color:"#374151",marginBottom:20 }}>
        Number of players
        <select value={players} onChange={e => setPlayers(Number(e.target.value))} style={{ padding:"8px 10px",border:"1px solid #d1d5db",borderRadius:6,fontSize:13,width:160 }}>
          {Array.from({ length: teeTime.availableSpots }, (_, i) => i+1).map(n =>
            <option key={n} value={n}>{n} player{n>1?"s":""}</option>
          )}
        </select>
      </label>

      <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:600 }}>
          <span>Total</span>
          <span>${teeTime.price * players}</span>
        </div>
        <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>
          + booking fee calculated at checkout
        </div>
      </div>

      {/* Stripe placeholder */}
      <div style={{ border:"1px dashed #d1d5db", borderRadius:8, padding:16, marginBottom:20, fontSize:13, color:"#9ca3af" }}>
        💳 Stripe payment form goes here — Phase 1 TODO
        <br/>
        <code style={{ fontSize:11 }}>npm install @stripe/stripe-js @stripe/react-stripe-js</code>
      </div>

      {!session && (
        <div style={{ background:"#fef3c7", border:"1px solid #f59e0b", borderRadius:6, padding:12, fontSize:13, color:"#92400e", marginBottom:16 }}>
          You need to <Link href="/login" style={{ fontWeight:600 }}>log in</Link> to complete this booking.
        </div>
      )}

      {error && <div style={{ color:"#b91c1c", fontSize:13, marginBottom:12 }}>{error}</div>}

      <button
        onClick={handleBook}
        disabled={booking}
        style={{ width:"100%", padding:"12px", background: booking ? "#9ca3af" : "#111", color:"#fff", border:"none", borderRadius:6, fontSize:15, fontWeight:600, cursor: booking ? "not-allowed" : "pointer" }}
      >
        {booking ? "Processing…" : session ? "Confirm booking (mock)" : "Log in to book"}
      </button>

      <p style={{ fontSize:12, color:"#9ca3af", textAlign:"center", marginTop:12 }}>
        ⚠ Phase 1 placeholder — no real payment or booking will be made
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"6px 0", borderBottom:"1px solid #f3f4f6" }}>
      <span style={{ color:"#6b7280" }}>{label}</span>
      <span style={{ fontWeight:500, color:"#111" }}>{value}</span>
    </div>
  );
}
