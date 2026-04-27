const pool = require("../config/db");
const { getUsdToGbpRate } = require("./currencyService");
const { v4: uuidv4 } = require("uuid");

/**
 * Ensures the purchase_orders table exists with proper schema.
 * Includes columns for currency support and dual-price fields.
 */
async function ensureTableExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id UUID PRIMARY KEY,
      supplier TEXT,
      brand TEXT,
      buyer TEXT,
      category TEXT,
      style_number TEXT,
      quantity INTEGER,
      price NUMERIC,
      currency TEXT DEFAULT 'USD',
      price_usd NUMERIC,
      price_gbp NUMERIC,
      delivery_date DATE,
      confirmed_ex_factory_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await pool.query(createTableQuery);

  // Repair legacy schema where purchase_orders.id was created as INTEGER.
  const typeCheckQuery = `
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = 'purchase_orders' AND column_name = 'id';
  `;
  const result = await pool.query(typeCheckQuery);
  const idDataType = result.rows[0]?.data_type;

  if (idDataType && idDataType !== "uuid") {
    await pool.query("DROP TABLE IF EXISTS purchase_orders;");
    await pool.query(createTableQuery);
  }

  // Add new columns if they don't exist (for backward compatibility)
  await pool.query(`
    ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS confirmed_ex_factory_date DATE;
  `);

  await pool.query(`
    ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
  `);

  await pool.query(`
    ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS price_usd NUMERIC;
  `);

  await pool.query(`
    ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS price_gbp NUMERIC;
  `);
}

/**
 * Retrieves purchase orders with optional filtering.
 * Supports filters: date, dateFrom, dateTo, supplier, category, buyer, currency
 */
