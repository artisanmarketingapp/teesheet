// POST /api/auth-register — create a new golfer account
// TODO Phase 1: enable once Railway PostgreSQL is provisioned
import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO Phase 1: uncomment when DB is live
    // const existing = await prisma.user.findUnique({ where: { email } });
    // if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    // const hashedPassword = await bcrypt.hash(password, 12);
    // const user = await prisma.user.create({
    //   data: { email, fullName, phone, hashedPassword },
    // });
    // return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });

    // Mock response
    return NextResponse.json({ id: "mock-new-user", email, fullName }, { status: 201 });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
