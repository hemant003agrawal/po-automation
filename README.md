# PO Automation - Full Stack Prototype

A modern, responsive web application for automating Purchase Order (PO) processing from PDF and Excel files into a centralized system with real-time analytics, multi-currency support, and AI-powered chatbot assistance.

## ✨ Key Features

### 📄 Document Processing
- **PDF Upload & Extraction** - Auto-extract PO fields from PDF files
- **Excel Import** - Bulk import POs from Excel files with smart column detection
- **Drag & Drop** - Modern file upload interface with loading overlays

### 💰 Multi-Currency Support
- **USD & GBP** - Dual currency tracking with live exchange rates
- **Auto Conversion** - Real-time USD to GBP conversion (cached for performance)
- **Currency Filtering** - Filter orders by currency type

### 🤖 AI Chatbot
- **Smart Assistant** - Get answers about your PO data
- **Natural Language** - Ask questions in plain English
- **Data Insights** - Query orders, suppliers, and analytics

### 📊 Analytics Dashboard
- **Real-time Metrics** - Total orders, quantity, values in both currencies
- **Interactive Charts** - Supplier breakdown, brand analysis, delivery timeline
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Full-screen Loading** - Screen freeze with loader during data fetch

### 🔐 Security & UX
- **12-Hour Session** - Auto-logout after session expiry
- **Password Toggle** - Show/hide password on login
- **Professional Filters** - Advanced filtering with active filter chips
- **CSV Export** - Export filtered data to CSV

## 🎯 End-to-End Workflow

1. **Login** - Secure authentication with 12-hour session expiry
2. **Upload** - Drag & drop PDF/Excel files for processing
3. **Processing** - Full-screen loading overlay while data is extracted
4. **Dashboard** - View real-time analytics with currency toggle
5. **Filter** - Apply advanced filters with loading overlay
6. **Export** - Download filtered data as CSV
7. **Chatbot** - Ask questions about your data

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **PostgreSQL** - Relational database (via `pg`)
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **xlsx** - Excel file parsing
- **uuid** - Unique ID generation

### Frontend
- **React 19** + **TypeScript** - Modern React with types
- **Vite** - Fast build tool
- **Material UI v7** - Professional component library
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Recharts** - Interactive charts
- **Axios** - HTTP client

### Deployment
- **Netlify** - Frontend hosting (ready to deploy)

## 📁 Project Structure

```text
po-automation/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # API route controllers
│   │   ├── middleware/      # Auth & error handling
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & DB operations
│   │   └── utils/           # Utility functions
│   ├── migrations/          # Database migration scripts
│   ├── .env                 # Environment variables (not in git)
│   ├── package.json
│   └── server.js            # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API client & endpoints
│   │   ├── components/      # Reusable components
│   │   │   ├── chatbot/     # AI assistant component
│   │   │   ├── charts/      # Chart components
│   │   │   ├── common/      # Common utilities
│   │   │   ├── filters/     # Filter panel component
│   │   │   └── tables/      # Data table component
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ExcelUploadPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── TablePage.tsx
│   │   │   └── UploadPage.tsx
│   │   ├── routes/          # Route definitions
│   │   └── utils/           # Helper functions
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── package.json             # Root workspace config
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)

### 1. Clone & Install

```bash
cd po-automation

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend** (`backend/.env`):
```env
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run the Application

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### 4. Login

- **Email:** `Admin123@gmail.com`
- **Password:** `Admin@123`

## 📊 Features Breakdown

### 🔐 Authentication
- JWT-style token authentication (dummy-token for demo)
- 12-hour session expiry with auto-logout
- Protected routes with auth guard
- Password show/hide toggle

### 📄 File Upload
- **PDF Processing** - Extracts: supplier, brand, buyer, category, style number, quantity, price, dates
- **Excel Import** - Smart header detection, bulk insert with error handling
- **Progress Tracking** - Full-screen loading overlay during upload
- **Results Display** - Success/error counts with detailed error messages

### 📊 Dashboard
- **Summary Cards** - Colorful gradient cards for key metrics
- **Currency Toggle** - Switch between USD/GBP views
- **Interactive Charts** - Bar charts, pie charts, line graphs
- **Delivery Timeline** - Ex-factory vs delivery date visualization
- **Top Suppliers/Brands** - Ranked lists with values

### 📋 Data Table
- **Pagination** - Default 10 rows per page (options: 5, 10, 25, 50, 100)
- **Sorting** - Click column headers to sort
- **Currency Display** - Chips showing original currency
- **Responsive** - Horizontal scroll on mobile
- **CSV Export** - Download filtered data

### 🔍 Advanced Filters
- **Date Range** - From/To date pickers
- **Text Search** - Supplier, Category, Buyer (partial match)
- **Currency Filter** - USD, GBP, or All
- **Active Filters Display** - Chips showing current filters
- **One-click Clear** - Clear all filters button
- **Loading Overlay** - Screen freeze during filter application

### 🤖 Chatbot Assistant
- **Floating FAB** - Accessible from any page
- **Smart Responses** - Answers about orders, suppliers, analytics
- **Suggestions** - Quick action buttons
- **Message History** - Maintains conversation context

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

### Authentication
All protected endpoints require: `Authorization: Bearer dummy-token`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Login with email/password |

### Purchase Orders
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/purchase-orders` | GET | List orders with filters |
| `/purchase-orders/analytics` | GET | Dashboard analytics |

**Query Parameters:**
- `dateFrom`, `dateTo` - Date range filters
- `supplier` - Supplier name search
- `category` - Category search
- `buyer` - Buyer search
- `currency` - Currency filter (USD/GBP)

