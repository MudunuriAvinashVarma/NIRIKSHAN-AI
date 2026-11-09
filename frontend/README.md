# NIRIKSHAN AI — Frontend

> **Intelligence Behind Every Public Fund.**
> A Public Finance Intelligence Platform for MPLADS sanctioned works analysis.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **Lucide React**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default content:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🌐 FastAPI Backend Integration & Resilient Architecture

The frontend automatically detects whether the FastAPI backend is running:
- **FastAPI Live Mode**: When `http://127.0.0.1:8000` is active, the app queries `GET /api/v1/anomalies` with `state`, `work_status`, `limit`, and `offset` filters.
- **Offline / Vercel Snapshot Mode**: If the local Python backend is offline or during static cloud deployments, the platform seamlessly falls back to the embedded authentic dataset snapshot (3,487 works analyzed, peer percentiles, and explanation signals).
- **Live Status Indicator**: A live status indicator pill in the navigation header displays backend connectivity in real time.

---

## 🏛️ Website Pages & Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | **Landing Page** | Premium dark fintech hero, platform metrics, analytical pipeline, core capabilities |
| `/dashboard` | **National Dashboard** | Macro KPI cards, delay distributions, state cohort breakdowns, work status donut, score curve |
| `/anomalies` | **Anomaly Intelligence** | Searchable candidate review matrix, state/status/signal filters, pagination, CSV export |
| *Modal* | **Work Investigation Dossier** | Granular project dossier, delay metrics, cohort peer percentiles, and ethical notices |
| `/methodology` | **ML Methodology** | Unsupervised Isolation Forest, Cohort Benchmarking, PCA, and XAI signal generation |
| `/about` | **About & Governance** | Official data sources (data.gov.in & MoSPI), objectives, responsible AI principles |

---

## 🎨 Brand Design Tokens

- **Main Background**: `#0B0D0C`
- **Secondary Surface**: `#121512`
- **Card Background**: `#191D19`
- **Primary Text**: `#F5F3ED`
- **Muted Text**: `#92968E`
- **Brand Gold**: `#C99A55`
- **Light Gold**: `#E2B873`
- **Warning Amber**: `#E9A23B`
- **Critical Coral**: `#E45D52`
- **Success Emerald**: `#65B88A`

---

## ☁️ Vercel Deployment

Deploy with one click or using the Vercel CLI:
```bash
cd frontend
npx vercel
```
Set Root Directory to `frontend` in your Vercel Project Settings if deploying from the root repository.
