# Local AI Chat Dashboard

This project implements a local-first AI chat app with a metrics dashboard. It includes:

- **Chat UI:** Streaming responses, suggestion chips, and rating UI.
- **Analytics Dashboard:** Volume, latency, size metrics, trends, and tables.
- **Offline resilience:** Queued suggestion clicks in IndexedDB/localStorage.

---

## Project Structure
.
├─ app/
│ ├─ api/ # API handlers (Next.js / Node)
│ ├─ analytics/ # UI components (charts, filters, sidebar, etc.)
│ └─ chat/ # chat app
├─ scripts/
│ └─ seed.ts # Seed database with test data
|- db/ database
├─ lib/  # mongo connection + offlineQueue
|─ models # data model
|─ public # images and files
├─ package.json
└─ README.md

---

## Setup & Run

### Prerequisites

- Node.js 22+
- MongoDB (local or remote)

### Local Setup
. Install dependencies:
npm install

### Run Project

npm run seed
npm run dev


