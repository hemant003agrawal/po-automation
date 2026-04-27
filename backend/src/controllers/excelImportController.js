/**
 * Excel Import Controller
 * Handles HTTP requests for Excel file imports.
 * Processes both "FY_25-26" and "Read PO" sheets with fixed column structure.
 */

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const AppError = require("../utils/appError");

/**
 * Normalize string for comparison (lowercase, remove spaces)
 * @param {string} str - Input string
 * @returns {string} Normalized string
 */
function normalize(str) {
  return (str || "").toString().toLowerCase().replace(/\s+/g, "").trim();
}

/**
 * Find column index by searching for keywords in header row
 * @param {Array} headerRow - Header row array
 * @param {Array} keywords - List of keywords to search for
 * @returns {number} Column index or -1 if not found
 */
function getColIndex(headerRow, keywords) {
  return headerRow.findIndex((h) => {
    const val = normalize(h || "");
    return keywords.some((k) => val.includes(k.toLowerCase().replace(/\s+/g, "")));
  });
}

/**
 * Format date for database storage
 * @param {Date|string|null} value - Date value from xlsx
 * @returns {string|null} ISO date string or null
 */
function formatDate(value) {
  if (!value || value === "-" || value === "") return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  // Try to parse string date
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}

/**
 * Parse price value - returns number or null
 * @param {number|string|null} value - Price value
 * @returns {number|null} Parsed price or null if invalid
 */
