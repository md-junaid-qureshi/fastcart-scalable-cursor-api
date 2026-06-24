# FastCart - High-Performance Cursor Pagination API.

A production-grade, minimalist e-commerce product catalog dashboard built with **Next.js App Router** and **Supabase (PostgreSQL)**, featuring lightning-fast cursor-based pagination and dynamic category filtering over a dataset of **200,000 records**.

## Key Architectural Highlights

* **Dataset Scale:** 200,000 mock products seeded seamlessly into cloud PostgreSQL.
* **Cursor Pagination ($O(1)$ Optimization):** Uses a composite lookup on `(created_at, id)` ensuring query response times remain under **500ms** even at the deep end of the dataset.
* **Zero Jank Infinite Scroll:** Implemented using frontend `IntersectionObserver` coupled natively with Next.js Serverless API routes.
* **Stripe-Inspired Minimal UI:** Fully optimized, clean industrial dashboard aesthetic focused strictly on structural data, layout boundaries, and clean hierarchy.


---

## Tech Stack & Infrastructure

* **Framework:** Next.js 14+ (App Router, React Serverless API Routes)
* **Database:** Supabase PostgreSQL Instance
* **Database Driver:** `pg` (Node-Postgres Pool Configuration with Global Hot-Reload Caching)
* **Styling:** Tailwind CSS (Strict Minimal Dashboard Token System)

---

## Project Architecture

```text
fastcart-cursor-api/
├── app/
│   ├── api/
│   │   └── products/
│   │       └── route.js     # Main Cursor & Filter API Logic
│   ├── db.js                # Global PG Connection Pool Instance
│   ├── layout.js            # Next.js Base Layout
│   └── page.js              # Infinite Scroll Frontend Dashboard (Client Component)
├── server/
│   └── seed.js              # Independent Admin Data-Seeding Script
├── .env.local               # Environment Variable Fragments (PGUSER, PGPASSWORD, etc.)
└── package.json

```

---

## API Core Logic (How Cursor Works Under the Hood)

Instead of performance-killing `OFFSET` pagination which scans all previous rows, this project uses a secure **Base64 Encoded Cursor** (`created_at_id`).

```typescript
// Sample extracted query logic from app/api/products/route.ts
if (cursor) {
  const [createdAt, rawId] = Buffer.from(cursor, 'base64').toString().split('_');
  params.push(createdAt, Number(rawId));
  conditions.push(`(created_at, id) < ($${params.length - 1}, $${params.length})`);
}

```

---

## Local Development Setup

### 1. Clone & Install Dependencies

```bash
git clone [https://github.com/md-junaid-qureshi/fastcart-scalable-cursor-api.git](https://github.com/md-junaid-qureshi/fastcart-scalable-cursor-api.git)
cd fastcart-cursor-api
npm install

```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
PGUSER="postgres"
PGPASSWORD="your_supabase_password"
PGHOST="your_supabase_host_url"
PGPORT=5432
PGDATABASE="postgres"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the live dashboard.

---

## API Verification Endpoints

* **Initial Fetch (Limit 5):** `http://localhost:3000/api/products?limit=5`
* **Category Specific Filter:** `http://localhost:3000/api/products?limit=5&category=Electronics`
* **Paginated Request (Using Token):** `http://localhost:3000/api/products?limit=5&cursor=<BASE64_CURSOR_STRING>`

