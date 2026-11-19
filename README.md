# BVTalent — Fun Cartoon-Style Talent Show Voting Website 🎉

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Tests-25%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev/)

> **"Watch the performances. Pick your champions. Change your mind. It's party time!"**

BVTalent is a complete, fun cartoon-style web application designed for live talent show parties, open-mic nights, dance battles, and casual party competitions. 

Designed like a colourful cartoon party game (bright yellow, neon pink, cyan, lime green, thick comic borders, bouncy buttons, and confetti), guests can vote directly from their phones without any registration, passwords, or tokens. Guests can change their vote as each new team takes the stage, and only their latest selection counts!

---

## 🎮 How the Party Voting Works

1. **Open on Phone:** A guest opens BVTalent on their phone (or scans the event QR code).
2. **Instant Device ID:** The website automatically assigns an anonymous `crypto.randomUUID()` saved in browser `localStorage`. No login, tokens, or registration!
3. **Pick a Performer:** The guest taps their favourite team card. Their selection is immediately recorded!
4. **Change Your Mind Anytime:** When another act performs and blows the crowd away, the guest simply taps that team. Their vote updates instantly.
5. **1 Device = 1 Active Vote:** Only the latest selected team counts. Vote changes never inflate total voter counts.
6. **Curtains Close & Winner Reveal:** The party host ends voting in the admin booth, locking all ballots, and reveals the champion with confetti and celebration animations!

---

## 🌈 Cartoon Party Theme & Visuals

- **Aesthetic:** Comic pop & cartoon arcade party game style!
- **Color Palette:**
  - 🌟 Lemon Yellow (`#FFE600`)
  - 💖 Neon Pink (`#FF2E93`)
  - ⚡ Electric Cyan (`#00F0FF`)
  - 🍏 Lime Green (`#22C55E`)
  - 🍊 Bright Orange (`#FF6B00`)
  - 💜 Bright Purple (`#9333EA`)
- **UI Elements:**
  - Thick 3px/4px black borders (`border-3 border-black`)
  - Hard cartoon drop-shadows (`shadow-[4px_4px_0px_#000]`)
  - Bouncy press animations (`active:translate-x-[2px] active:translate-y-[2px]`)
  - Playful speech-bubble stickers and party star badges
  - Funny messages:
    - *"WHO'S GOT THE TALENT?!"*
    - *"YOUR VOTE HAS LANDED! 🚀"*
    - *"Team switched! Don't tell the others 😂"*
    - *"AND THE WINNER IS..."*
    - *"IT'S A TIE! Multiple champions sharing the crown! 🤝👑"*

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 App Router (Single application, no separate Express backend) |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti, Framer Motion |
| **Analytics** | Recharts (Responsive bar chart of live device votes) |
| **Backend** | Next.js Route Handlers (`src/app/api/**/route.ts`) |
| **Validation** | Zod schemas |
| **Database** | MongoDB via Mongoose (Single `DeviceVote` collection with atomic upsert) |
| **Security** | Keyed HMAC-SHA256 device hashing (`DEVICE_HASH_SECRET`), bcrypt admin auth, HttpOnly JWT cookies |
| **Testing** | Vitest (24 automated unit & integration tests) |

---

## 🗄️ Database & Voting Logic

### Models

1. **`Event` Model:**
   - `name`: string
   - `description`: string
   - `status`: `"upcoming" | "open" | "closed"`
   - `resultsVisible`: boolean
   - `winnerTeamId`: ObjectId (ref: Team)
   - `currentPerformingTeamId`: ObjectId (ref: Team)
   - `lockUnperformedTeams`: boolean (default: `true`, prevents guests from voting for acts before they perform)
2. **`Team` Model:**
   - `name`: string
   - `description`: string
   - `image`: string
   - `color`: `"yellow" | "pink" | "cyan" | "lime" | "purple" | "orange"`
   - `hasPerformed`: boolean (auto-marked true when act hits the stage)
   - `performanceOrder`: number (line-up schedule position)
3. **`DeviceVote` Model:**
   - `deviceIdHash`: string (HMAC-SHA256, unique index)
   - `currentTeamId`: ObjectId (ref: Team)
   - `timestamps`: true

### Atomic Voting Operation

When a guest votes (`PUT /api/voting/me`):
1. Verifies event status is `open` (rejects if `upcoming` or `closed`).
2. Verifies `teamId` exists.
3. Hashes the browser `deviceId` using server-side `DEVICE_HASH_SECRET`.
4. Executes atomic upsert:
   ```ts
   await DeviceVote.findOneAndUpdate(
     { deviceIdHash },
     {
       $set: { currentTeamId: teamId, updatedAt: new Date() },
       $setOnInsert: { createdAt: new Date() },
     },
     { upsert: true, new: true }
   );
   ```
