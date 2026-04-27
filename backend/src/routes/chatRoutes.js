/**
 * Chat Routes
 * Routes for chatbot functionality.
 */

const express = require("express");
const { chat, getSuggestions } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * POST /api/chat
 * Send a message to the chatbot
 * Body: { message: string }
 */
router.post("/", authMiddleware, chat);

/**
 * GET /api/chat/suggestions
 * Get suggested queries for the chatbot UI
 */
router.get("/suggestions", authMiddleware, getSuggestions);

module.exports = router;
