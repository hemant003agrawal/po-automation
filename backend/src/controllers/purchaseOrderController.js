const { getPurchaseOrders, getAnalyticsSummary } = require("../services/purchaseOrderService");

async function listPurchaseOrders(req, res, next) {
  try {
    const { date, dateFrom, dateTo, supplier, category, buyer } = req.query;

    const orders = await getPurchaseOrders({
      date,
      dateFrom,
      dateTo,
      supplier,
      category,
      buyer
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function analyticsSummary(req, res, next) {
  try {
    const { date, dateFrom, dateTo, supplier, category, buyer } = req.query;
    const summary = await getAnalyticsSummary({
      date,
      dateFrom,
      dateTo,
      supplier,
      category,
      buyer
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
