# PO Automation Backend

Backend API for PDF-based Purchase Order automation.

## 1) Tech Stack

- Node.js + Express
- PostgreSQL (`pg`)
- Multer (upload)
- `pdf-parse` (PDF text extraction)

## 2) Features Implemented

- Authentication (`/api/auth/login`)
- PDF upload and extraction (`/api/upload`)
- PO storage in PostgreSQL
- Filtered list API (`/api/purchase-orders`)
- Analytics API (`/api/purchase-orders/analytics`)
- Live USD -> GBP conversion with cached FX rates

## 3) Project Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    routes/
    services/
    utils/
  .env
  package.json
  server.js
```

## 4) Setup

Create `.env` (local only, do not commit):

```env
PORT=5000
DATABASE_URL=postgresql://postgres:6dyN7qltwr8N37Q3@db.ujgvbcwwtofllbcckhav.supabase.co:5432/postgres
```

For GitHub/deployment, use `.env.example` and set real values in hosting platform environment variables.

Install and run:

```bash
cd backend
npm install
npm run dev
```

Backend URL: `http://localhost:5000`

## 5) Database Schema

Table: `purchase_orders`

- `id` UUID primary key
- `supplier`, `brand`, `buyer`, `category`, `style_number`
- `quantity`, `price`
- `delivery_date`
- `confirmed_ex_factory_date`
- `created_at`

## 6) API Reference

### Login

`POST /api/auth/login`

```json
{ "email": "test123@gmail.com", "password": "123456" }
```

Response:

```json
{ "token": "dummy-token" }
```

### List Purchase Orders

`GET /api/purchase-orders`

Auth header required:

`Authorization: Bearer dummy-token`

Supported filters:

- `date`
- `dateFrom`, `dateTo`
- `supplier`
- `buyer`
- `category`

### Analytics

`GET /api/purchase-orders/analytics`

Returns:

- totals (orders, quantity, USD value, GBP value, live rate)
- supplier breakdown
- brand breakdown
- ex-factory vs delivery timeline

### Upload PDF

`POST /api/upload` (form-data key: `file`)

Behavior:

- extracts fields from PDF text where available
- fallback defaults if field missing
- inserts normalized PO row into DB

## 7) Architecture Flow

```mermaid
flowchart LR
  A[User Uploads PDF] --> B[Express Upload API]
  B --> C[pdf-parse Extraction]
  C --> D[Normalization & Validation]
  D --> E[(PostgreSQL purchase_orders)]
  E --> F[REST APIs]
  F --> G[Dashboard + Tables + Export]
```

## 8) Quick Test Steps

1. Run backend.
2. Login API and copy token.
3. Upload PDF with token.
4. Check list API with filters.
5. Check analytics API for dashboard insights.
