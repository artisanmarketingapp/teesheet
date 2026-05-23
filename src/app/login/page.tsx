"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Log in</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
        Demo account: <code>demo@teesheet.app</code> / <code>demo1234</code>
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={ls}>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="you@example.com" style={is} />
        </label>

        <label style={ls}>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            required placeholder="••••••••" style={is} />
        </label>

        {error && <div style={{ color: "#b91c1c", fontSize: 13 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          padding: "10px", background: loading ? "#9ca3af" : "#111", color: "#fff",
          border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
        No account?{" "}
        <Link href="/register" style={{ color: "#111", fontWeight: 500 }}>Create one</Link>
      </p>
    </div>
  );
}
const ls: React.CSSProperties = { display:"flex",flexDirection:"column",gap:4,fontSize:13,fontWeight:500,color:"#374151" };
const is: React.CSSProperties = { marginTop:4,padding:"8px 10px",border:"1px solid #d1d5db",borderRadius:6,fontSize:13,width:"100%",boxSizing:"border-box" };
