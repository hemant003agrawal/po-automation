const pool = require("../config/db");
const { getUsdToGbpRate } = require("./currencyService");

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

  await pool.query(`
    ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS confirmed_ex_factory_date DATE;
  `);
}

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

async function createPurchaseOrder(order) {
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
        quantity, price, delivery_date, confirmed_ex_factory_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    values = [
      order.supplier,
      order.brand,
      order.buyer,
      order.category,
      order.styleNumber,
      order.quantity,
      order.price,
      order.deliveryDate,
      order.confirmedExFactoryDate || order.deliveryDate
    ];
  } else {
    query = `
      INSERT INTO purchase_orders (
        id, supplier, brand, buyer, category, style_number,
        quantity, price, delivery_date, confirmed_ex_factory_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    values = [
      order.id,
      order.supplier,
      order.brand,
      order.buyer,
      order.category,
      order.styleNumber,
      order.quantity,
      order.price,
      order.deliveryDate,
      order.confirmedExFactoryDate || order.deliveryDate
    ];
  }

  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function getAnalyticsSummary(filters = {}) {
  const orders = await getPurchaseOrders(filters);
  const usdToGbp = await getUsdToGbpRate();

  const totalOrders = orders.length;
  const totalQuantity = orders.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const totalValueUsd = orders.reduce(
    (sum, row) => sum + Number(row.price || 0) * Number(row.quantity || 0),
    0
  );
  const totalValueGbp = totalValueUsd * usdToGbp;

  const bySupplier = {};
  const byBrand = {};
  const timeline = [];

  for (const row of orders) {
    const orderValue = Number(row.price || 0) * Number(row.quantity || 0);
    const supplierKey = row.supplier || "Unknown";
    const brandKey = row.brand || "Unknown";

    if (!bySupplier[supplierKey]) bySupplier[supplierKey] = { count: 0, quantity: 0, valueUsd: 0 };
    if (!byBrand[brandKey]) byBrand[brandKey] = { count: 0, quantity: 0, valueUsd: 0 };

    bySupplier[supplierKey].count += 1;
    bySupplier[supplierKey].quantity += Number(row.quantity || 0);
    bySupplier[supplierKey].valueUsd += orderValue;

    byBrand[brandKey].count += 1;
    byBrand[brandKey].quantity += Number(row.quantity || 0);
    byBrand[brandKey].valueUsd += orderValue;

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
