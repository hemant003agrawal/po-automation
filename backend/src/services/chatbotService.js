/**
 * Chatbot Service
 * Processes natural language queries about purchase orders.
 * Provides insights and analytics through conversational interface.
 */

const { getPurchaseOrders, getAnalyticsSummary } = require("./purchaseOrderService");

/**
 * Query types supported by the chatbot
 */
const QUERY_PATTERNS = {
  totalOrders: /(?:total|how many|number of)\s+(?:orders|purchase orders|POs)/i,
  totalValue: /(?:total|combined)\s+(?:value|amount|revenue)/i,
  totalValueUsd: /(?:total\s+value\s+in\s+USD|total\s+USD|USD\s+value)/i,
  totalValueGbp: /(?:total\s+value\s+in\s+GBP|total\s+GBP|GBP\s+value|pounds)/i,
  topSupplier: /(?:top\s+supplier|biggest\s+supplier|largest\s+supplier|supplier\s+with\s+most)/i,
  topBrand: /(?:top\s+brand|biggest\s+brand|largest\s+brand|brand\s+with\s+most)/i,
  ordersThisMonth: /(?:orders?|POs?)\s+(?:this|current)\s+month/i,
  ordersLastMonth: /(?:orders?|POs?)\s+(?:last|previous)\s+month/i,
  deliveryDate: /(?:delivery\s+date|when\s+is|shipping\s+date)/i,
  bySupplier: /(?:by\s+supplier|supplier\s+wise|supplier\s+breakdown)/i,
  byBrand: /(?:by\s+brand|brand\s+wise|brand\s+breakdown)/i,
  currencyBreakdown: /(?:currency\s+breakdown|USD\s+vs\s+GBP|orders\s+by\s+currency)/i,
  help: /^(?:help|commands|what\s+can\s+you\s+do|\?)$/i
};

/**
 * Gets date range for "this month"
 */
function getThisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: end.toISOString().slice(0, 10)
  };
}

/**
 * Gets date range for "last month"
 */
function getLastMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: end.toISOString().slice(0, 10)
  };
}

/**
 * Format currency value
 */