### Upload
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload PDF file |
| `/excel-import` | POST | Upload Excel file |

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (binary)

**Excel Import Response:**
```json
{
  "message": "Import completed",
  "total": 100,
  "successful": 95,
  "failed": 5,
  "skipped": 0,
  "errors": ["Row 3: Missing supplier", "Row 7: Invalid quantity"]
}
```

### Chatbot
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chatbot/query` | POST | Ask chatbot a question |

**Request:**
```json
{ "message": "How many orders from Nike?" }
```

## 🎨 UI/UX Highlights

### Design System
- **Color Gradients** - Modern purple, cyan, green, pink gradients
- **Rounded Corners** - 12-16px border radius throughout
- **Shadows** - Soft elevation shadows for depth
- **Icons** - Custom inline SVG icons (no external dependencies)
- **Typography** - Clean, modern font stack

### Responsive Breakpoints
- **Mobile:** < 600px (single column)
- **Tablet:** 600-900px (2 columns)
- **Desktop:** > 900px (3-4 columns)

### Loading States
- **Backdrop** - White semi-transparent overlay with blur
- **Spinner** - Brand-colored circular progress
- **Message** - Context-aware loading text
- **Freeze** - UI interaction blocked during loading

## 🧪 Testing

### Demo Data
Upload sample files from `frontend/public/`:
- `sample-po.pdf` - Sample PDF for testing extraction
- `sample-orders.xlsx` - Sample Excel for bulk import

### Test Scenarios
1. **Login Flow** - Test session expiry (set to 1 min for testing in dev)
2. **PDF Upload** - Upload sample PDF, verify extracted fields
3. **Excel Import** - Import sample Excel, check success/error counts
4. **Filters** - Apply various filters, verify results
5. **Currency Toggle** - Switch USD/GBP on dashboard
6. **Chatbot** - Ask questions about orders
7. **CSV Export** - Export filtered data, verify file contents

### Test Credentials
- **Email:** `Admin123@gmail.com`
- **Password:** `Admin@123`
- **Session Duration:** 12 hours (auto-logout)

## 🔒 Security Best Practices

- ✅ **Environment Variables** - All secrets in `.env` (not in git)
- ✅ **Token-based Auth** - Bearer token for API access
- ✅ **Session Expiry** - Auto-logout after 12 hours
- ✅ **Input Validation** - Server-side validation for all inputs
- ✅ **SQL Injection Safe** - Parameterized queries
- ✅ **CORS Configured** - Restricted to allowed origins
- ❌ **No Password Hashing** - Demo uses plain text (implement bcrypt for production)
- ❌ **Dummy Token** - Simple token (implement JWT for production)

## 🚀 Deployment

### Backend (e.g., Railway, Render, Heroku)
```bash
# Set environment variables:
- DATABASE_URL
- PORT (optional, defaults to 5000)

# Deploy:
git push origin main
```

### Frontend (Netlify)
```bash
cd frontend
npm run build
# Deploy `dist/` folder to Netlify
```

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📝 Changelog

### Recent Updates
- **Excel Import** - Smart column detection, bulk insert
- **Chatbot** - AI assistant for PO queries
- **Currency Support** - USD/GBP with live conversion
- **Session Management** - 12-hour expiry with auto-logout
- **Password Toggle** - Show/hide password on login
- **Loading Overlays** - Full-screen loading for uploads/filters
- **Responsive Filters** - Professional filter panel design
- **CSV Export** - Export filtered data

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/name`
2. Make changes with clear commit messages
3. Test thoroughly (backend + frontend)
4. Submit PR with description

### Code Style
- **Frontend:** ESLint + Prettier
- **Backend:** Consistent with existing patterns
- **Components:** Functional components with hooks
- **Types:** TypeScript for all new code

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Login   │  │ Dashboard│  │  Table   │  │  Upload  │     │
│  │  Page    │  │   Page   │  │   Page   │  │   Page   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │             │            │
│  ┌────┴─────────────┴─────────────┴─────────────┴─────────┐  │
│  │              React Query / Axios                       │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTPS/JSON
┌───────────────────────────┼──────────────────────────────────┐
│                        Backend                               │
│  ┌────────────────────────┴───────────────────────────────┐   │
│  │                 Express API Server                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│  │  │   Auth   │  │   PO     │  │  Upload  │  │Chatbot │ │   │
│  │  │ Routes   │  │  Routes  │  │  Routes  │  │ Routes │ │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │   │
│  └───────┼─────────────┼─────────────┼────────────┼──────┘   │
│          │             │             │            │            │
│  ┌───────┴─────────────┴─────────────┴────────────┴────────┐  │
│  │                    Services Layer                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │pdf-parse│  │   xlsx   │  │  openai  │  │currency  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │ SQL
┌───────────────────────────┼─────────────────────────────────────┐
│                     PostgreSQL Database                          │
│                    purchase_orders table                          │
│  id | supplier | brand | buyer | category | quantity | price     │
│  currency | price_usd | price_gbp | delivery_date | ...           │
└───────────────────────────────────────────────────────────────────┘

## 📚 Documentation

- **Main README** (this file) - Overview, setup, features
- **Backend README** (`backend/README.md`) - API docs, DB schema
- **Frontend README** (`frontend/README.md`) - Component docs, styling

## 📧 Contact & Support

For questions or issues:
- Check existing documentation
- Review code comments
- Test with sample data

---

**Made with ❤️ using React, Node.js, and PostgreSQL**
