const express = require("express");
const { listPurchaseOrders, analyticsSummary } = require("../controllers/purchaseOrderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, listPurchaseOrders);
router.get("/analytics", authMiddleware, analyticsSummary);

module.exports = router;
