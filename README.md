# TeeSheet — Phase 1 MVP

Golf tee time search and booking platform. Aggregates tee times from ForeUP,
Lightspeed Golf, and other platforms into a single search interface with loyalty
points and waitlist alerts.

## Tech Stack

- **Frontend/API**: Next.js 15 (App Router) on Railway
- **Database**: PostgreSQL on Railway (via Prisma ORM)
- **Auth**: NextAuth.js (credentials + future OAuth)
- **Payments**: Stripe (placeholder — Phase 1)
- **Email**: Resend (placeholder — Phase 1)
- **Cache/Queues**: Redis + BullMQ (placeholder — Phase 1)

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.local.example .env.local

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to your local/Railway DB
npx prisma db push

# 5. Start dev server
npm run dev
```

Open http://localhost:3000

**Demo login**: `demo@teesheet.app` / `demo1234`

## Deploy to Railway

1. Create a new Railway project at railway.app
2. Add a PostgreSQL service — copy the `DATABASE_URL` to your variables
3. Connect your GitHub repo
4. Set environment variables (see `.env.local` for the full list)
5. Railway auto-deploys on push — `railway.json` handles `prisma db push` on startup

## Project Structure

```
src/
  app/
    page.tsx              # Search page (home)
    login/page.tsx        # Login
    register/page.tsx     # Registration
    dashboard/page.tsx    # My bookings
    book/[id]/page.tsx    # Booking flow
    api/
      tee-times/          # GET — search tee times
      bookings/           # POST — create booking
      auth-register/      # POST — create account
      auth/[...nextauth]/ # NextAuth handler
  components/
    navbar.tsx            # Top nav with login button
  lib/
    auth.ts               # NextAuth config
    mock-data.ts          # Phase 1 mock data + API placeholders
    prisma.ts             # Prisma client singleton
prisma/
  schema.prisma           # Full DB schema (users, courses, bookings, etc.)
```

## Phase 1 TODOs

All placeholders are marked with `// TODO Phase 1:` comments.

### ForeUP Integration
- [ ] Apply for partner API access at foreupgolf.com
- [ ] Replace `searchTeeTimes()` in `mock-data.ts` with real ForeUP API calls
- [ ] Add `FOREUP_API_KEY` to Railway env vars

### Lightspeed Golf Integration
- [ ] Register at partner-api.docs.chronogolf.com
- [ ] Implement OAuth 2.0 flow for Lightspeed
- [ ] Replace mock data with Lightspeed `/v1/tee_times` endpoint

### Stripe Payments
- [ ] Replace payment placeholder in `/book/[id]/page.tsx`
- [ ] Implement `POST /api/bookings` to create real PaymentIntent
- [ ] Add Stripe webhook handler at `/api/webhooks/stripe`

### Database
- [ ] Provision Railway PostgreSQL service
- [ ] Run `npx prisma db push` on first deploy
- [ ] Enable real DB queries in auth.ts and register route

### Redis + BullMQ
- [ ] Provision Railway Redis service
- [ ] Add 5-minute TTL caching in `/api/tee-times`
- [ ] Add BullMQ job for waitlist polling (every 15 min)

### Email
- [ ] Set up Resend account and add API key
- [ ] Send booking confirmation email on successful booking
- [ ] Send waitlist alert email when slot opens
