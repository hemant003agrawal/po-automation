# PO Automation - Currency Support & Feature Update

This document outlines the changes made to add currency support, Excel import, and chatbot features to the PO Automation system.

## New Features

### 1. Currency Support (USD/GBP)
- Added `currency` column to `purchase_orders` table
- Added `price_usd` and `price_gbp` columns for dual-price storage
- Live currency conversion with 10-minute caching
- Currency filter in all API endpoints
- Accuracy tolerance: < 0.03 (3 cents/pence)

### 2. Excel Import API
- New endpoint: `POST /api/import-excel`
- Supports .xlsx and .xls files
- Validates required columns
- Returns detailed import results with success/failure counts

### 3. Chatbot Feature
- New endpoint: `POST /api/chat`
- Supports natural language queries
- Query types: total orders, top supplier, total value in USD/GBP, supplier breakdown

### 4. Dashboard Enhancements
- Currency toggle [USD][GBP] button
- Supplier-wise and brand-wise breakdowns with currency separation
- Live exchange rate display
- Enhanced charts reflecting selected currency

## Installation

### Backend Dependencies

Install the xlsx library for Excel import functionality:

```bash
cd backend
npm install xlsx
```

### Database Migration

Run the migration script to add currency columns:

```bash
# Option 1: Using psql command line
psql -d your_database_name -f backend/migrations/001_add_currency_columns.sql

# Option 2: Using a PostgreSQL client
# Open the file and execute the SQL statements
```

Or let the application auto-migrate on startup - the `ensureTableExists` function in `purchaseOrderService.js` will automatically add the columns if they don't exist.

## API Changes

### Updated Endpoints

#### GET /api/purchase-orders
- Added `currency` query parameter (optional, values: "USD", "GBP")
- Returns orders filtered by currency when specified

#### GET /api/purchase-orders/analytics
- Added `currency` query parameter (optional)
- Enhanced response with `byCurrency` breakdown for suppliers and brands
- Each entity now includes `valueUsd`, `valueGbp`, and `byCurrency` metrics

### New Endpoints

#### POST /api/import-excel
Upload an Excel file to import purchase orders.

Request:
- Content-Type: multipart/form-data
- Body: file (Excel file)

Response:
```json
{
  "success": true,
  "message": "Imported 5 purchase orders",
  "data": {
    "total": 5,
    "successful": 5,
    "failed": 0,
    "importedOrders": [...],
    "errors": []
  }
}
```

#### POST /api/chat
Send a natural language query to the chatbot.

Request:
```json
{
  "message": "What is the total value of all orders in GBP?"
}
```

Response:
```json
{
  "success": true,
  "query": "What is the total value of all orders in GBP?",
  "response": "Total value of all orders in GBP: £12,345.67",
  "type": "total_value",
  "data": { "valueGbp": 12345.67 }
}
```

#### GET /api/chat/suggestions
Get suggested queries for the chatbot.

Response:
```json
{
  "success": true,
  "suggestions": [
    { "label": "Total orders", "query": "How many total orders?" },
    { "label": "Top supplier", "query": "Who is the top supplier?" }
  ]
}
```

## Frontend Changes

### Updated Components

#### FilterPanel
- Added currency dropdown filter (USD/GBP/All)
- Optional `showCurrencyFilter` prop

#### DataTable
- Shows currency chip (USD/GBP) for each order
- Displays original price with currency symbol
- Shows converted values (price_usd, price_gbp) in separate columns

#### Dashboard
- Currency toggle button group [USD][GBP]
- Supplier/Brand breakdown cards with currency-separated metrics
- Charts update based on selected currency
- Live exchange rate display in summary card

### New Components

#### ExcelUploadPage
- File selection with validation
- Import results display
- Error reporting with row numbers
- Template download button
- Instructions for required columns

#### Chatbot
- Floating FAB button to open chat
- Message history with user/bot avatars
- Suggested query chips
- Typing indicator during processing

### New Routes
- `/import-excel` - Excel import page
- Chatbot component rendered on all authenticated pages

## Testing

### Currency Feature Testing

