"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 24px", borderBottom: "1px solid #e5e7eb",
      background: "#fff",
    }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: 18, color: "#111", textDecoration: "none" }}>
        ⛳ TeeSheet
      </Link>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link href="/" style={{ color: "#374151", textDecoration: "none", fontSize: 14 }}>Search</Link>

        {session ? (
          <>
            <Link href="/dashboard" style={{ color: "#374151", textDecoration: "none", fontSize: 14 }}>
              My Bookings
            </Link>
            <span style={{ fontSize: 14, color: "#6b7280" }}>
              {session.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                padding: "6px 14px", fontSize: 13, cursor: "pointer",
                border: "1px solid #d1d5db", borderRadius: 6, background: "#f9fafb",
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{
              padding: "6px 14px", fontSize: 13, color: "#374151",
              border: "1px solid #d1d5db", borderRadius: 6, textDecoration: "none",
              background: "#f9fafb",
            }}>
              Log in
            </Link>
            <Link href="/register" style={{
              padding: "6px 14px", fontSize: 13, color: "#fff",
              background: "#111", borderRadius: 6, textDecoration: "none",
              border: "1px solid #111",
            }}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
