# PO Automation Frontend

Modern React application for Purchase Order automation with real-time analytics, multi-currency support, and AI-powered chatbot.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library with latest features |
| **TypeScript** | Type safety and IntelliSense |
| **Vite** | Fast development and optimized builds |
| **Material UI v7** | Professional component library |
| **React Router v7** | Client-side routing |
| **React Query** | Server state management, caching |
| **Recharts** | Interactive charts |
| **Axios** | HTTP client for API calls |

## 📁 Project Structure

```
src/
├── api/                       # API layer
│   ├── client.ts             # Axios instance with auth
│   ├── purchaseOrderApi.ts   # PO endpoints
│   └── authApi.ts            # Auth endpoints
│
├── components/               # Reusable components
│   ├── chatbot/
│   │   └── Chatbot.tsx       # AI assistant FAB
│   ├── charts/
│   │   └── ChartCard.tsx     # Chart wrapper
│   ├── common/
│   │   └── Loader.tsx        # Loading spinner
│   ├── filters/
│   │   └── FilterPanel.tsx   # Advanced filters
│   └── tables/
│       └── DataTable.tsx     # Paginated data table
│
├── hooks/                    # Custom React hooks
│   └── useAuth.tsx           # Auth + session expiry
│
├── pages/                    # Page components
│   ├── Dashboard.tsx         # Analytics dashboard
│   ├── ExcelUploadPage.tsx   # Excel bulk import
│   ├── LoginPage.tsx         # Login with password toggle
│   ├── TablePage.tsx         # PO data table
│   └── UploadPage.tsx        # PDF upload
│
├── routes/                   # Route definitions
│   └── AppRoutes.tsx         # Protected routes
│
└── utils/                    # Utilities
    └── csv.ts                # CSV export logic
```

## ✨ Features

### 🔐 Authentication & Security
- **Login Page** - Colorful gradient design
- **Password Toggle** - Show/hide password with eye icon
- **Session Expiry** - 12-hour auto-logout
- **Protected Routes** - Auth guard for private pages

### 📊 Dashboard
- **Summary Cards** - Gradient cards with icons
  - Total Orders (blue)
  - Total Quantity (green)
  - Value USD (pink)
  - Value GBP (yellow)
- **Currency Toggle** - Switch USD/GBP view
- **Interactive Charts**:
  - Supplier quantity (bar chart)
  - Brand value (pie chart)
  - Delivery timeline (line chart)
- **Top Entities** - Ranked supplier/brand lists
- **Loading Overlay** - Full-screen freeze during filter

### 📋 Data Table
- **Pagination** - Default 10 rows, options [5,10,25,50,100]
- **Sorting** - Click headers to sort
- **Currency Chips** - Shows original currency (USD/GBP)
- **Dual Values** - Shows USD and GBP columns
- **Responsive** - Horizontal scroll on mobile
- **CSV Export** - Download filtered data

### 🔍 Filters
- **Professional Design** - Card with gradient header
- **Icon Adornments** - Icons in all input fields
- **Date Range** - From/To date pickers
- **Text Filters** - Supplier, Category, Buyer
- **Currency Dropdown** - USD/GBP/All
- **Active Filter Chips** - Shows applied filters
- **Clear All Button** - One-click reset

### 📤 Upload Pages
- **PDF Upload** - Drag & drop with preview
- **Excel Import** - Bulk upload with progress
- **Loading Overlay** - Screen freeze during upload
- **Results Display** - Success/error counts

### 🤖 Chatbot
- **Floating FAB** - Accessible from all pages
- **Message History** - Scrollable chat
- **Typing Indicator** - Shows bot is thinking
- **Suggestions** - Quick action buttons

## 🚀 Development

### Quick Start

```bash
cd frontend
npm install
npm run dev
```

**App runs on:** `http://localhost:5173`

### Environment Variables

Create `.env` in `frontend/` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Build for Production

```bash
npm run build
# Output in dist/
```

### Preview Production Build

```bash
npm run preview
```

## 🔑 Login Credentials

| Field | Value |
|-------|-------|
| **Email** | `Admin123@gmail.com` |
| **Password** | `Admin@123` |

**Features:**
- Password show/hide toggle
- 12-hour session (auto-logout)

## 📖 Usage Guide

### 1. Login
- Navigate to login page
- Enter credentials
- Click "Sign In"
- Session expires after 12 hours

### 2. Upload Files

**PDF Upload:**
- Go to "Upload PDF" page
- Drag & drop PDF or click to select
- Click "Upload and Extract"
- Wait for processing overlay
- View extracted data

