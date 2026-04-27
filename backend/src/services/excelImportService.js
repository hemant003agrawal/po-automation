/**
 * Excel Import Service with Smart Header Detection
 * Handles parsing and importing Excel files with dynamic header row detection.
 * Uses xlsx library for spreadsheet parsing.
 */

const xlsx = require("xlsx");
const { createPurchaseOrder } = require("./purchaseOrderService");

/**
 * Normalize string for comparison
 * @param {string} str - Input string
 * @returns {string} Normalized string
 */
function normalize(str) {
  return (str || "").toString().toLowerCase().replace(/\s+/g, "").trim();
}

/**
 * Check if a row contains header keywords
 * Looks for required columns: supplier, brand, quantity/qty, price
 * @param {Array} row - Row data array
 * @returns {boolean} True if this row looks like a header
 */
function isHeaderRow(row) {
  if (!row || !Array.isArray(row) || row.length === 0) return false;

  const rowStr = row.map((cell) => normalize(cell));

  // Debug: log the normalized row
  console.log("[ExcelImport] Checking row for headers:", rowStr.slice(0, 15));

  // Required keywords that must be present
  const hasSupplier = rowStr.some((c) => c.includes("supplier"));
  const hasBrand = rowStr.some((c) => c.includes("brand"));
  const hasQuantity = rowStr.some(
    (c) => c.includes("qty") || c.includes("quantity") || c.includes("units") || c.includes("pcs") || c.includes("orderqty")
  );
  const hasPrice = rowStr.some(
    (c) =>
      c.includes("price") ||
      c.includes("cost") ||
      c.includes("usd") ||
      c.includes("gbp") ||
      c.includes("rate") ||
      c.includes("£") ||
      c.includes("$")
  );

  console.log(`[ExcelImport] Header check: supplier=${hasSupplier}, brand=${hasBrand}, quantity=${hasQuantity}, price=${hasPrice}`);

  // Must have at least supplier, quantity, and price to be considered a header
  const isHeader = hasSupplier && hasQuantity && hasPrice;
  if (isHeader) {
    console.log("[ExcelImport] ✓ Header row detected!");
  }
  return isHeader;
}

/**
 * Find header row index by scanning first 10 rows
 * @param {Array} rawData - Raw sheet data (array of arrays)
 * @returns {number} Header row index or -1 if not found
 */
function findHeaderIndex(rawData) {
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    if (isHeaderRow(rawData[i])) {
      console.log(`[ExcelImport] Header row found at index ${i}:`, rawData[i]);
      return i;
    }
  }
  return -1;
}

/**
 * Get column index by searching for keywords in header row
 * @param {Array} headerRow - Header row array
 * @param {Array} keywordList - List of keywords to search for
 * @returns {number} Column index or -1 if not found
 */
function getIndex(headerRow, keywordList) {
  return headerRow.findIndex((h) => {
    const val = normalize(h || "");
    return keywordList.some((k) => val.includes(k));
  });
}

/**
 * Main function: Imports purchase orders from an Excel file buffer with smart header detection
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Promise<Object>} Import result with success/error details
 */
