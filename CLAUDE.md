# TeeSheet — Project Context for Claude

This file gives Claude full context about this project so it can pick up
where the last conversation left off. Keep this file updated as the project
evolves.

---

## What this project is

A golf tee time aggregator and booking platform — think "the anti-GolfNow".
The goal is to let golfers search and book tee times across multiple tee sheet
platforms (ForeUP, Lightspeed Golf, Club Caddie) from a single interface, with
a cross-course loyalty rewards program and tee time waitlist/alerts.

Key differentiator vs GolfNow: courses get their own customer data back
(GolfNow hides it), pay a flat monthly fee instead of per-booking commission,
and their golfers earn loyalty points they can redeem at any course in the
network.

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router, TypeScript) — main web app
- **React Native + Expo** — mobile app (Phase 2, not started yet)
- **React embeddable widget** — booking widget for course websites (Phase 2)

### Backend
- **Next.js API routes** — API gateway and booking router (lives in src/app/api/)
- **Python FastAPI** — loyalty points engine and waitlist logic (Phase 2, not started)

### Database
- **PostgreSQL** on Railway — primary data store
- **Prisma ORM** — schema defined in prisma/schema.prisma
- **Redis** on Railway — tee time caching (5-min TTL) and BullMQ job queues (Phase 2)

### Infrastructure
- **Railway** — hosts Next.js app + PostgreSQL + Redis
- **Stripe** — payments and refunds (placeholder, Phase 1 TODO)
- **Resend** — transactional email (placeholder, Phase 1 TODO)
- **NextAuth.js** — authentication (credentials provider live, OAuth Phase 2)

---

## Database Schema (PostgreSQL via Prisma)

### users
| Field               | Type      | Notes                                      |
|---------------------|-----------|--------------------------------------------|
| id                  | uuid PK   |                                            |
| email               | string    | unique                                     |
| fullName            | string    |                                            |
| phone               | string?   |                                            |
| hashedPassword      | string    | bcrypt                                     |
| platformLoginToken  | string?   | OAuth token for ForeUP/Lightspeed on-behalf booking |
| loyaltyTier         | string    | bronze/silver/gold/platinum (default: bronze) |
| pointsBalance       | int       | running total — fast reads, reconcile with ledger |
| createdAt           | timestamp |                                            |
| lastLoginAt         | timestamp |                                            |

### courses
| Field            | Type      | Notes                                           |
|------------------|-----------|-------------------------------------------------|
| id               | uuid PK   |                                                 |
| name             | string    |                                                 |
| city, state, zip | string    |                                                 |
| platform         | string    | "foreup" | "lightspeed" | "club_caddie"         |
| externalCourseId | string    | ID used by the tee sheet platform               |
| websiteUrl       | string?   |                                                 |
| baseGreenFee     | decimal   |                                                 |
| isActive         | bool      |                                                 |
| syncedAt         | timestamp | refreshed every 5 min via BullMQ job            |

### bookings
| Field              | Type      | Notes                                         |
|--------------------|-----------|-----------------------------------------------|
| id                 | uuid PK   |                                               |
| userId             | uuid FK   | → users                                       |
| courseId           | uuid FK   | → courses                                     |
| teeTime            | timestamp |                                               |
| numPlayers         | int       |                                               |
| amountPaid         | decimal   |                                               |
| bookingFee         | decimal   |                                               |
| status             | string    | confirmed / cancelled / pending               |
| externalBookingId  | string?   | confirmation ID from ForeUP/Lightspeed        |
| platform           | string    | duplicated so cancellations work if course moves |
| pointsEarned       | int       |                                               |
| createdAt          | timestamp |                                               |

### points_ledger
Append-only. Never update or delete. Always insert new rows.
| Field       | Type      | Notes                                                      |
|-------------|-----------|------------------------------------------------------------|
| id          | uuid PK   |                                                            |
| userId      | uuid FK   |                                                            |
| bookingId   | uuid FK?  |                                                            |
| pointsDelta | int       | positive = earned, negative = redeemed                     |
| eventType   | string    | booking_earned / booking_cancelled / referral_bonus / redemption |
| description | string    |                                                            |
| createdAt   | timestamp |                                                            |

### waitlist_entries
| Field       | Type      | Notes                                           |
|-------------|-----------|-------------------------------------------------|
| id          | uuid PK   |                                                 |
| userId      | uuid FK   |                                                 |
| courseId    | uuid FK   |                                                 |
| desiredDate | date      |                                                 |
| windowStart | string    | e.g. "07:00"                                    |
| windowEnd   | string    | e.g. "10:00"                                    |
| numPlayers  | int       |                                                 |
| isActive    | bool      |                                                 |
| createdAt   | timestamp |                                                 |
| alertedAt   | timestamp | prevents duplicate alerts                       |

