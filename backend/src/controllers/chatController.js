/**
 * Chat Controller
 * Handles HTTP requests for chatbot queries.
 */

const { processQuery } = require("../services/chatbotService");
const AppError = require("../utils/appError");

/**
 * POST /api/chat
 * Processes a chat message and returns bot response
 */
async function chat(req, res, next) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      throw new AppError("Message is required and must be a non-empty string", 400);
    }

    const result = await processQuery(message.trim());

    res.json({
      success: true,
      query: message.trim(),
      response: result.message,
      type: result.type,
      data: result.data
    });
  } catch (error) {
    console.error("[ChatController] Chat processing failed:", error.message);
    next(error);
  }
}

/**
 * GET /api/chat/suggestions
 * Returns suggested queries for the UI
 */
async function getSuggestions(req, res) {
  const suggestions = [
    { label: "Total orders", query: "Total orders" },
    { label: "Total value (USD)", query: "Total value in USD" },
    { label: "Total value (GBP)", query: "Total value in GBP" },
    { label: "Orders this month", query: "Orders this month" },
    { label: "Top supplier", query: "Top supplier" },
    { label: "Top brand", query: "Top brand" },
    { label: "Supplier breakdown", query: "Orders by supplier" },
    { label: "Currency breakdown", query: "Currency breakdown" }
  ];

  res.json({
    success: true,
    suggestions
  });
}

module.exports = {
  chat,
  getSuggestions
};
