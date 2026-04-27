/**
 * Purchase Order Controller
 * Handles HTTP requests for purchase order operations.
 */

const { getPurchaseOrders, getAnalyticsSummary } = require("../services/purchaseOrderService");

/**
 * GET /api/purchase-orders
 * List purchase orders with optional filters including currency
 */
async function listPurchaseOrders(req, res, next) {
  try {
    const { date, dateFrom, dateTo, supplier, category, buyer, currency } = req.query;

    const orders = await getPurchaseOrders({
      date,
      dateFrom,
      dateTo,
      supplier,
      category,
      buyer,
      currency
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/purchase-orders/analytics
 * Get analytics summary with optional filters including currency
 */
async function analyticsSummary(req, res, next) {
  try {
    const { date, dateFrom, dateTo, supplier, category, buyer, currency } = req.query;
    const summary = await getAnalyticsSummary({
      date,
      dateFrom,
      dateTo,
      supplier,
      category,
      buyer,
      currency
    });
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPurchaseOrders,
  analyticsSummary
};
