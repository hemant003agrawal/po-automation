require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const purchaseOrderRoutes = require("./src/routes/purchaseOrderRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const excelImportRoutes = require("./src/routes/excelImportRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const { errorHandler, notFound } = require("./src/middleware/errorMiddleware");
const { ensureTableExists } = require("./src/services/purchaseOrderService");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "PO Automation API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/import-excel", excelImportRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  try {
    await ensureTableExists();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

bootstrap();
