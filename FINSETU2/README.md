# FINSETU: Cybersecurity + Fintech + Digital Banking Platform

> **Tagline:** *"Bridging Finance and Digital Security."*

FINSETU is an institutional-grade, full-stack digital financial ecosystem that unites modern core banking, digital payments (UPI & Razorpay Test Gateway), and an autonomous cybersecurity threat simulation and impact monitoring intelligence center.

---

## 🏛️ System Architecture

```text
FINSETU/
├── client/                      # React 19 + Tailwind CSS + Lucide + Recharts
│   ├── src/
│   │   ├── components/          # DbStatusBanner, Navbar, Footer, Modals (Send, Receive, Deposit, Loan)
│   │   ├── context/             # AuthContext, SocketContext (WebSocket telemetry)
│   │   ├── pages/               # Landing, Dashboard, Transactions, LoginActivity, Simulator, Loans, Admin
│   │   ├── services/            # Axios API client with automatic token interception
│   │   └── styles/              # Clean banking tokens & Tailwind CSS
├── server/                      # Node.js + Express.js + Socket.IO + Prisma ORM
│   ├── src/
│   │   ├── controllers/         # Auth, Account, Transaction, Payment, Simulator, Loans, Admin
│   │   ├── middleware/          # JWT authentication, RBAC, Rate limiter, Helmet
│   │   ├── routes/              # Modular REST endpoints
│   │   ├── services/            # Prisma DB client, Simulator Engine, Device Parser
│   │   ├── socket/              # Socket.IO dual-portal synchronized broadcaster
│   │   └── utils/               # Bcrypt password hashing, JWT signing
│   ├── prisma/
│   │   ├── schema.prisma        # 14 complete PostgreSQL models with UUIDs & relations
│   │   └── seed.js              # Comprehensive demo seed script
│   ├── .env.example             # Supabase & Razorpay configuration template
│   └── .env                     # Server environment variables
├── package.json                 # Unified root automation scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v24)
- **npm**: v9+

### 2. Dependency Installation
Install server and client packages:
```bash
# In the project root:
cd server && npm install
cd ../client && npm install
```

### 3. Launching Locally
Open two terminal windows (or run from root):

**Terminal 1 (Backend Server on port 5000):**
```bash
cd server
npm run dev
# Or: node src/index.js
```

**Terminal 2 (Frontend Client on port 5173):**
```bash
cd client
npm run dev
```

Visit the application in your browser at:
👉 **[http://172.20.10.2:5173](http://172.20.10.2:5173)** (or local loopback `http://localhost:5173`)

---

## 🗄️ Database: Supabase & PostgreSQL Configuration

