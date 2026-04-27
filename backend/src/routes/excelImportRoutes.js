/**
 * Excel Import Routes
 * Routes for importing purchase orders from Excel files.
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");

const { importExcel, downloadTemplate } = require("../controllers/excelImportController");
const authMiddleware = require("../middleware/authMiddleware");
const AppError = require("../utils/appError");

const router = express.Router();

// Configure multer for disk storage (temp file needed for xlsx.readFile)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "excel-import-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Check file extension
    const fileExtension = file.originalname?.toLowerCase() || "";
    const isExcel = fileExtension.endsWith(".xlsx") || fileExtension.endsWith(".xls");

    // Check MIME type
    const validMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream"
    ];
    const isValidMime = validMimeTypes.includes(file.mimetype);

    if (!isExcel && !isValidMime) {
      return cb(new AppError("Only Excel files (.xlsx, .xls) are allowed", 400));
    }

    cb(null, true);
  }
});

/**
 * POST /api/import-excel
 * Import purchase orders from Excel file
 * Requires: file (Excel)
 */
router.post("/", authMiddleware, upload.single("file"), importExcel);

/**
 * GET /api/import-excel/template
 * Download sample Excel template
 */
router.get("/template", authMiddleware, downloadTemplate);

module.exports = router;