5. Exact 1 vote per device. No duplicates. Concurrency safe.

---

## 📱 Project Structure

```text
src/
  app/
    (public)/
      page.tsx            # Cartoon Landing Page ("WHO'S GOT THE TALENT?!")
      vote/page.tsx       # Main Guest Voting Page (Character Cards & Confetti)
      results/page.tsx    # Winner Announcement & Live Leaderboard
      layout.tsx          # Cartoon Navbar & Footer
    admin/
      login/page.tsx      # Organizer Booth Login
      page.tsx            # Redirect to Dashboard
      dashboard/page.tsx  # Host Control Center (Start/End Voting, Reveal, Charts)
      teams/page.tsx      # Add/Edit/Delete Performing Acts
      results/page.tsx    # Projector Screen Stage Mode
      layout.tsx          # Protected Admin Shell & Session Guard
    api/
      event/route.ts      # Event metadata & status
      teams/route.ts      # Participating teams
      voting/me/route.ts  # Device vote status (GET) & Atomic Vote/Switch (PUT)
      results/route.ts    # Public stage results (controlled by reveal toggle)
      admin/
        auth/login/route.ts
        auth/logout/route.ts
        auth/session/route.ts
        teams/route.ts
        teams/[id]/route.ts
        event/status/route.ts # Start / End Voting
        event/reveal/route.ts # Reveal Winner Toggle
        results/route.ts      # Live Host Analytics
  components/
    ui/                   # Button, Card, Badge, Modal, Input
    layout/               # Navbar, Footer
    teams/                # CartoonTeamCard
    voting/               # CartoonVotingGrid, Confetti
  lib/
    mongodb.ts            # Mongoose connection cache
    device.ts             # SSR-safe getDeviceId()
    security.ts           # HMAC-SHA256 device hashing & rate limiter
    voting.ts             # castOrUpdateDeviceVote()
    results.ts            # calculateLiveResults() & tie detection
    validations.ts        # Zod schemas
    bootstrap.ts          # Default event, admin, & cartoon acts
  models/
    Event.ts, Team.ts, DeviceVote.ts, Admin.ts
  types/
    index.ts
  tests/
    device_security.test.ts
    party_voting.test.ts
    validations.test.ts
    auth.test.ts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- MongoDB `v6.0+` (local instance or MongoDB Atlas)

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Settings in `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/bvtalent
ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=AdminTalent2026!
ADMIN_SESSION_SECRET=bvtalent_dev_super_secret_jwt_key_at_least_32_characters_minimum!
DEVICE_HASH_SECRET=bvtalent_dev_device_hash_secret_at_least_32_characters_minimum!
APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Admin Credentials
- **Login URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Username:** `admin`
- **Password:** `AdminTalent2026!`

---

## 🧪 Testing

Run the automated test suite with Vitest:
```bash
npm test
```

### Verified Test Suites (24 passing tests):
- ✅ **Device Identification & Security:** UUID validation, HMAC-SHA256 deterministic hashing, non-UUID rejection, rate limiting.
- ✅ **Party Voting Engine & Integrity:**
  - New device votes successfully.
  - Same device changes vote without increasing total voter count.
  - Multiple devices vote independently.
  - Voting rejected when status is `upcoming`.
  - Voting rejected when status is `closed`.
  - Rejection of invalid team IDs.
  - Automatic tie detection without arbitrarily picking a single winner.
  - Accurate percentage calculation.
- ✅ **Zod Schema Validations:** UUID deviceId format, 24-char ObjectId teamId, admin credentials, team data, event status.
- ✅ **Admin Authentication:** Password hashing with bcrypt, JWT session signing, token tampering rejection.

---

## 🎤 Party Host Operational Guide

1. **Before the Party:**
   - Log in at `/admin/login`.
   - Go to **Teams Roster** (`/admin/teams`) and add the acts performing tonight.
   - Leave voting in **Upcoming** or **Open**.
2. **During the Show:**
   - Guests scan the QR code and land on `/vote`.
   - Guests tap their favourite team as they watch the performances.
   - If another act impresses them later, they tap the new team to switch their vote!
   - The host watches the live vote counts and bar chart on the **Live Dashboard** (`/admin/dashboard`).
3. **Closing Voting & Crowning the Winner:**
   - Click **End Voting (Lock Votes)** on the dashboard.
   - The server locks all votes—no more changes are allowed.
   - Open `/admin/results` on the projector or stage screen.
   - Click **Reveal Winner on Screen! 🎉**
   - The stage screen blasts confetti and crowns the winning act (or displays a tie if votes are equal)!

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Import into [Vercel](https://vercel.com).
3. In Project Settings > Environment Variables, add:
   - `MONGODB_URI`
   - `ADMIN_USERNAME`
   - `INITIAL_ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `DEVICE_HASH_SECRET`
   - `APP_URL`
4. Deploy!
