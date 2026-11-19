# BVTalent — Full-Stack Talent Show Voting Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Tests-22%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev/)

> **Core Principle: One eligible voter = one vote = one team.**

BVTalent is a production-ready, digital voting web application designed for live talent shows, music festivals, dance competitions, and entertainment events. Built with an immersive party-style visual design (deep violet, neon pink, electric purple, cyan accents, stage lighting effects), the platform enables audience members to vote from their mobile phones in under 10 seconds while providing event organizers with real-time analytics, voter pass management, and stage projector display modes.

---

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture & Security](#architecture--security)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Testing](#testing)
- [Event Operation Guide](#event-operation-guide)
- [API Documentation](#api-documentation)
- [Deployment to Vercel](#deployment-to-vercel)

---

## Key Features

### 🌟 Audience Voting Experience
- **Mobile-First Party Theme:** High-energy dark aesthetic with cinematic stage glows, responsive typography, and large touch targets designed for smartphones scanning a QR code.
- **Sub-10-Second Voting Flow:**
  1. Audience taps **Vote Now** or scans event QR code.
  2. Selects exactly one competing team.
  3. Enters their unique, non-sequential voting code.
  4. Reviews choice in a clear confirmation modal.
  5. Submits and celebrates with confetti, team artwork, and thank-you confirmation.
- **Real-Time State Awareness:** Automatically displays whether voting is Upcoming, Open, Paused, or Closed.

### 🛡️ One Person = One Vote Security
- **Cryptographic Randomness:** Voter codes are generated using high-entropy random characters (e.g. `BVT-8K4F-9W2M`), avoiding sequential predictability.
- **HMAC-SHA256 Hashing:** Raw voter codes are never stored in the database. Only keyed HMAC-SHA256 hashes using a server-side pepper are persisted.
- **Atomic Database Operations & Unique Indexes:** MongoDB unique indexes on `Vote.voterId` and atomic `findOneAndUpdate({ _id: voterId, hasVoted: false }, ...)` guarantee race-condition immunity. Two simultaneous requests with the same code cannot double-vote.
- **Sliding-Window Rate Limiting:** Brute-force code guessing and API flooding are blocked at the server level.

### 📊 Real-Time Analytics & Live Leaderboard
- **Live Leaderboard:** Animated rank badges (Gold #1, Silver #2, Bronze #3), vote totals, percentage shares, and live progress bars.
- **Stage Projector Fullscreen Mode:** One-click toggle that expands the leaderboard into high-contrast stage view for venue projectors or arena screens.
- **Live Auto-Refresh Polling:** Real-time updates with pause/resume controls and visual pulse indicators.
- **Recharts Analytics in Admin Portal:**
  - **Vote Distribution:** Donut chart of team vote shares.
  - **Activity Timeline:** Area chart of vote traffic over time with peak surge interval calculation.
  - **Team Comparison:** Bar chart comparing total votes.
  - **Participation Rate:** Real-time percentage of eligible passes redeemed.

### 🎛️ Organizer & Admin Control Center
- **Secure Authentication:** HttpOnly, Secure, SameSite JWT session cookies with bcrypt password hashing.
- **Instant State Controls:** Open Voting, Pause Voting, Resume Voting, and Permanently Close Voting with confirmation dialogs.
- **Pass Management:**
  - Bulk generate 1 to 1,000 passes at a time.
  - Plaintext codes revealed safely only once at generation time for organizer copying or `.txt` download.
  - Disable or re-enable individual passes on the fly.
  - Export all pass statuses as CSV for audit reconciliation.
- **Team Roster Management:**
  - Create, update, reorder, and activate/deactivate teams.
  - Soft-deactivation / archiving when votes already exist to preserve historical audit integrity.
- **Visibility Settings:** Toggle public results visibility, toggle raw counts (show percentages only to build suspense), and toggle rank numbers.
- **Administrative Audit Trail:** Immutable log of all administrative actions, timestamps, and state transitions.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 14 (App Router)](https://nextjs.org/) |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti |
| **Charts & Analytics** | [Recharts](https://recharts.org/) |
| **Backend** | Next.js Route Handlers (`src/app/api/**/route.ts`) |
| **Validation** | [Zod](https://zod.dev/) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Security & Auth** | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), HMAC-SHA256 (`crypto`) |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## Architecture & Security

```
Audience Member (Mobile Browser / QR)
       │
       ▼
   POST /api/votes
       │
       ├── 1. Rate Limiting (IP Sliding Window)
       ├── 2. Zod Schema Validation
       ├── 3. Event State Check (Status == "OPEN")
       ├── 4. Team Active Check
       ├── 5. HMAC-SHA256 Voter Code Hash Computation
       ├── 6. Atomic MongoDB Voter State Transition ({ hasVoted: false } -> { hasVoted: true })
       ├── 7. Vote Insert with Unique Index on voterId
       └── 8. Success Response (Confetti & Confirmation)
```

---

## Project Structure

```text
bvtalent/
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx            # Public Landing Page & Contestants Preview
│   │   │   ├── vote/page.tsx       # Live Voting Experience
│   │   │   ├── results/page.tsx    # Public Stage Leaderboard
│   │   │   └── layout.tsx          # Public Layout with Navigation & Footer
│   │   ├── admin/
│   │   │   ├── login/page.tsx      # Admin Authentication Page
│   │   │   ├── dashboard/page.tsx  # Analytics & Event Control Center
│   │   │   ├── teams/page.tsx      # Teams CRUD & Roster Management
│   │   │   ├── voters/page.tsx     # Voter Pass Generation & Export
│   │   │   ├── results/page.tsx    # Live Leaderboard & Visibility Toggles
│   │   │   ├── settings/page.tsx   # Event Config & Audit Log
│   │   │   └── layout.tsx          # Protected Admin Shell & Sidebar
│   │   ├── api/
│   │   │   ├── event/              # Event Info & Status
│   │   │   ├── teams/              # Active Teams List
│   │   │   ├── votes/              # Atomic Vote Processing
│   │   │   ├── results/            # Sanitized Live Results
│   │   │   ├── voter/              # Pass Pre-validation
│   │   │   └── admin/              # Auth, Teams, Voters, Voting, Analytics, Settings
│   │   ├── globals.css             # Party Theme & Glow Styles
│   │   ├── layout.tsx              # Root HTML & Metadata Shell
│   │   └── not-found.tsx           # Custom 404 Page
│   │
│   ├── components/
│   │   ├── ui/                     # Button, Input, Card, Modal, Badge
│   │   ├── layout/                 # Navbar, Footer, AdminSidebar, AdminHeader
│   │   ├── landing/                # HeroSection, EventCountdown, HowItWorks
│   │   ├── voting/                 # VotingFlow, ConfirmationModal, SuccessScreen, Confetti
│   │   ├── teams/                  # TeamCard, TeamGrid
│   │   ├── leaderboard/            # LiveLeaderboard, LeaderboardRow
│   │   ├── admin/                  # StatCard, ConfirmDialog, VotingControls
│   │   └── analytics/              # VoteDistributionChart, VoteActivityChart, TeamComparisonChart
│   │
│   ├── models/                     # Mongoose Models (Team, Voter, Vote, Event, Admin, AuditLog)
│   ├── lib/                        # mongodb, auth, security, validations, analytics, bootstrap
│   ├── types/                      # TypeScript Interfaces
│   └── tests/                      # Vitest Suites
│
├── .env.example
├── vitest.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js `v18+` or `v20+`
- MongoDB `v6.0+` (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/bvtalent.git
   cd bvtalent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment values:
```env
# MongoDB Connection String (MongoDB Atlas or local)
MONGODB_URI=mongodb://localhost:27017/bvtalent

# JWT and Admin Session Secret (min 32 characters)
AUTH_SECRET=bvtalent_super_secret_jwt_key_at_least_32_chars_long

# Cryptographic Pepper for Voter Code Hashing (HMAC secret, min 32 characters)
VOTER_CODE_PEPPER=bvtalent_voter_code_secret_pepper_value_min_32_chars

# Public URL
APP_URL=http://localhost:3000

# Initial Admin Bootstrap Credentials
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=AdminTalent2026!
```

### Automatic Bootstrap
On first launch, BVTalent automatically initializes:
1. Default Event Configuration (`BVTalent Show 2026`).
2. Default Superadmin account (`admin` with password from `INITIAL_ADMIN_PASSWORD`).
3. Showcase contestant acts if the roster is empty.

### Running Locally
```bash
# Run Development Server
npm run dev

# Run Production Build
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing

Run the automated test suite with Vitest:
```bash
npm test
```
The test suite validates:
- Cryptographic voter code generation and formatting.
- HMAC-SHA256 normalization and collision resistance.
- Sliding-window rate limiting.
- Zod schema validation rules.
- Password hashing and JWT session handling.
- Voting state enforcement (Upcoming, Open, Paused, Closed).
- Concurrency simulation ensuring two simultaneous requests cannot use the same pass.
- Analytics percentage and participation rate math.

---

## Event Operation Guide

### 1. Before the Show
1. Sign in to the Organizer Portal at `/admin/login`.
2. Review participating acts in **Teams Roster** (`/admin/teams`). Add photos and descriptions.
3. Generate voting passes in **Voter Passes** (`/admin/voters`). Click **Generate Passes**, enter the expected attendance (e.g. 250), copy the generated codes or export to CSV.
4. Print or distribute the codes on event seat flyers or QR cards.
5. In **Event Settings** (`/admin/settings`), set the show start time.

### 2. During the Show
1. Keep voting in **UPCOMING** or **PAUSED** mode while acts perform.
2. When performances conclude, click **Open Voting** on the Dashboard (`/admin/dashboard`).
3. Display the live leaderboard on the venue projector at `/results` and press **Stage Projector** for fullscreen display.
4. If organizers need to deliver announcements or pause voting, click **Pause Voting**.
5. When the countdown ends, click **Close Permanently** to lock in the final votes.

### 3. Announcing the Winner
1. Review the final audited numbers in **Live Stage Results** (`/admin/results`).
2. If vote counts were hidden to maintain suspense, toggle **Counts: Visible** to reveal total ballots cast.
3. Crown the winner!

---

## API Documentation

### Public Endpoints
- `GET /api/event`: Event metadata and voting status.
- `GET /api/teams`: List of all active competing acts.
- `POST /api/votes`: Submit a ballot (`{ voterCode: string, teamId: string }`).
- `GET /api/results`: Public stage results (sanitized according to visibility settings).
- `POST /api/voter`: Check if a voting pass code is valid and unused.

### Admin Endpoints (Protected by JWT Session Cookie)
- `POST /api/admin/auth/login`: Administrator login.
- `POST /api/admin/auth/logout`: Administrator logout.
- `GET /api/admin/auth/session`: Current admin session user.
- `GET /api/admin/teams`: Roster with live vote totals.
- `POST /api/admin/teams`: Create new act.
- `PATCH /api/admin/teams/:id`: Update act details or display order.
- `DELETE /api/admin/teams/:id`: Delete or soft-archive act.
- `GET /api/admin/voters`: List passes with pagination and status filters.
- `POST /api/admin/voters/generate`: Generate random voter codes.
- `PATCH /api/admin/voters/:id`: Enable or disable a pass.
- `GET /api/admin/voters/export`: Download passes status as CSV.
- `POST /api/admin/voting/open`: Open voting.
- `POST /api/admin/voting/pause`: Pause voting.
- `POST /api/admin/voting/resume`: Resume voting.
- `POST /api/admin/voting/close`: Close voting permanently.
- `GET /api/admin/analytics/overview`: High-level KPIs.
- `GET /api/admin/analytics/teams`: Team vote distribution.
- `GET /api/admin/analytics/activity`: Activity timeline buckets.
- `GET /api/admin/analytics/participation`: Pass usage ratios.
- `GET /api/admin/settings`: Settings and audit logs.
- `PATCH /api/admin/settings`: Update event settings.

---

## Deployment to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. Set the following Environment Variables in Vercel Project Settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI.
   - `AUTH_SECRET`: Random 32+ character string.
   - `VOTER_CODE_PEPPER`: Random 32+ character string.
   - `APP_URL`: Your Vercel production URL (e.g., `https://bvtalent.vercel.app`).
   - `INITIAL_ADMIN_USERNAME`: `admin`
   - `INITIAL_ADMIN_PASSWORD`: A strong initial password.
4. Click **Deploy**. Vercel will build and deploy the Next.js App Router application.

---

## License

This project is proprietary software for BVTalent event productions.
