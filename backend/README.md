# PO Automation Backend

Production-ready Node.js/Express API for Purchase Order automation with PDF extraction, Excel import, multi-currency support, and AI chatbot integration.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express** | Web framework |
| **PostgreSQL** | Relational database |
| **Multer** | File upload handling |
| **pdf-parse** | PDF text extraction |
| **xlsx** | Excel file parsing |
| **uuid** | Unique ID generation |
| **pg** | PostgreSQL client |

## 📁 Project Structure

```
src/
├── config/
│   └── db.js                 # Database connection config
├── controllers/
│   ├── authController.js     # Login authentication
│   ├── chatbotController.js  # AI chatbot queries
│   ├── excelImportController.js  # Excel bulk import
│   ├── purchaseOrderController.js # PO CRUD operations
│   └── uploadController.js   # PDF upload & extraction
├── middleware/
│   ├── authMiddleware.js     # JWT token verification
│   └── errorHandler.js       # Global error handling
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── chatbotRoutes.js      # Chatbot endpoints
│   ├── excelImportRoutes.js  # Excel import endpoints
│   ├── purchaseOrderRoutes.js # PO endpoints
│   └── uploadRoutes.js       # Upload endpoints
├── services/
│   ├── chatbotService.js     # AI chatbot logic
│   ├── currencyService.js    # USD/GBP exchange rates
│   ├── excelImportService.js # Excel parsing & import
│   ├── pdfExtractService.js  # PDF text extraction
│   ├── purchaseOrderService.js # PO database operations
│   └── uploadService.js      # Upload processing
└── utils/
    ├── appError.js           # Custom error class
    └── catchAsync.js         # Async error wrapper
```

## ✨ Features

### 🔐 Authentication
- Simple token-based auth (dummy-token for demo)
- Bearer token verification middleware
- 12-hour session concept (enforced in frontend)

### 📄 Document Processing
- **PDF Extraction** - Extract PO fields from uploaded PDFs
- **Excel Import** - Bulk import with smart header detection
- **Smart Column Mapping** - Auto-detects PO Number, Supplier, Style, etc.
- **Error Handling** - Failed rows reported with details

### 💰 Multi-Currency
- **USD & GBP Support** - Store and convert between currencies
- **Live Exchange Rates** - Cached USD to GBP conversion
- **Dual Price Storage** - Store both USD and GBP values

### 🤖 AI Chatbot
- **Natural Language Queries** - Ask questions about PO data
- **Smart Responses** - Returns order counts, supplier info
- **Context Aware** - Understands supplier, brand, date queries

### 📊 Analytics
- **Aggregated Metrics** - Total orders, quantity, value
- **Supplier Breakdown** - Orders and values by supplier
- **Brand Analysis** - Orders and values by brand
- **Timeline Data** - Ex-factory vs delivery dates

### 🛡️ Data Validation
- **Required Fields** - Supplier, Brand, Quantity, Price
- **Default Values** - Auto-fill missing data with defaults
- **Type Conversion** - Parse numbers, dates automatically

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud like Supabase)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
```

### 3. Database Setup

The app auto-creates the `purchase_orders` table on startup with all required columns:
- `id` (UUID, Primary Key)
- `supplier`, `brand`, `buyer`, `category`
- `style_number`, `quantity`, `price`
- `currency`, `price_usd`, `price_gbp`
- `delivery_date`, `confirmed_ex_factory_date`
- `created_at`

### 4. Run Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

**API runs on:** `http://localhost:5000/api`

## 🔌 API Reference

### Authentication

#### POST /api/auth/login
Login with credentials.

**Request:**
```json
{
  "email": "Admin123@gmail.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "dummy-token"
}
```

---

### Purchase Orders

All endpoints require: `Authorization: Bearer dummy-token`

#### GET /api/purchase-orders
List purchase orders with filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `dateFrom` | string | Start date (YYYY-MM-DD) |
| `dateTo` | string | End date (YYYY-MM-DD) |
| `supplier` | string | Supplier name (partial match) |
| `category` | string | Category (partial match) |
| `buyer` | string | Buyer name (partial match) |
| `currency` | string | Filter by USD/GBP |

**Response:**
```json
[
  {
    "id": "uuid",
    "supplier": "Nike Inc",
    "brand": "Nike",
    "buyer": "John Doe",
    "category": "Footwear",
    "style_number": "NK-123",
    "quantity": 1000,
    "price": 25.50,
    "currency": "USD",
    "price_usd": 25500.00,
    "price_gbp": 20145.00,
    "delivery_date": "2024-06-15",
    "confirmed_ex_factory_date": "2024-06-10"
  }
]
```

#### GET /api/purchase-orders/analytics
Get dashboard analytics.

**Query Parameters:** Same as list endpoint

**Response:**
```json
{
  "totals": {
    "totalOrders": 150,
    "totalQuantity": 50000,
    "totalValueUsd": 1250000.00,
    "totalValueGbp": 987500.00,
    "usdToGbpRate": 0.79
  },
  "bySupplier": {
    "Nike": {
      "count": 50,
      "quantity": 20000,
      "valueUsd": 500000,
      "valueGbp": 395000
    }
  },
  "byBrand": { ... },
  "timeline": [
    {
      "date": "2024-06-15",
      "deliveryCount": 5,
      "exFactoryCount": 3
    }
  ]
}
```

---

### File Upload