function formatCurrency(value, currency) {
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${Number(value).toFixed(2)}`;
}

/**
 * Finds top supplier by order count, quantity, or value
 */
function findTopSupplier(bySupplier) {
  if (!bySupplier || Object.keys(bySupplier).length === 0) {
    return null;
  }

  let topSupplier = null;
  let maxValue = 0;

  for (const [name, metrics] of Object.entries(bySupplier)) {
    // Use count as primary metric, but could also use valueUsd or quantity
    if (metrics.count > maxValue) {
      maxValue = metrics.count;
      topSupplier = { name, ...metrics };
    }
  }

  return topSupplier;
}

/**
 * Finds top brand by order count
 */
function findTopBrand(byBrand) {
  if (!byBrand || Object.keys(byBrand).length === 0) {
    return null;
  }

  let topBrand = null;
  let maxValue = 0;

  for (const [name, metrics] of Object.entries(byBrand)) {
    if (metrics.count > maxValue) {
      maxValue = metrics.count;
      topBrand = { name, ...metrics };
    }
  }

  return topBrand;
}

/**
 * Generates help message with available commands
 */
function generateHelpMessage() {
  return {
    type: "help",
    message: `I can help you with information about your purchase orders. Here are some things you can ask:

📊 **Statistics**
• "Total orders" - Get total number of orders
• "Total value in USD" - Total value in US Dollars
• "Total value in GBP" - Total value in British Pounds
• "Orders this month" - Orders from current month
• "Orders last month" - Orders from previous month

🏢 **Supplier & Brand Analysis**
• "Top supplier" - Find supplier with most orders
• "Top brand" - Find brand with most orders
• "Orders by supplier" - Breakdown by supplier
• "Orders by brand" - Breakdown by brand

💱 **Currency**
• "Currency breakdown" - Orders split by USD/GBP

Try asking any of these questions!`,
    data: null
  };
}

/**
 * Processes user query and generates response
 * @param {string} query - User's natural language query
 * @returns {Promise<Object>} Response with answer and optional data
 */
async function processQuery(query) {
  if (!query || query.trim() === "") {
    return {
      type: "error",
      message: "Please enter a question or type 'help' to see what I can do.",
      data: null
    };
  }

  const normalizedQuery = query.trim();

  // Check for help request
  if (QUERY_PATTERNS.help.test(normalizedQuery)) {
    return generateHelpMessage();
  }

  try {
    // Determine which filters to apply based on query
    let filters = {};

    // Check for date-specific queries
    if (QUERY_PATTERNS.ordersThisMonth.test(normalizedQuery)) {
      filters = getThisMonthRange();
    } else if (QUERY_PATTERNS.ordersLastMonth.test(normalizedQuery)) {
      filters = getLastMonthRange();
    }

    // Get analytics data
    const analytics = await getAnalyticsSummary(filters);

    // Handle different query types

    // Total orders
    if (QUERY_PATTERNS.totalOrders.test(normalizedQuery)) {
      return {
        type: "total_orders",
        message: `There are **${analytics.totals.totalOrders}** total orders${filters.dateFrom ? ` for the specified period` : ""}.`,
        data: { totalOrders: analytics.totals.totalOrders, filters }
      };
    }

    // Total value in USD
    if (QUERY_PATTERNS.totalValueUsd.test(normalizedQuery)) {
      return {
        type: "total_value_usd",
        message: `The total value of orders in **USD** is **${formatCurrency(analytics.totals.totalValueUsd, "USD")}**.`,
        data: { totalValue: analytics.totals.totalValueUsd, currency: "USD", filters }
      };
    }

    // Total value in GBP
    if (QUERY_PATTERNS.totalValueGbp.test(normalizedQuery)) {
      return {
        type: "total_value_gbp",
        message: `The total value of orders in **GBP** is **${formatCurrency(analytics.totals.totalValueGbp, "GBP")}**.`,
        data: { totalValue: analytics.totals.totalValueGbp, currency: "GBP", filters }
      };
    }

    // General total value (show both currencies)
    if (QUERY_PATTERNS.totalValue.test(normalizedQuery)) {
      return {
        type: "total_value",
        message: `**Total Order Values:**\n` +
          `• USD: ${formatCurrency(analytics.totals.totalValueUsd, "USD")}\n` +
          `• GBP: ${formatCurrency(analytics.totals.totalValueGbp, "GBP")}\n` +
          `(Exchange rate: 1 USD = ${analytics.totals.usdToGbpRate.toFixed(4)} GBP)`,
        data: { totals: analytics.totals, filters }
      };
    }

    // Top supplier
    if (QUERY_PATTERNS.topSupplier.test(normalizedQuery)) {
      const topSupplier = findTopSupplier(analytics.bySupplier);

      if (!topSupplier) {
        return {
          type: "top_supplier",
          message: "No supplier data available.",
          data: null
        };
      }

      return {
        type: "top_supplier",
        message: `**Top Supplier: ${topSupplier.name}**\n` +
          `• Orders: ${topSupplier.count}\n` +
          `• Total Quantity: ${topSupplier.quantity}\n` +
          `• Value (USD): ${formatCurrency(topSupplier.valueUsd, "USD")}\n` +
          `• Value (GBP): ${formatCurrency(topSupplier.valueGbp, "GBP")}`,
        data: { topSupplier, filters }
      };
    }

    // Top brand
    if (QUERY_PATTERNS.topBrand.test(normalizedQuery)) {
      const topBrand = findTopBrand(analytics.byBrand);

      if (!topBrand) {
        return {
          type: "top_brand",
          message: "No brand data available.",
          data: null
        };
      }

      return {
        type: "top_brand",
        message: `**Top Brand: ${topBrand.name}**\n` +
          `• Orders: ${topBrand.count}\n` +
          `• Total Quantity: ${topBrand.quantity}\n` +
          `• Value (USD): ${formatCurrency(topBrand.valueUsd, "USD")}\n` +
          `• Value (GBP): ${formatCurrency(topBrand.valueGbp, "GBP")}`,
        data: { topBrand, filters }
      };
    }

    // Orders by supplier breakdown
    if (QUERY_PATTERNS.bySupplier.test(normalizedQuery)) {
      const suppliers = Object.entries(analytics.bySupplier)
        .map(([name, metrics]) => ({
          name,
          orders: metrics.count,
          quantity: metrics.quantity,
          valueUsd: metrics.valueUsd,
          valueGbp: metrics.valueGbp,
          byCurrency: metrics.byCurrency
        }))
        .sort((a, b) => b.orders - a.orders);

      if (suppliers.length === 0) {
        return {
          type: "supplier_breakdown",
          message: "No supplier data available.",
          data: null
        };
      }

      const summary = suppliers.slice(0, 5).map(s =>
        `• **${s.name}**: ${s.orders} orders, ${formatCurrency(s.valueUsd, "USD")}`
      ).join("\n");

      return {
        type: "supplier_breakdown",
        message: `**Orders by Supplier** (Top ${Math.min(5, suppliers.length)}):\n${summary}\n\nTotal suppliers: ${suppliers.length}`,
        data: { suppliers, filters }
      };
    }

    // Orders by brand breakdown
    if (QUERY_PATTERNS.byBrand.test(normalizedQuery)) {
      const brands = Object.entries(analytics.byBrand)
        .map(([name, metrics]) => ({
          name,
          orders: metrics.count,
          quantity: metrics.quantity,
          valueUsd: metrics.valueUsd,
          valueGbp: metrics.valueGbp,
          byCurrency: metrics.byCurrency
        }))
        .sort((a, b) => b.orders - a.orders);

      if (brands.length === 0) {
        return {
          type: "brand_breakdown",
          message: "No brand data available.",
          data: null
        };
      }

      const summary = brands.slice(0, 5).map(b =>
        `• **${b.name}**: ${b.orders} orders, ${formatCurrency(b.valueUsd, "USD")}`
      ).join("\n");

      return {
        type: "brand_breakdown",
        message: `**Orders by Brand** (Top ${Math.min(5, brands.length)}):\n${summary}\n\nTotal brands: ${brands.length}`,
        data: { brands, filters }
      };
    }

    // Currency breakdown
    if (QUERY_PATTERNS.currencyBreakdown.test(normalizedQuery)) {
      // Calculate currency breakdown from orders
      const orders = await getPurchaseOrders(filters);
      const usdOrders = orders.filter(o => (o.currency || "USD").toUpperCase() === "USD");
      const gbpOrders = orders.filter(o => (o.currency || "USD").toUpperCase() === "GBP");

      const usdValue = usdOrders.reduce((sum, o) => sum + Number(o.price_usd || 0), 0);
      const gbpValue = gbpOrders.reduce((sum, o) => sum + Number(o.price_gbp || 0), 0);

      return {
        type: "currency_breakdown",
        message: `**Orders by Currency:**\n` +
          `• **USD**: ${usdOrders.length} orders, ${formatCurrency(usdValue, "USD")}\n` +
          `• **GBP**: ${gbpOrders.length} orders, ${formatCurrency(gbpValue, "GBP")}`,
        data: {
          usd: { count: usdOrders.length, value: usdValue },
          gbp: { count: gbpOrders.length, value: gbpValue }
        }
      };
    }

    // Default: unrecognized query
    return {
      type: "unknown",
      message: `I'm not sure how to answer that. Try asking:\n` +
        `• "Total orders"\n` +
        `• "Total value in USD"\n` +
        `• "Top supplier"\n` +
        `• Type "help" for more options`,
      data: null
    };

  } catch (error) {
    console.error("[ChatbotService] Error processing query:", error);
    return {
      type: "error",
      message: "Sorry, I encountered an error while processing your question. Please try again.",
      data: { error: error.message }
    };
  }
}

module.exports = {
  processQuery,
  generateHelpMessage,
  QUERY_PATTERNS
};
