const express = require("express");
const multer = require("multer");

const { uploadPdf } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const AppError = require("../utils/appError");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";
    const isPdfExtension = /\.pdf$/i.test(file.originalname || "");

    // Some tools upload PDFs with generic MIME types, so allow by extension too.
    if (!isPdfMime && !isPdfExtension) {
      return cb(new AppError("Only PDF files are allowed", 400));
    }
    cb(null, true);
  }
});

router.post("/", authMiddleware, upload.single("file"), uploadPdf);

module.exports = router;