1. **Database Migration**
   ```bash
   # Check if columns exist
   psql -d your_db -c "\d purchase_orders"
   
   # Expected output should show:
   # - currency (text)
   # - price_usd (numeric)
   # - price_gbp (numeric)
   ```

2. **API Testing - Currency Filter**
   ```bash
   # Get only USD orders
   curl "http://localhost:5000/api/purchase-orders?currency=USD" \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Get only GBP orders
   curl "http://localhost:5000/api/purchase-orders?currency=GBP" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Currency Conversion Accuracy**
   ```bash
   # Create a GBP order and verify conversion
   curl -X POST http://localhost:5000/api/import-excel \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test_gbp_order.xlsx"
   
   # Verify both price_usd and price_gbp are populated
   ```

### Excel Import Testing

1. **Valid Import**
   - Download template from `/import-excel` page
   - Fill in test data with various currencies
   - Upload and verify success message
   - Check database for imported records

2. **Invalid Import**
   - Upload file with missing required columns
   - Verify error messages show correct row numbers
   - Verify no partial data is inserted

3. **Large File Import**
   - Create Excel with 100+ rows
   - Upload and verify performance
   - Check memory usage

### Chatbot Testing

1. **Query Types**
   ```
   "How many total orders?" → Returns count
   "What is the total value in USD?" → Returns USD total
   "What is the total value in GBP?" → Returns GBP total
   "Who is the top supplier?" → Returns supplier name with metrics
   "Show me supplier breakdown" → Returns top 5 suppliers
   "Show me brand breakdown" → Returns top 5 brands
   "What is the currency breakdown?" → Returns USD vs GBP counts
   "Hello" → Returns greeting with suggestions
   ```

2. **Error Handling**
   - Send empty message → Verify error response
   - Send unrecognized query → Verify helpful fallback

### Dashboard Testing

1. **Currency Toggle**
   - Click USD button → Charts show USD values
   - Click GBP button → Charts show GBP values
   - Verify color coding (USD = primary/blue, GBP = secondary/purple)

2. **Filter Integration**
   - Apply currency filter in FilterPanel
   - Verify charts update to show filtered data
   - Verify table shows only selected currency

3. **Exchange Rate Display**
   - Verify rate is shown in summary card
   - Wait 10+ minutes and refresh → Verify rate updates

## File Structure

```
backend/
├── migrations/
│   └── 001_add_currency_columns.sql    # Database migration
├── src/
│   ├── services/
│   │   ├── currencyService.js          # Enhanced with caching
│   │   ├── excelImportService.js       # New Excel import
│   │   ├── chatbotService.js           # New chatbot logic
│   │   └── purchaseOrderService.js     # Updated with currency
│   ├── controllers/
│   │   ├── excelImportController.js    # New
│   │   ├── chatController.js           # New
│   │   └── purchaseOrderController.js  # Updated
│   └── routes/
│       ├── excelImportRoutes.js        # New
│       ├── chatRoutes.js               # New
│       └── purchaseOrderRoutes.js      # Updated
└── server.js                           # Updated with new routes

frontend/
├── src/
│   ├── api/
│   │   └── purchaseOrderApi.ts         # Updated types + new APIs
│   ├── components/
│   │   ├── filters/
│   │   │   └── FilterPanel.tsx         # Updated with currency
│   │   ├── tables/
│   │   │   └── DataTable.tsx           # Updated with currency display
│   │   └── chatbot/
│   │       └── Chatbot.tsx             # New component
│   ├── pages/
│   │   ├── Dashboard.tsx               # Updated with currency toggle
│   │   ├── ExcelUploadPage.tsx         # New page
│   │   └── TablePage.tsx               # Uses updated components
│   └── App.tsx                         # Updated with new routes
```

## Notes

- The currency conversion service uses exchangerate-api.com and open.er-api.com as fallbacks
- Exchange rates are cached for 10 minutes to balance accuracy and API rate limits
- The Excel import supports various date formats including Excel serial numbers
- The chatbot uses pattern matching for intent detection and can be extended for more query types
- All existing functionality remains intact - the changes are backward compatible
