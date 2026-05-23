// ─────────────────────────────────────────────────────────────────────────────
// POST /api/bookings — create a booking
//
// Phase 1 placeholder: stores to DB (when live) and returns mock confirmation.
// TODO Phase 1:
//   1. Authenticate user via getServerSession
//   2. Create Stripe PaymentIntent
//   3. Route to correct platform adapter (ForeUP / Lightspeed)
//   4. Insert booking row in PostgreSQL
//   5. Award loyalty points via points engine
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getTeeTimeById } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teeTimeId, players, paymentMethodId } = body;

    // TODO: verify session
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teeTime = await getTeeTimeById(teeTimeId);
    if (!teeTime) return NextResponse.json({ error: "Tee time not found" }, { status: 404 });

    // TODO: Stripe PaymentIntent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(teeTime.price * players * 100),
    //   currency: "usd",
    //   payment_method: paymentMethodId,
    //   confirm: true,
    // });

    // TODO: Platform-specific booking
    // if (teeTime.platform === "foreup") { await foreupAdapter.bookTeeTime(...) }
    // if (teeTime.platform === "lightspeed") { await lightspeedAdapter.bookTeeTime(...) }

    // TODO: Insert to PostgreSQL
    // const booking = await prisma.booking.create({ data: { ... } });

    // Mock confirmation
    const confirmation = {
      bookingId: `BK-${Date.now()}`,
      status: "confirmed",
      courseName: teeTime.courseName,
      teeTime: teeTime.teeTime,
      players,
      totalPaid: teeTime.price * players,
      pointsEarned: Math.floor(teeTime.price * players),
      confirmationEmail: "Confirmation email would be sent via Resend",
    };

    return NextResponse.json(confirmation, { status: 201 });
  } catch (err) {
    console.error("[bookings] error:", err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