async function importExcelFile(fileBuffer) {
  try {
    // Parse workbook
    const workbook = xlsx.read(fileBuffer, {
      type: "buffer",
      cellDates: true,
      dateNF: "yyyy-mm-dd"
    });

    // Use first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Read as raw array of arrays
    const raw = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      blankrows: false
    });

    console.log("[ExcelImport] Total rows in sheet:", raw.length);

    if (raw.length < 2) {
      throw new Error("Excel file must have at least a header row and one data row");
    }

    // STEP 1: Find header row dynamically
    const headerIndex = findHeaderIndex(raw);

    if (headerIndex === -1) {
      console.log("[ExcelImport] First 10 rows for debugging:");
      for (let i = 0; i < Math.min(10, raw.length); i++) {
        console.log(`  Row ${i}:`, raw[i]);
      }
      throw new Error("Header row not found. Expected columns: Supplier, Brand, Quantity/Qty, Price");
    }

    // STEP 2: Extract header and data rows
    const headerRow = raw[headerIndex];
    const dataRows = raw.slice(headerIndex + 1).filter(
      (row) => row && row.some((cell) => cell !== "" && cell !== null && cell !== undefined)
    );

    console.log("[ExcelImport] Header row (index", headerIndex, "):", headerRow);
    console.log("[ExcelImport] Data rows to process:", dataRows.length);

    // STEP 3: Dynamic column mapping with keywords
    const columnMap = {
      supplierIndex: getIndex(headerRow, ["supplier", "vendor", "seller", "factory"]),
      brandIndex: getIndex(headerRow, ["brand", "label", "brandname"]),
      buyerIndex: getIndex(headerRow, ["buyer", "purchaser", "customer", "buyername"]),
      categoryIndex: getIndex(headerRow, ["category", "dept", "department"]),
      styleIndex: getIndex(headerRow, ["style", "styleno", "stylenumber", "sku", "itemcode", "stylecode"]),
      quantityIndex: getIndex(headerRow, ["totalorderqty", "orderqty", "totalqty", "qty", "quantity", "pcs", "pieces"]),
      usdPriceIndex: getIndex(headerRow, ["usdpriceperpc", "usdprice", "priceusd", "usd", "price(usd)"]),
      gbpPriceIndex: getIndex(headerRow, ["gbppriceperpc", "gbpprice", "pricegbp", "gbp", "price(gbp)", "£"]),
      priceIndex: getIndex(headerRow, ["price", "cost", "rate", "value"]),
      currencyIndex: getIndex(headerRow, ["currency", "cur", "ccy", "pricecurrency"]),
      deliveryIndex: getIndex(headerRow, ["deliverydate", "delivery", "shipdate", "duedate"]),
      exFactoryIndex: getIndex(headerRow, ["confirmedexfactory", "exfactory", "exfactorydate", "factorydate"])
    };

    console.log("[ExcelImport] Column mapping:", columnMap);

    // Validate required columns
    if (columnMap.supplierIndex === -1 || columnMap.quantityIndex === -1) {
      throw new Error(
        `Missing required columns. Found: ${headerRow.join(", ")}. ` +
        `Required: Supplier, Quantity/Qty`
      );
    }

    // Must have at least one price column
    const hasPriceColumn =
      columnMap.usdPriceIndex !== -1 ||
      columnMap.gbpPriceIndex !== -1 ||
      columnMap.priceIndex !== -1;

    if (!hasPriceColumn) {
      throw new Error("No price column found. Expected: USD Price, GBP Price, or Price");
    }

    // STEP 4: Parse helper functions
    const parseNumber = (value, defaultValue = 0) => {
      if (value === undefined || value === null || value === "") return defaultValue;
      if (typeof value === "number") return value;

      const cleaned = value
        .toString()
        .replace(/[,\s]/g, "")
        .replace(/[$£€]/g, "")
        .trim();

      const parsed = parseFloat(cleaned);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    };

    const parseDate = (value) => {
      if (!value) return null;
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      if (typeof value === "number" && value > 30000) {
        const epoch = new Date(1899, 11, 30);
        const date = new Date(epoch.getTime() + value * 24 * 60 * 60 * 1000);
        return date.toISOString().slice(0, 10);
      }

      const str = value.toString().trim();
      const formats = [
        (s) => {
          const match = s.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
          return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : null;
        },
        (s) => {
          const match = s.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
          return match ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}` : null;
        },
        (s) => {
          const date = new Date(s);
          return !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
        }
      ];

      for (const format of formats) {
        const result = format(str);
        if (result) return result;
      }
      return null;
    };

    const getCellValue = (row, index, defaultValue = "") => {
      if (index === -1 || index >= row.length) return defaultValue;
      const value = row[index];
      return value !== undefined && value !== null ? value : defaultValue;
    };

    // STEP 5: Track results
    const results = {
      total: dataRows.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      importedOrders: []
    };

    // STEP 6: Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const excelRowNumber = headerIndex + i + 2; // +2 for 1-based Excel row numbering

      try {
        // DEBUG: Log first 5 rows completely
        if (i < 5) {
          console.log(`[ExcelImport] ===== Row ${excelRowNumber} DEBUG =====`);
          console.log(`[ExcelImport] Full row data:`, row);
          console.log(`[ExcelImport] Row length:`, row.length);
          console.log(`[ExcelImport] Column indices:`, columnMap);
        }

        // Get raw cell values
        const rawQuantity = getCellValue(row, columnMap.quantityIndex);
        const rawUsdPrice = columnMap.usdPriceIndex !== -1 ? getCellValue(row, columnMap.usdPriceIndex) : undefined;
        const rawGbpPrice = columnMap.gbpPriceIndex !== -1 ? getCellValue(row, columnMap.gbpPriceIndex) : undefined;
        const rawPrice = columnMap.priceIndex !== -1 ? getCellValue(row, columnMap.priceIndex) : undefined;

        if (i < 5) {
          console.log(`[ExcelImport] Raw quantity value:`, rawQuantity, "type:", typeof rawQuantity);
          console.log(`[ExcelImport] Raw USD price:`, rawUsdPrice, "type:", typeof rawUsdPrice);
          console.log(`[ExcelImport] Raw GBP price:`, rawGbpPrice, "type:", typeof rawGbpPrice);
          console.log(`[ExcelImport] Raw generic price:`, rawPrice, "type:", typeof rawPrice);
        }

        // Parse quantity
        const quantity = parseNumber(rawQuantity, 0);

        // Parse prices
        const usdPrice = columnMap.usdPriceIndex !== -1 ? parseNumber(rawUsdPrice, 0) : 0;
        const gbpPrice = columnMap.gbpPriceIndex !== -1 ? parseNumber(rawGbpPrice, 0) : 0;
        const genericPrice = columnMap.priceIndex !== -1 ? parseNumber(rawPrice, 0) : 0;

        if (i < 5) {
          console.log(`[ExcelImport] Parsed quantity:`, quantity);
          console.log(`[ExcelImport] Parsed USD:`, usdPrice, "GBP:", gbpPrice, "Generic:", genericPrice);
        }

        // Determine currency and final price
        let currency = "USD";
        let price = 0;

        if (usdPrice > 0) {
          currency = "USD";
          price = usdPrice;
        } else if (gbpPrice > 0) {
          currency = "GBP";
          price = gbpPrice;
        } else if (genericPrice > 0) {
          price = genericPrice;
          // Check currency column if present
          if (columnMap.currencyIndex !== -1) {
            const currencyValue = getCellValue(row, columnMap.currencyIndex, "USD").toString().toUpperCase();
            if (currencyValue.includes("GBP") || currencyValue.includes("£")) {
              currency = "GBP";
            }
          }
        }

        // Skip invalid rows (STEP 7: Validation)
        if (quantity === 0 || price === 0) {
          if (i < 10 || results.skipped < 5) {
            console.log(`[ExcelImport] Skipping row ${excelRowNumber}: quantity=${quantity}, price=${price}`);
          }
          results.skipped++;
          continue;
        }

        // Build order object
        const supplier = getCellValue(row, columnMap.supplierIndex, "Unknown Supplier").toString().trim();
        const brand = getCellValue(row, columnMap.brandIndex, "Unknown Brand").toString().trim();
        const buyer = getCellValue(row, columnMap.buyerIndex, "Unknown Buyer").toString().trim();
        const category = getCellValue(row, columnMap.categoryIndex, "General").toString().trim();

        let styleNumber = getCellValue(row, columnMap.styleIndex, "").toString().trim();
        if (!styleNumber) {
          styleNumber = `ST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }

        const deliveryDate = parseDate(getCellValue(row, columnMap.deliveryIndex));
        const exFactoryDate = parseDate(getCellValue(row, columnMap.exFactoryIndex));

        const today = new Date();
        const defaultDelivery = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const defaultExFactory = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const orderData = {
          supplier,
          brand,
          buyer,
          category,
          styleNumber,
          quantity,
          price,
          currency,
          deliveryDate: deliveryDate || defaultDelivery,
          confirmedExFactoryDate: exFactoryDate || defaultExFactory
        };

        // Debug log first 3 rows
        if (i < 3) {
          console.log(`[ExcelImport] Row ${excelRowNumber} data:`, {
            supplier: orderData.supplier,
            quantity: orderData.quantity,
            price: orderData.price,
            currency: orderData.currency
          });
        }

        // STEP 8: Insert into database
        const importedOrder = await createPurchaseOrder(orderData);

        results.successful++;
        results.importedOrders.push({
          rowNumber: excelRowNumber,
          id: importedOrder.id,
          supplier: importedOrder.supplier,
          styleNumber: importedOrder.style_number,
          currency: importedOrder.currency
        });

        console.log(`[ExcelImport] Row ${excelRowNumber}: Successfully imported order ${importedOrder.id}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          rowNumber: excelRowNumber,
          error: error.message,
          rowData: row.slice(0, 5) // Only log first 5 cells for brevity
        });

        console.error(`[ExcelImport] Row ${excelRowNumber}: Failed - ${error.message}`);
      }
    }

    // STEP 9: Response
    console.log(
      `[ExcelImport] Complete: ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped`
    );

    return results;
  } catch (error) {
    console.error("[ExcelImport] Import failed:", error.message);
    throw error;
  }
}

/**
 * Generates a sample Excel template for users
 * @returns {Buffer} Excel file buffer
 */
function generateTemplate() {
  const headers = [
    "Supplier",
    "Brand",
    "Buyer",
    "Category",
    "Style Number",
    "Quantity",
    "Price",
    "Currency",
    "Delivery Date",
    "Confirmed Ex-Factory Date"
  ];

  const sampleData = [
    [
      "Acme Clothing Ltd",
      "Acme Brand",
      "John Smith",
      "Apparel",
      "ST-001234",
      500,
      25.99,
      "USD",
      "2024-06-15",
      "2024-06-10"
    ],
    [
      "Fashion Forward Inc",
      "FF Premium",
      "Jane Doe",
      "Accessories",
      "ST-005678",
      300,
      45.50,
      "GBP",
      "2024-07-01",
      "2024-06-25"
    ]
  ];

  const worksheet = xlsx.utils.aoa_to_sheet([headers, ...sampleData]);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");

  // Set column widths
  worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

  return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
}

module.exports = {
  importExcelFile,
  generateTemplate
};
