const { v4: uuidv4 } = require("uuid");
const pdfParse = require("pdf-parse");
const { createPurchaseOrder } = require("./purchaseOrderService");

function extractValue(text, regex, fallback) {
  const match = text.match(regex);
  return match?.[1]?.trim() || fallback;
}

function parseDate(value, fallbackDate) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallbackDate;
  return date.toISOString().slice(0, 10);
}

async function buildOrderFromPdf(file) {
  const parsed = await pdfParse(file.buffer);
  const text = parsed.text || "";
  const today = new Date();
  const defaultDelivery = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const defaultExFactory = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return {
    id: uuidv4(),
    supplier: extractValue(text, /Supplier:\s*([^\n\r]+)/i, "Demo Supplier"),
    brand: extractValue(text, /Brand:\s*([^\n\r]+)/i, "Demo Brand"),
    buyer: extractValue(text, /Buyer:\s*([^\n\r]+)/i, "John Doe"),
    category: extractValue(text, /Category:\s*([^\n\r]+)/i, "Apparel"),
    styleNumber: extractValue(text, /Style\s*Number:\s*([^\n\r]+)/i, `ST-${Math.floor(Math.random() * 10000)}`),
    quantity: Number(extractValue(text, /Quantity:\s*(\d+)/i, "120")),
    price: Number(extractValue(text, /Price:\s*([\d.]+)/i, "49.99")),
    deliveryDate: parseDate(extractValue(text, /Delivery\s*Date:\s*([^\n\r]+)/i, defaultDelivery), defaultDelivery),
    confirmedExFactoryDate: parseDate(
      extractValue(text, /Confirmed\s*Ex-Factory\s*Date:\s*([^\n\r]+)/i, defaultExFactory),
      defaultExFactory
    )
  };
}

async function simulatePdfExtractionAndInsert(file) {
  const extractedOrder = await buildOrderFromPdf(file);
  return createPurchaseOrder(extractedOrder);
}

module.exports = {
  simulatePdfExtractionAndInsert
};