FINSETU uses **Prisma ORM** with **PostgreSQL**. It is architected to run seamlessly with [Supabase](https://supabase.com) or any hosted PostgreSQL database.

### Honesty Guarantee
> **Zero Fabricated Connections**: FINSETU executes real queries (`SELECT 1`) to test database reachability on startup. If database credentials are placeholder or unconfigured, the platform clearly reports:
> `⚠️ Running with demonstration data layer. Configure DATABASE_URL in server/.env to sync with Supabase.`

### Step-by-Step Supabase Connection:
1. Log in or create a free project at [https://supabase.com](https://supabase.com).
2. Navigate to: **Project Settings** ➔ **Database** ➔ **Connection string (URI)**.
3. Choose the **Transaction Pooler** URI (port `6543`) for `DATABASE_URL` and the **Direct Connection** URI (port `5432`) for `DIRECT_URL`.
4. Open `server/.env` and update the variables:
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
```
5. Push the Prisma database schema to Supabase:
```bash
cd server
npm run prisma:push
```
6. Seed the database with demonstration data:
```bash
npm run prisma:seed
```
7. Restart the backend. The UI status banner will dynamically illuminate:
   `🟢 PostgreSQL (Supabase) Database: Connected & Operational`

---

## 💳 Payment Gateway: Razorpay Test Environment

FINSETU integrates with **Razorpay Test Mode** to support card, net banking, and UPI sandbox deposits:
1. Obtain your test API keys at [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys).
2. Configure `server/.env`:
```env
RAZORPAY_KEY_ID="rzp_test_YourKeyHere"
RAZORPAY_KEY_SECRET="YourSecretKeyHere"
```
3. When depositing funds, signatures are verified server-side using cryptographic HMAC SHA256 hashes (`crypto.createHmac('sha256', secret)`).
4. Plain-text card details, CVVs, or UPI PINs are **never stored**.

---

## 🛡️ Pre-Seeded Demonstration Accounts

For instant evaluation, the platform includes pre-configured credentials:

| Account Type | Email | Password | Pre-loaded Balance | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Standard User** | `user@finsetu.com` | `Password@123` | ₹1,48,500.75 | `USER` |
| **SecOps Admin** | `admin@finsetu.com` | `Password@123` | ₹8,50,000.00 | `ADMIN` |
| **Recipient Counterparty** | `priya@finsetu.com` | `Password@123` | ₹42,100.00 | `USER` |

*You can also click "Open Digital Account" to register a new user; each new account is instantly provisioned with ₹25,000 testing credit.*

---

## 🧠 FINSETU Security Intelligence Centre (Dual Portals)

The Cyber Threat Simulator operates across two interconnected consoles synchronized in real time via **Socket.IO**:

### 🎯 Portal A: Attack Simulator
- **6 Realistic Threat Scenarios**:
  1. *Brute-Force Credential Stuffing* (Dictionary spray against `/api/auth/login`)
  2. *Deceptive Phishing Harvester* (Reverse-proxy spoofed KYC domain takedown)
  3. *Suspicious Device & Headless Browser* (Puppeteer/Selenium WebGL anomaly)
  4. *Account Takeover (ATO)* (Post-compromise rapid withdrawal freeze)
  5. *Anomalous Micro-Smurfing* (AML structuring evasion detection)
  6. *Man-in-the-Middle Session Hijacking* (JWT bearer token replay mitigation)
- **Controls**: `Start`, `Pause`, `Resume`, `Stop`, and `Reset`.
- **Live Terminal Event Feed**: Displays timestamped packets with `WARN`, `ALERT`, `ACTION`, and `SUCCESS` indicators.

### 🛡️ Portal B: Impact Analysis
- **Automatic Event Coupling**: When an attack executes in Portal A, Portal B updates without requiring a page refresh.
- **Metrics Displayed**: Detection response latency (e.g. `38ms`), potential financial impact estimates (e.g. `₹3,50,000.00`), automated mitigation playbooks, and containment status (`DEFENDED`, `BLOCKED`).
- **Interactive Recharts Charts**: Categorical threat distributions and historical 24h timeline telemetry.

---

## 📱 Major Features Overview

1. **🛡️ FinSetu AI Financial Guardian** (*“Know the impact before you pay.”*):
   - **🔮 What-If Payment Simulator**: Pre-calculates instant balance impact (`Before ↓ Payment ↓ After`), projects month-end balances based on burn rate, and computes dynamic AI Verdicts (`SAFE`, `CAUTION`, `HIGH IMPACT`, `CRITICAL`).
   - **Interactive Quick Amounts**: One-click dynamic buttons (`₹500`, `₹1,000`, `₹2,500`, `₹5,000`, `₹10,000`) for instant recalculation.
   - **🛡️ AI Payment Risk Guardian**: Multi-signal transaction risk analyzer (Amount, Recipient, Behaviour, Device, Time) computing real-time Trust Scores (e.g. `18 / 100 — HIGH RISK`).
   - **Agentic Safe Mode Action**: Features `PROTECT PAYMENT` and an interactive Safe Mode verification checklist modal.
2. **Banking Dashboard**: Real-time balance visibility, masked account numbers (`•••• •••• 6120`), double-entry ledger transfers, Recharts cash-flow trajectories, and quick action modals.
3. **Transaction Ledger**: Searchable, filterable audit trail differentiating simulated gateway deposits from verified ledger settlements.
4. **Login & Device Activity**: Detects browser, operating system, and IP address; discloses approximate geolocation honestly; allows single-session termination and "Logout From All Other Devices".
5. **Lending & Financial Services**: Personal, education, home, and enterprise loan offers with an interactive EMI calculator and instant automated pre-approval underwriting.
6. **SecOps Admin Console**: RBAC-protected operator dashboard featuring user account quarantine controls, suspicious attempt counters, and administrative audit logging.

---

## 🔒 Security Compliance Architecture

- **Zero Plain-Text Credentials**: Passwords salted and hashed with `bcryptjs`.
- **Session Protection**: JWT tokens stored in `httpOnly`, `SameSite=Lax` cookies with header fallback.
- **Brute-Force Protection**: Exponential rate limiting on `/api/auth/login` (50 attempts per 5 minutes per IP).
- **Hardening Headers**: Secured via `helmet` and strict CORS validation.