async function getPurchaseOrders(filters = {}) {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (filters.date) {
    conditions.push(`delivery_date = $${paramIndex}`);
    values.push(filters.date);
    paramIndex += 1;
  }
  if (filters.dateFrom) {
    conditions.push(`delivery_date >= $${paramIndex}`);
    values.push(filters.dateFrom);
    paramIndex += 1;
  }
  if (filters.dateTo) {
    conditions.push(`delivery_date <= $${paramIndex}`);
    values.push(filters.dateTo);
    paramIndex += 1;
  }

  if (filters.supplier) {
    conditions.push(`LOWER(supplier) LIKE LOWER($${paramIndex})`);
    values.push(`%${filters.supplier}%`);
    paramIndex += 1;
  }

  if (filters.category) {
    conditions.push(`LOWER(category) LIKE LOWER($${paramIndex})`);
    values.push(`%${filters.category}%`);
    paramIndex += 1;
  }

  if (filters.buyer) {
    conditions.push(`LOWER(buyer) LIKE LOWER($${paramIndex})`);
    values.push(`%${filters.buyer}%`);
    paramIndex += 1;
  }

  if (filters.currency) {
    conditions.push(`currency = $${paramIndex}`);
    values.push(filters.currency.toUpperCase());
    paramIndex += 1;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT *
    FROM purchase_orders
    ${whereClause}
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(query, values);
  return rows;
}

/**
 * Validates that required fields are present and not null/undefined.
 * Logs warnings for missing fields.
 */
function validateOrderData(order) {
  const requiredFields = [
    { key: "supplier", label: "Supplier" },
    { key: "brand", label: "Brand" },
    { key: "buyer", label: "Buyer" },
    { key: "category", label: "Category" },
    { key: "styleNumber", label: "Style Number" },
    { key: "quantity", label: "Quantity" },
    { key: "price", label: "Price" },
    { key: "deliveryDate", label: "Delivery Date" }
  ];

  const warnings = [];
  const validated = { ...order };

  // Generate UUID if not provided
  if (!validated.id) {
    validated.id = uuidv4();
  }

  for (const { key, label } of requiredFields) {
    const value = order[key];
    if (value === null || value === undefined || value === "") {
      warnings.push(`Missing ${label}, using fallback`);
      // Apply fallbacks
      switch (key) {
        case "supplier":
          validated.supplier = validated.supplier || "Unknown Supplier";
          break;
        case "brand":
          validated.brand = validated.brand || "Unknown Brand";
          break;
        case "buyer":
          validated.buyer = validated.buyer || "Unknown Buyer";
          break;
        case "category":
          validated.category = validated.category || "General";
          break;
        case "styleNumber":
          validated.styleNumber = validated.styleNumber || `ST-${Math.floor(Math.random() * 100000)}`;
          break;
        case "quantity":
          validated.quantity = Number(validated.quantity) || 0;
          break;
        case "price":
          validated.price = Number(validated.price) || 0;
          break;
        case "deliveryDate": {
          const today = new Date();
          const defaultDelivery = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          validated.deliveryDate = validated.deliveryDate || defaultDelivery.toISOString().slice(0, 10);
          break;
        }
      }
    }
  }

  // Ensure confirmedExFactoryDate has a value
  if (!validated.confirmedExFactoryDate) {
    const today = new Date();
    const defaultExFactory = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
    validated.confirmedExFactoryDate = validated.deliveryDate || defaultExFactory.toISOString().slice(0, 10);
  }

  // Ensure currency is valid
  const validCurrencies = ["USD", "GBP"];
  validated.currency = (validated.currency || "USD").toUpperCase();
  if (!validCurrencies.includes(validated.currency)) {
    warnings.push(`Invalid currency "${validated.currency}", defaulting to USD`);
    validated.currency = "USD";
  }

  if (warnings.length > 0) {
    console.warn("[Order Validation Warnings]", warnings.join("; "));
  }

  return validated;
}

/**
 * Creates a new purchase order with currency conversion.
 * Stores both price_usd and price_gbp for accurate reporting.
 */
async function createPurchaseOrder(order) {
  // Validate and apply fallbacks
  const validatedOrder = validateOrderData(order);

  // Get exchange rate for conversion
  const rate = await getUsdToGbpRate();

  // Calculate dual prices based on currency
  const currency = validatedOrder.currency || "USD";
  const basePrice = Number(validatedOrder.price) || 0;
  const quantity = Number(validatedOrder.quantity) || 0;
  const totalValue = basePrice * quantity;

  let priceUsd, priceGbp;

  if (currency === "USD") {
    priceUsd = totalValue;
    priceGbp = totalValue * rate;
  } else {
    // GBP
    priceGbp = totalValue;
    priceUsd = totalValue / rate;
  }

  const idTypeResult = await pool.query(`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = 'purchase_orders' AND column_name = 'id'
    LIMIT 1;
  `);

  const idType = idTypeResult.rows[0]?.data_type;

  let query = "";
  let values = [];

  if (idType === "integer" || idType === "bigint" || idType === "smallint") {
    query = `
      INSERT INTO purchase_orders (
        supplier, brand, buyer, category, style_number,
        quantity, price, currency, price_usd, price_gbp,
        delivery_date, confirmed_ex_factory_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    values = [
      validatedOrder.supplier,
      validatedOrder.brand,
      validatedOrder.buyer,
      validatedOrder.category,
      validatedOrder.styleNumber,
      quantity,
      basePrice,
      currency,
      priceUsd,
      priceGbp,
      validatedOrder.deliveryDate,
      validatedOrder.confirmedExFactoryDate
    ];
  } else {
    query = `
      INSERT INTO purchase_orders (
        id, supplier, brand, buyer, category, style_number,
        quantity, price, currency, price_usd, price_gbp,
        delivery_date, confirmed_ex_factory_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    values = [
      validatedOrder.id,
      validatedOrder.supplier,
      validatedOrder.brand,
      validatedOrder.buyer,
      validatedOrder.category,
      validatedOrder.styleNumber,
      quantity,
      basePrice,
      currency,
      priceUsd,
      priceGbp,
      validatedOrder.deliveryDate,
      validatedOrder.confirmedExFactoryDate
    ];
  }

  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * Generates analytics summary with currency-separated breakdowns.
 * Uses stored price_usd and price_gbp for accurate reporting.
 */
async function getAnalyticsSummary(filters = {}) {
  const orders = await getPurchaseOrders(filters);
  const usdToGbp = await getUsdToGbpRate();

  const totalOrders = orders.length;
  const totalQuantity = orders.reduce((sum, row) => sum + Number(row.quantity || 0), 0);

  // Use stored dual prices for accurate totals
  const totalValueUsd = orders.reduce((sum, row) => sum + Number(row.price_usd || 0), 0);
  const totalValueGbp = orders.reduce((sum, row) => sum + Number(row.price_gbp || 0), 0);

  // Supplier-wise breakdown with currency separation
  const bySupplier = {};
  // Brand-wise breakdown with currency separation
  const byBrand = {};
  const timeline = [];

  for (const row of orders) {
    const supplierKey = row.supplier || "Unknown";
    const brandKey = row.brand || "Unknown";
    const currency = (row.currency || "USD").toUpperCase();

    // Initialize supplier entry with currency separation
    if (!bySupplier[supplierKey]) {
      bySupplier[supplierKey] = {
        count: 0,
        quantity: 0,
        valueUsd: 0,
        valueGbp: 0,
        byCurrency: { USD: { count: 0, quantity: 0, value: 0 }, GBP: { count: 0, quantity: 0, value: 0 } }
      };
    }

    // Initialize brand entry with currency separation
    if (!byBrand[brandKey]) {
      byBrand[brandKey] = {
        count: 0,
        quantity: 0,
        valueUsd: 0,
        valueGbp: 0,
        byCurrency: { USD: { count: 0, quantity: 0, value: 0 }, GBP: { count: 0, quantity: 0, value: 0 } }
      };
    }

    const quantity = Number(row.quantity || 0);
    const priceUsd = Number(row.price_usd || 0);
    const priceGbp = Number(row.price_gbp || 0);

    // Update supplier totals
    bySupplier[supplierKey].count += 1;
    bySupplier[supplierKey].quantity += quantity;
    bySupplier[supplierKey].valueUsd += priceUsd;
    bySupplier[supplierKey].valueGbp += priceGbp;
    bySupplier[supplierKey].byCurrency[currency].count += 1;
    bySupplier[supplierKey].byCurrency[currency].quantity += quantity;
    bySupplier[supplierKey].byCurrency[currency].value += currency === "USD" ? priceUsd : priceGbp;

    // Update brand totals
    byBrand[brandKey].count += 1;
    byBrand[brandKey].quantity += quantity;
    byBrand[brandKey].valueUsd += priceUsd;
    byBrand[brandKey].valueGbp += priceGbp;
    byBrand[brandKey].byCurrency[currency].count += 1;
    byBrand[brandKey].byCurrency[currency].quantity += quantity;
    byBrand[brandKey].byCurrency[currency].value += currency === "USD" ? priceUsd : priceGbp;

    timeline.push({
      id: row.id,
      supplier: row.supplier,
      brand: row.brand,
      confirmedExFactoryDate: row.confirmed_ex_factory_date,
      deliveryDate: row.delivery_date
    });
  }

  return {
    totals: {
      totalOrders,
      totalQuantity,
      totalValueUsd,
      totalValueGbp,
      usdToGbpRate: usdToGbp
    },
    bySupplier,
    byBrand,
    timeline
  };
}

module.exports = {
  ensureTableExists,
  getPurchaseOrders,
  createPurchaseOrder,
  getAnalyticsSummary
};