**Excel Import:**
- Go to "Import Excel" page
- Download template if needed
- Upload Excel file
- View import results (success/failed counts)

### 3. View Dashboard
- Toggle USD/GBP view
- View summary cards and charts
- Check delivery timeline
- Apply filters with loading overlay

### 4. Browse Orders
- Go to "Orders Table"
- Apply filters (date, supplier, etc.)
- Click "Apply Filters" (shows loading)
- View paginated results
- Export to CSV if needed

### 5. Use Chatbot
- Click floating chat icon
- Type question about orders
- Get instant answers

## 🔧 Component Details

### FilterPanel
Professional filter component with:
- Purple gradient header
- Icons in all inputs (Calendar, Building, Tag, Person, Currency)
- Active filter count badge
- Clear All button (when filters active)
- Responsive grid layout
- Loading state support

### DataTable
Feature-rich table with:
- Client-side pagination
- Column sorting
- Currency formatting
- Color-coded quantity/value
- Responsive horizontal scroll
- Empty state handling

### Chatbot
AI assistant with:
- Collapsible FAB trigger
- Message bubbles (user/bot)
- Avatar icons
- Typing animation
- Quick suggestion chips
- Auto-scroll to latest message

### useAuth Hook
Custom hook providing:
- `token` - Current auth token
- `isAuthenticated` - Auth state
- `login(token)` - Save token with expiry
- `logout()` - Clear token
- Auto-logout after 12 hours
- Expiry check on mount and focus

## 🎨 Design System

### Colors
```typescript
// Primary Gradient
'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// Card Gradients
'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'  // Blue
'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'  // Green
'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'  // Pink
'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'  // Purple
'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'  // Cyan
```

### Icons
All icons are inline SVG components (no external dependencies):
```typescript
const MyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="..." />
  </svg>
);
```

### Loading Overlay
Standard backdrop implementation:
```typescript
<Backdrop
  open={isLoading}
  sx={{
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(8px)",
    zIndex: theme => theme.zIndex.drawer + 1,
  }}
>
  <CircularProgress size={60} />
  <Typography>Loading...</Typography>
</Backdrop>
```

## 🔌 API Integration

### Auth
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string }
```

### List Orders
```typescript
GET /api/purchase-orders
Query: { dateFrom, dateTo, supplier, category, buyer, currency }
Response: PurchaseOrder[]
```

### Analytics
```typescript
GET /api/purchase-orders/analytics
Query: { dateFrom, dateTo, supplier, category, buyer, currency }
Response: {
  totals: { totalOrders, totalQuantity, totalValueUsd, totalValueGbp, usdToGbpRate },
  bySupplier: Record<string, EntityMetrics>,
  byBrand: Record<string, EntityMetrics>,
  timeline: TimelineEntry[]
}
```

### Upload
```typescript
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File }

POST /api/excel-import
Content-Type: multipart/form-data
Body: { file: File }
Response: { total, successful, failed, skipped, errors: string[] }
```

### Chatbot
```typescript
POST /api/chatbot/query
Body: { message: string }
Response: { response: string }
```

## 🧪 Testing

### Manual Test Cases

1. **Login Flow**
   - Navigate to login
   - Toggle password visibility
   - Login with credentials
   - Verify 12h session in localStorage

2. **PDF Upload**
   - Upload `public/sample-po.pdf`
   - Verify loading overlay appears
   - Check extracted data in table

3. **Excel Import**
   - Upload sample Excel
   - Check success/failed counts
   - Verify error messages

4. **Dashboard Filters**
   - Apply date filter
   - Check loading overlay
   - Verify chart updates

5. **Currency Toggle**
   - Switch USD/GBP
   - Verify values update
   - Check rate display

6. **CSV Export**
   - Apply filters
   - Click Export CSV
   - Verify file download

### Sample Files
Located in `frontend/public/`:
- `sample-po.pdf` - Test PDF extraction
- `sample-orders.xlsx` - Test Excel import

## 📝 Code Style

- **Components:** Functional with TypeScript
- **Styling:** MUI sx prop + inline styles
- **State:** React Query for server, useState for UI
- **Icons:** Inline SVG (no @mui/icons-material)
- **Comments:** Minimal, self-documenting code

## 🚀 Deployment

### Netlify (Recommended)
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Environment
- Set `VITE_API_BASE_URL` in hosting dashboard
- Configure CORS on backend for frontend domain

## 📞 Support

For issues or questions:
1. Check component source in `src/components/`
2. Review API calls in `src/api/`
3. Check browser console for errors

---

**Built with React, TypeScript, and Material UI**