function parsePrice(value) {
  if (value === null || value === undefined || value === "-" || value === "") return null;
  if (typeof value === "number") return value;
  // Try to parse string with currency symbols
  const cleaned = value.toString().replace(/[$£€,\s]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Check if row contains formula strings (safety check)
 * @param {Array} row - Row data
 * @returns {boolean} True if row contains formula
 */
function containsFormula(row) {
  if (!row || !Array.isArray(row)) return false;
  return row.some((cell) => {
    if (typeof cell === "string") {
      return cell.includes("=IF(") || cell.includes("=SUM(") || cell.startsWith("=");
    }
    return false;
  });
}

/**
 * Check if row is entirely empty
 * @param {Array} row - Row data
 * @returns {boolean} True if row is empty
 */
function isEmptyRow(row) {
  if (!row || !Array.isArray(row)) return true;
  return row.every((cell) => cell === null || cell === undefined || cell === "");
}

/**
 * Process a single sheet and import data
 * @param {Object} worksheet - xlsx worksheet object
 * @param {string} sheetName - Name of the sheet
 * @returns {Object} Result with inserted, skipped, errors
 */
async function processSheet(worksheet, sheetName) {
  console.log(`[ExcelImport] Processing sheet: "${sheetName}"`);

  const result = {
    sheetName,
    inserted: 0,
    skipped: 0,
    errors: []
  };

  // Get raw 2D array - row 0 is Formula, row 1 is headers, row 2+ is data
  const raw = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

  if (raw.length < 2) {
    console.log(`[ExcelImport] Sheet "${sheetName}" has insufficient rows`);
    return result;
  }

  // Row 1 (index 1) contains the headers
  const headerRow = raw[1];
  console.log(`[ExcelImport] Headers in "${sheetName}":`, headerRow);

  // Detect if this is "Read PO" sheet with extra FACTORY column
  const hasFactoryColumn = normalize(headerRow[3] || "").includes("factory");

  // Build column map based on sheet structure
  const colMap = {
    businessUnits: 0,   // Skip this
    srNo: 1,           // Skip this
    supplier: 2,
    brand: hasFactoryColumn ? 4 : 3,  // Shift if FACTORY exists
    buyer: hasFactoryColumn ? 5 : 4,
    department: hasFactoryColumn ? 6 : 5,
    category: hasFactoryColumn ? 7 : 6,
    styleNo: hasFactoryColumn ? 8 : 7,
    newRebuy: hasFactoryColumn ? 9 : 8,
    color: hasFactoryColumn ? 10 : 9,
    poNo: hasFactoryColumn ? 11 : 10,
    country: hasFactoryColumn ? 12 : 11,
    supplierRef: hasFactoryColumn ? 13 : 12,
    productDesc: hasFactoryColumn ? 14 : 13,
    poRecdDate: hasFactoryColumn ? 15 : 14,
    quantity: hasFactoryColumn ? 16 : 15,
    usdPrice: hasFactoryColumn ? 17 : 16,
    gbpPrice: hasFactoryColumn ? 18 : 17,
    usdTotalValue: hasFactoryColumn ? 19 : 18,  // Skip - formula
    gbpTotalValue: hasFactoryColumn ? 20 : 19,  // Skip - formula
    confirmedExFactory: hasFactoryColumn ? 21 : 20,
    revisedExFactory: hasFactoryColumn ? 22 : 21,
    deliveryDate: hasFactoryColumn ? 23 : 22,
    mode: hasFactoryColumn ? 24 : 23,
    portOfLoading: hasFactoryColumn ? 25 : 24,
    sampleStatus: hasFactoryColumn ? 26 : 25,
    sustainable: hasFactoryColumn ? 27 : 26,
    incoterms: hasFactoryColumn ? 28 : 27
  };

  console.log(`[ExcelImport] Column map for "${sheetName}" (hasFactory=${hasFactoryColumn}):`, colMap);

  // Process data rows starting from index 2
  for (let i = 2; i < raw.length; i++) {
    const row = raw[i];
    const excelRowNumber = i + 1; // 1-based for logging

    // Skip empty rows
    if (isEmptyRow(row)) {
      result.skipped++;
      continue;
    }

    // Safety check - skip if contains formula strings
    if (containsFormula(row)) {
      console.log(`[ExcelImport] Skipping row ${excelRowNumber}: Contains formula strings`);
      result.skipped++;
      continue;
    }

    try {
      // Extract values
      const supplier = (row[colMap.supplier] || "").toString().trim();
      const quantity = parseFloat(row[colMap.quantity]) || 0;
      const usdPriceRaw = parsePrice(row[colMap.usdPrice]);
      const gbpPriceRaw = parsePrice(row[colMap.gbpPrice]);

      // ROW SKIP CONDITION 1: No supplier
      if (!supplier) {
        console.log(`[ExcelImport] Skipping row ${excelRowNumber}: No supplier`);
        result.skipped++;
        continue;
      }

      // ROW SKIP CONDITION 2: Quantity is 0 or NaN
      if (quantity === 0 || Number.isNaN(quantity)) {
        console.log(`[ExcelImport] Skipping row ${excelRowNumber}: Invalid quantity (${row[colMap.quantity]})`);
        result.skipped++;
        continue;
      }

      // ROW SKIP CONDITION 3: Both prices are invalid
      if (usdPriceRaw === null && gbpPriceRaw === null) {
        console.log(`[ExcelImport] Skipping row ${excelRowNumber}: No valid price (USD=${row[colMap.usdPrice]}, GBP=${row[colMap.gbpPrice]})`);
        result.skipped++;
        continue;
      }

      // CURRENCY DETECTION
      let currency = "USD";
      let price = 0;

      if (usdPriceRaw !== null && usdPriceRaw > 0) {
        currency = "USD";
        price = usdPriceRaw;
      } else if (gbpPriceRaw !== null && gbpPriceRaw > 0) {
        currency = "GBP";
        price = gbpPriceRaw;
      }

      // Calculate total value
      const totalValue = quantity * price;

      // Build order object
      const orderData = {
        id: uuidv4(),
        supplier: supplier,
        brand: (row[colMap.brand] || "Unknown Brand").toString().trim(),
        buyer: (row[colMap.buyer] || "Unknown Buyer").toString().trim(),
        category: (row[colMap.category] || "General").toString().trim(),
        style_number: (row[colMap.styleNo] || "").toString().trim() || `ST-${Date.now()}`,
        quantity: quantity,
        price: price,
        currency: currency,
        price_usd: currency === "USD" ? totalValue : null,
        price_gbp: currency === "GBP" ? totalValue : null,
        delivery_date: formatDate(row[colMap.deliveryDate]),
        confirmed_ex_factory_date: formatDate(row[colMap.confirmedExFactory]),
        // Additional fields (can be stored in JSON or separate columns if needed)
        department: (row[colMap.department] || "").toString().trim(),
        new_rebuy: (row[colMap.newRebuy] || "").toString().trim(),
        color: (row[colMap.color] || "").toString().trim(),
        po_number: (row[colMap.poNo] || "").toString().trim(),
        country: (row[colMap.country] || "").toString().trim(),
        supplier_ref: (row[colMap.supplierRef] || "").toString().trim(),
        description: (row[colMap.productDesc] || "").toString().trim(),
        po_received_date: formatDate(row[colMap.poRecdDate]),
        revised_ex_factory: formatDate(row[colMap.revisedExFactory]),
        mode: (row[colMap.mode] || "").toString().trim(),
        port_of_loading: (row[colMap.portOfLoading] || "").toString().trim(),
        sample_status: (row[colMap.sampleStatus] || "").toString().trim(),
        sustainable: (row[colMap.sustainable] || "").toString().trim(),
        incoterms: (row[colMap.incoterms] || "").toString().trim()
      };

      // Insert into database
      const query = `
        INSERT INTO purchase_orders (
          id, supplier, brand, buyer, category, style_number,
          quantity, price, currency, price_usd, price_gbp,
          delivery_date, confirmed_ex_factory_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;

      const values = [
        orderData.id,
        orderData.supplier,
        orderData.brand,
        orderData.buyer,
        orderData.category,
        orderData.style_number,
        orderData.quantity,
        orderData.price,
        orderData.currency,
        orderData.price_usd,
        orderData.price_gbp,
        orderData.delivery_date,
        orderData.confirmed_ex_factory_date
      ];

      await pool.query(query, values);
      result.inserted++;

      if (result.inserted <= 3 || result.inserted % 50 === 0) {
        console.log(`[ExcelImport] Sheet "${sheetName}" row ${excelRowNumber}: Inserted order ${orderData.id.slice(0, 8)}... (${supplier}, Qty:${quantity}, ${currency}:${price})`);
      }
    } catch (error) {
      result.errors.push({
        rowNumber: excelRowNumber,
        error: error.message,
        sheet: sheetName
      });
      console.error(`[ExcelImport] Sheet "${sheetName}" row ${excelRowNumber}: Error - ${error.message}`);
    }
  }

  console.log(`[ExcelImport] Sheet "${sheetName}" complete: ${result.inserted} inserted, ${result.skipped} skipped, ${result.errors.length} errors`);
  return result;
}

/**
 * POST /api/import-excel
 * Handles Excel file upload and imports purchase orders from both sheets
 */
async function importExcel(req, res, next) {
  const tempFilePath = req.file?.path;

  try {
    if (!req.file) {
      throw new AppError("No Excel file uploaded", 400);
    }

    console.log("[ExcelImport] File uploaded:", req.file.originalname, "Size:", req.file.size);

    // Read the Excel file with cellDates: true to get JS Date objects
    const workbook = xlsx.readFile(tempFilePath, {
      cellDates: true,
      dateNF: "yyyy-mm-dd"
    });

    console.log("[ExcelImport] Sheets found:", workbook.SheetNames);

    // Process both sheets
    const sheetsToProcess = ["FY_25-26", "Read PO"];
    const allResults = [];
    let totalInserted = 0;
    let totalSkipped = 0;
    let allErrors = [];

    for (const sheetName of sheetsToProcess) {
      if (workbook.Sheets[sheetName]) {
        const result = await processSheet(workbook.Sheets[sheetName], sheetName);
        allResults.push(result);
        totalInserted += result.inserted;
        totalSkipped += result.skipped;
        allErrors = allErrors.concat(result.errors);
      } else {
        console.log(`[ExcelImport] Sheet "${sheetName}" not found in workbook`);
      }
    }

    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("[ExcelImport] Temp file deleted:", tempFilePath);
    }

    // Build response
    res.status(201).json({
      success: true,
      message: `Import complete: ${totalInserted} orders imported, ${totalSkipped} skipped`,
      data: {
        totalInserted,
        totalSkipped,
        sheets: allResults.map((r) => ({
          sheetName: r.sheetName,
          inserted: r.inserted,
          skipped: r.skipped,
          errors: r.errors.length
        })),
        errors: allErrors.slice(0, 20) // Return first 20 errors only
      }
    });
  } catch (error) {
    // Clean up temp file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    console.error("[ExcelImport] Import failed:", error.message);
    next(error);
  }
}

/**
 * GET /api/import-excel/template
 * Downloads a sample Excel template matching the expected structure
 */
async function downloadTemplate(req, res, next) {
  try {
    // Create template matching the actual Excel structure
    const headers = [
      "BUSINESS UNITS",
      "SR. NO.",
      "SUPPLIER",
      "BRAND",
      "BUYER NAME",
      "DEPARTMENT",
      "CATEGORY",
      "STYLE NO",
      "NEW/REBUY",
      "COLOR",
      "PO NO",
      "COUNTRY",
      "Supplier Ref. No.",
      "Product Description",
      "PO RECD DATE",
      "TOTAL ORDER QTY",
      "USD PRICE PER PC",
      "GBP PRICE PER PC",
      "USD TOTAL PO VALUE",
      "GBP TOTAL PO VALUE",
      "CONFIRMED EX-FACTORY",
      "REVISED EX-FACTORY",
      "Delivery Date",
      "MODE",
      "Port of loading",
      "Sample approved status",
      "Sustainable",
      "Incoterms"
    ];

    const sampleData = [
      [
        "BUSINESS UNIT 1",
        1,
        "BANSWARA",
        "BURTON",
        "ISABELLA CHAPMAN",
        "LADIES",
        "SOFT WOVEN",
        "BBB05806",
        "REBUY",
        "BLACK",
        "3380602",
        "UK",
        "AA6661683F1",
        "Black SkinnyFit TuxedoSuit Trouser",
        new Date("2025-09-02"),
        200,
        16.8,
        null,
        null,
        null,
        new Date("2026-03-09"),
        null,
        null,
        "SEA",
        "INMUD",
        "NO",
        "N",
        "FOB"
      ],
      [
        "BUSINESS UNIT 1",
        2,
        "WINDESON TRADEMART",
        "NASTYGAL",
        "GEORGIA MAY BARTOSZ",
        "LADIES",
        "SOFT WOVEN",
        "BGG27906",
        "NEW",
        "LEMON",
        "3381208",
        "UK",
        "GB68B84DF3",
        "Chiffon Painted Floral Godet Cowl Maxi Dress",
        new Date("2025-09-04"),
        100,
        null,
        9.9,
        null,
        null,
        new Date("2025-12-15"),
        null,
        null,
        "SEA",
        "INMUD",
        "NO",
        "N",
        "FOB"
      ]
    ];

    const worksheet = xlsx.utils.aoa_to_sheet([headers, ...sampleData]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "FY_25-26");

    const templateBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=po_import_template.xlsx");
    res.send(templateBuffer);
  } catch (error) {
    console.error("[ExcelImport] Template generation failed:", error.message);
    next(error);
  }
}

module.exports = {
  importExcel,
  downloadTemplate
};
