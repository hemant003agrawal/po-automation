/**
 * Upload Service
 * Handles PDF parsing with enhanced field extraction and currency support.
 */

const { v4: uuidv4 } = require("uuid");
const pdfParse = require("pdf-parse");
const { createPurchaseOrder } = require("./purchaseOrderService");

/**
 * Extracts value from text using regex pattern.
 * @param {string} text - Source text to search
 * @param {RegExp} regex - Pattern to match
 * @param {*} fallback - Default value if not found
 * @returns {string} Extracted or fallback value
 */
function extractValue(text, regex, fallback) {
  const match = text.match(regex);
  return match?.[1]?.trim() || fallback;
}

/**
 * Parses date string to ISO format.
 * @param {string} value - Date string to parse
 * @param {string} fallbackDate - Default date if parsing fails
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function parseDate(value, fallbackDate) {
  if (!value) return fallbackDate;

  // Try multiple date formats
  const datePatterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/,
    // YYYY/MM/DD or YYYY-MM-DD
    /(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/,
    // Month DD, YYYY
    /([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/,
    // DD Month YYYY
    /(\d{1,2})\s+([A-Za]+)\s+(\d{4})/
  ];

  for (const pattern of datePatterns) {
    const match = value.match(pattern);
    if (match) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    }
  }

  // Direct parse attempt
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return fallbackDate;
}

/**
 * Extracts currency from text with validation.
 * Supports: USD, GBP, $, £
 * @param {string} text - Source text
 * @returns {string} Validated currency code (USD or GBP)
 */
function extractCurrency(text) {
  // Look for explicit currency codes
  const currencyMatch = text.match(/Currency:\s*(USD|GBP)/i);
  if (currencyMatch) {
    return currencyMatch[1].toUpperCase();
  }

  // Look for currency symbols in price fields
  const priceWithSymbol = text.match(/Price:\s*([£$])\s*([\d,.]+)/i);
  if (priceWithSymbol) {
    return priceWithSymbol[1] === "£" ? "GBP" : "USD";
  }

  // Default to USD
  return "USD";
}

/**
 * Parses price value, removing currency symbols and handling various formats.
 * @param {string} value - Price string
 * @param {number} fallback - Default price
 * @returns {number} Parsed price
 */
function parsePrice(value, fallback) {
  if (!value) return fallback;

  // Remove currency symbols and spaces
  const cleaned = value.replace(/[£$\s,]/g, "");
  const parsed = parseFloat(cleaned);

  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Parses quantity from various formats.
 * @param {string} value - Quantity string
 * @param {number} fallback - Default quantity
 * @returns {number} Parsed quantity
 */
function parseQuantity(value, fallback) {
  if (!value) return fallback;

  // Remove commas and spaces
  const cleaned = value.replace(/[,\s]/g, "");
  const parsed = parseInt(cleaned, 10);

  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Builds a purchase order object from parsed PDF text.
 * Extracts all required fields with fallback values.
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Object} Purchase order object
 */
async function buildOrderFromPdf(fileBuffer) {
  let text = "";

  try {
    const parsed = await pdfParse(fileBuffer);
    text = parsed.text || "";
  } catch (error) {
    console.error("[UploadService] PDF parsing failed:", error.message);
    text = ""; // Will use all fallbacks
  }

  const today = new Date();
  const defaultDelivery = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const defaultExFactory = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Extract all fields with comprehensive regex patterns
  const extracted = {
    id: uuidv4(),

    // Supplier extraction (multiple patterns)
    supplier: extractValue(
      text,
      /(?:Supplier|Vendor|Seller|From)[\s:]*([^\n\r]+)/i,
      "Unknown Supplier"
    ),

    // Brand extraction
    brand: extractValue(
      text,
      /(?:Brand|Label)[\s:]*([^\n\r]+)/i,
      "Unknown Brand"
    ),

    // Buyer extraction
    buyer: extractValue(
      text,
      /(?:Buyer|Purchaser|Customer)[\s:]*([^\n\r]+)/i,
      "Unknown Buyer"
    ),

    // Category extraction
    category: extractValue(
      text,
      /(?:Category|Dept|Department)[\s:]*([^\n\r]+)/i,
      "General"
    ),

    // Style Number extraction (multiple patterns)
    styleNumber: extractValue(
      text,
      /(?:Style\s*(?:Number|No|#|Code)|SKU|Item\s*Code)[\s:]*([^\n\r]+)/i,
      `ST-${Math.floor(Math.random() * 100000)}`
    ),

    // Quantity extraction
    quantity: parseQuantity(
      extractValue(text, /(?:Quantity|Qty|Units)[\s:]*([\d,]+)/i, "0"),
      0
    ),

    // Price extraction with symbol handling
    price: parsePrice(
      extractValue(text, /(?:Price|Unit\s*Price|Cost)[\s:]*[£$]?\s*([\d,.]+)/i, "0"),
      0
    ),

    // Currency extraction
    currency: extractCurrency(text),

    // Delivery Date extraction
    deliveryDate: parseDate(
      extractValue(text, /(?:Delivery\s*Date|Ship\s*Date|Due\s*Date)[\s:]*([^\n\r]+)/i, defaultDelivery),
      defaultDelivery
    ),

    // Confirmed Ex-Factory Date extraction
    confirmedExFactoryDate: parseDate(
      extractValue(text, /(?:Confirmed\s*Ex-Factory\s*Date|Ex-Factory|Factory\s*Date)[\s:]*([^\n\r]+)/i, defaultExFactory),
      defaultExFactory
    )
  };

  // Log extraction results for debugging
  console.log("[UploadService] Extracted fields:", {
    supplier: extracted.supplier,
    brand: extracted.brand,
    buyer: extracted.buyer,
    category: extracted.category,
    styleNumber: extracted.styleNumber,
    quantity: extracted.quantity,
    price: extracted.price,
    currency: extracted.currency,
    deliveryDate: extracted.deliveryDate,
    confirmedExFactoryDate: extracted.confirmedExFactoryDate
  });

  // Validate required fields and log warnings
  const requiredFields = [
    { key: "supplier", label: "Supplier" },
    { key: "brand", label: "Brand" },
    { key: "buyer", label: "Buyer" },
    { key: "category", label: "Category" },
    { key: "styleNumber", label: "Style Number" },
    { key: "quantity", label: "Quantity" },
    { key: "price", label: "Price" },
    { key: "deliveryDate", label: "Delivery Date" },
    { key: "confirmedExFactoryDate", label: "Confirmed Ex-Factory Date" }
  ];

  const missingFields = requiredFields.filter(({ key }) => {
    const value = extracted[key];
    return value === null || value === undefined || value === "" || value === 0;
  });

  if (missingFields.length > 0) {
    console.warn("[UploadService] Missing/empty fields, using fallbacks:",
      missingFields.map(f => f.label).join(", "));
  }

  return extracted;
}

/**
 * Simulates PDF extraction and inserts into database.
 * @param {Object} file - Multer file object with buffer
 * @returns {Promise<Object>} Created purchase order
 */
async function simulatePdfExtractionAndInsert(file) {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided");
  }

  const extractedOrder = await buildOrderFromPdf(file.buffer);
  return createPurchaseOrder(extractedOrder);
}

module.exports = {
  simulatePdfExtractionAndInsert,
  buildOrderFromPdf,
  extractValue,
  parseDate,
  parsePrice,
  parseQuantity,
  extractCurrency
};