---

## Project File Structure

```
teesheet/
  src/
    app/
      page.tsx                    # Home — tee time search
      login/page.tsx              # Login
      register/page.tsx           # Registration
      dashboard/page.tsx          # My bookings + loyalty points
      book/[id]/page.tsx          # Booking detail + checkout
      api/
        tee-times/route.ts        # GET — search (mock data, Phase 1)
        bookings/route.ts         # POST — create booking (mock, Phase 1)
        auth-register/route.ts    # POST — register user (mock, Phase 1)
        auth/[...nextauth]/       # NextAuth handler
    components/
      navbar.tsx                  # Nav with login/logout in top right
    lib/
      auth.ts                     # NextAuth config (demo login works)
      mock-data.ts                # Mock tee times + API placeholders
      prisma.ts                   # Prisma singleton
  prisma/
    schema.prisma                 # Full DB schema
  .env.local                      # Environment variables (see below)
  railway.json                    # Railway deployment config
  CLAUDE.md                       # This file
  README.md                       # Setup + deployment instructions
```

---

## Environment Variables

```bash
DATABASE_URL=                         # Railway PostgreSQL URL
NEXTAUTH_SECRET=                      # openssl rand -base64 32
NEXTAUTH_URL=                         # https://your-app.railway.app

# Stripe (TODO Phase 1)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (TODO Phase 1)
RESEND_API_KEY=re_...

# ForeUP (TODO Phase 1 — needs partner approval)
FOREUP_API_KEY=
FOREUP_BASE_URL=https://app.foreup.com/api

# Lightspeed Golf (TODO Phase 1 — needs OAuth registration)
LIGHTSPEED_CLIENT_ID=
LIGHTSPEED_CLIENT_SECRET=
LIGHTSPEED_BASE_URL=https://api.chronogolf.com

# Redis (TODO Phase 1 — provision on Railway)
REDIS_URL=redis://...
```

---

## Current Status

### What works right now
- Search page with all filters (location, date, time range, players, holes, price)
- Mock tee time results from 6 California courses
- Login/logout with demo credentials: `demo@teesheet.app` / `demo1234`
- Registration form (mock — no DB yet)
- Booking flow with mock confirmation screen
- Dashboard with mock booking history
- Full Prisma schema ready to push once Railway DB is provisioned

### Phase 1 TODOs (all marked `// TODO Phase 1:` in code)
- [ ] Provision Railway PostgreSQL and run `npx prisma db push`
- [ ] Enable real DB queries in auth.ts (replace mock login)
- [ ] Enable real user creation in auth-register/route.ts
- [ ] Integrate ForeUP API (needs partner approval from foreupgolf.com)
- [ ] Integrate Lightspeed Golf API (register at partner-api.docs.chronogolf.com)
- [ ] Add Stripe payment form in book/[id]/page.tsx
- [ ] Implement Stripe webhook handler at /api/webhooks/stripe
- [ ] Add Resend email on booking confirmation
- [ ] Provision Railway Redis + add BullMQ for waitlist polling

### Phase 2 (not started)
- React Native mobile app (iOS + Android via Expo)
- Python FastAPI service for loyalty engine + ML pricing
- Embeddable booking widget for course websites
- Browser automation fallback for non-API tee sheet platforms
- Waitlist BullMQ job (poll every 15 min, send alerts via Resend)

---

## Key Architectural Decisions

1. **Adapter pattern for tee sheet integrations** — all platform connectors
   normalize to `{ course_id, slot_time, price, available, players_allowed }`.
   Adding a new platform = writing one new adapter, nothing else changes.

2. **points_balance on users table** — fast reads without joining ledger.
   points_ledger is the append-only source of truth for auditing.

3. **platform field duplicated on bookings** — so cancellation flow works
   even if a course switches tee sheet software.

4. **courses table as a local cache** — refreshed every 5 min via BullMQ.
   Never call the tee sheet APIs on every search request.

5. **No per-booking commission** — courses pay flat monthly SaaS fee.
   This is the key differentiator vs GolfNow.

---

## Competitors & Market Context

- **GolfNow** (NBC Sports/Versant) — 3,300+ courses, has native dynamic pricing,
  closed API, takes per-booking commission, hides customer data from courses.
- **Lightspeed Golf** — best open API, native dynamic pricing, 1,700+ courses.
- **ForeUP** — open partner API, no native dynamic pricing, ~2,000 courses.
  Target integration #1.
- **Open Course** — direct competitor app, 10K users, uses browser automation
  (not real APIs), no loyalty, no B2B relationships. Our version is stronger.
- **Sagacity Golf** — dynamic pricing add-on for ForeUP/Lightspeed.
  Not a direct competitor (different product), but shows there's a market.
