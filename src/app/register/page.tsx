"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Registration failed");
      }
      router.push("/login?registered=1");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Create account</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={ls}>Full name <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} required style={is} /></label>
        <label style={ls}>Email <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={is} /></label>
        <label style={ls}>Phone (optional) <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} style={is} /></label>
        <label style={ls}>Password <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} style={is} /></label>

        {error && <div style={{ color: "#b91c1c", fontSize: 13 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          padding:"10px",background:loading?"#9ca3af":"#111",color:"#fff",
          border:"none",borderRadius:6,fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",
        }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p style={{ marginTop:20,fontSize:13,color:"#6b7280",textAlign:"center" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color:"#111",fontWeight:500 }}>Log in</Link>
      </p>
    </div>
  );
}
const ls: React.CSSProperties = { display:"flex",flexDirection:"column",gap:4,fontSize:13,fontWeight:500,color:"#374151" };
const is: React.CSSProperties = { marginTop:4,padding:"8px 10px",border:"1px solid #d1d5db",borderRadius:6,fontSize:13,width:"100%",boxSizing:"border-box" };
