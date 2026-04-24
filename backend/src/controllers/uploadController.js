const AppError = require("../utils/appError");
const { simulatePdfExtractionAndInsert } = require("../services/uploadService");

async function uploadPdf(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError("No PDF file uploaded", 400);
    }

    const insertedOrder = await simulatePdfExtractionAndInsert(req.file);

    res.status(201).json({
      message: "PDF uploaded and purchase order created",
      data: insertedOrder
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadPdf
};