#### POST /api/upload
Upload and process PDF file.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (PDF binary)

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier": "Nike Inc",
    "brand": "Nike",
    "buyer": "John Doe",
    "category": "Footwear",
    "styleNumber": "NK-123",
    "quantity": 1000,
    "price": 25.50,
    "currency": "USD",
    "deliveryDate": "2024-06-15"
  }
}
```

#### POST /api/excel-import
Bulk import from Excel file.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (Excel binary)

**Response:**
```json
{
  "message": "Import completed",
  "total": 100,
  "successful": 95,
  "failed": 5,
  "skipped": 0,
  "errors": [
    "Row 3: Missing supplier",
    "Row 7: Invalid quantity"
  ]
}
```

---

### Chatbot

#### POST /api/chatbot/query
Ask the AI assistant a question.

**Request:**
```json
{
  "message": "How many orders from Nike?"
}
```

**Response:**
```json
{
  "response": "There are 50 orders from Nike totaling $500,000 USD."
}
```

## 🗄️ Database Schema

### Table: purchase_orders

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `supplier` | TEXT | Supplier name |
| `brand` | TEXT | Brand name |
| `buyer` | TEXT | Buyer name |
| `category` | TEXT | Product category |
| `style_number` | TEXT | Style/SKU number |
| `quantity` | INTEGER | Order quantity |
| `price` | NUMERIC | Unit price |
| `currency` | TEXT | USD or GBP |
| `price_usd` | NUMERIC | Total value in USD |
| `price_gbp` | NUMERIC | Total value in GBP |
| `delivery_date` | DATE | Delivery date |
| `confirmed_ex_factory_date` | DATE | Factory exit date |
| `created_at` | TIMESTAMP | Auto-set on insert |

### Smart Column Detection (Excel Import)

The Excel importer automatically detects these column variations:

| Field | Detected Column Names |
|-------|----------------------|
| PO Number | `po`, `po number`, `pono`, `order number` |
| Supplier | `supplier`, `vendor`, `factory`, `manufacturer` |
| Style | `style`, `style number`, `style no`, `sku`, `article` |
| Quantity | `quantity`, `qty`, `pcs`, `units`, `order qty` |
| Price | `price`, `unit price`, `cost`, `value`, `rate` |
| Currency | `currency`, `curr`, `ccy`, `money` |
| Delivery | `delivery`, `delivery date`, `ship date`, `etd` |
| Ex-Factory | `ex-factory`, `ex factory`, `factory date`, `exit date` |
| Brand | `brand`, `brand name` |
| Buyer | `buyer`, `buyer name`, `customer` |
| Category | `category`, `product type`, `dept` |

## 🔧 Services

### currencyService.js
Manages USD to GBP exchange rates with caching.

```javascript
// Get current rate (cached for 30 minutes)
const rate = await getUsdToGbpRate();
// Returns: 0.79 (example)
```

### excelImportService.js
Handles Excel parsing and bulk import.

**Key Features:**
- Smart header detection
- Row-by-row validation
- Error collection
- Currency conversion
- UUID generation for IDs

### pdfExtractService.js
Extracts text from PDF files.

**Extracted Fields:**
- Supplier info
- PO numbers
- Quantities
- Prices
- Dates

### purchaseOrderService.js
Database operations for POs.

**Methods:**
- `getPurchaseOrders(filters)` - Query with filters
- `createPurchaseOrder(data)` - Insert new PO
- `getAnalyticsSummary(filters)` - Aggregated data
- `ensureTableExists()` - Auto-create table

### chatbotService.js
AI-powered query responses.

**Capabilities:**
- Order counts by supplier/brand
- Total value calculations
- Date range queries
- Currency conversions

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

## 🧪 Testing

### Test Credentials
- **Email:** `Admin123@gmail.com`
- **Password:** `Admin@123`

### API Test Examples

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Admin123@gmail.com","password":"Admin@123"}'
```

**List Orders:**
```bash
curl http://localhost:5000/api/purchase-orders \
  -H "Authorization: Bearer dummy-token"
```

**Upload PDF:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer dummy-token" \
  -F "file=@sample.pdf"
```

**Excel Import:**
```bash
curl -X POST http://localhost:5000/api/excel-import \
  -H "Authorization: Bearer dummy-token" \
  -F "file=@orders.xlsx"
```

### Test Files
Place sample files in project root for testing:
- `sample-po.pdf` - Test PDF extraction
- `sample-orders.xlsx` - Test Excel import

## 🚀 Deployment

### Railway (Recommended)
1. Connect GitHub repo
2. Set environment variables in dashboard
3. Deploy automatically on push

### Render
1. Create new Web Service
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

### Heroku
```bash
heroku create your-app-name
heroku config:set DATABASE_URL=your-db-url
heroku config:set PORT=5000
git push heroku main
```

### Environment Variables for Production
```env
PORT=5000
DATABASE_URL=postgresql://...
```

## 🛡️ Security Considerations

### Current Implementation
- ✅ Token-based authentication
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ⚠️ Simple dummy token (implement JWT for production)
- ⚠️ Plain text password check (implement bcrypt for production)

### Production Recommendations
1. Replace `dummy-token` with JWT
2. Hash passwords with bcrypt
3. Add rate limiting
4. Enable HTTPS only
5. Add request logging
6. Implement API versioning

## 📝 Code Style

- **Controllers:** Handle HTTP requests/responses
- **Services:** Contain business logic
- **Middleware:** Auth, error handling
- **Utils:** Reusable helpers
- **Error Handling:** Centralized error handler

## 📊 Performance

- **Database Connection Pooling:** Enabled via `pg`
- **Exchange Rate Caching:** 30-minute cache
- **Query Optimization:** Indexed columns
- **File Upload:** Stream processing

---

**Built with Node.js, Express, and PostgreSQL**
