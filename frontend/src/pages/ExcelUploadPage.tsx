import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
// Inline SVG Icons
const CloudUploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

const InsertDriveFileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
  </svg>
);
import { uploadExcel, downloadExcelTemplate, type ExcelImportResult } from "../api/purchaseOrderApi";

export default function ExcelUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExcelImportResult | null>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadExcel,
    onSuccess: (data) => {
      setResult(data);
      if (data.data.successful > 0) {
        setFile(null);
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file extension
      const validExtensions = [".xlsx", ".xls"];
      const hasValidExtension = validExtensions.some(ext =>
        selectedFile.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        alert("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "po_import_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download template:", error);
      alert("Failed to download template. Please try again.");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Full Screen Loading Overlay - Freezes UI during upload */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
          gap: 2
        }}
        open={uploadMutation.isPending}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" color="white">
          Uploading & Processing Excel...
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.8)">
          Please wait while we import your data
        </Typography>
      </Backdrop>

      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontSize: { xs: "1.6rem", md: "2.125rem" },
          fontWeight: 700,
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        Import Purchase Orders from Excel
      </Typography>

      <Stack spacing={3}>
        {/* Template Download Card */}
        <Card
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)"
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <DownloadIcon sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
                Download Template
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Download a sample Excel template with the correct column structure for import.
            </Typography>
            <Button
              variant="contained"
              onClick={handleDownloadTemplate}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }
              }}
              startIcon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>}
              disableElevation
            >
              Download Template
            </Button>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upload Excel File
            </Typography>

            <Stack spacing={2}>
              <Button
                variant="contained"
                component="label"
                sx={{
                  width: "fit-content",
                  background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                  color: "white",
                  px: 3,
                  py: 1.5
                }}
                startIcon={<CloudUploadIcon />}
                disableElevation
              >
                Select Excel File
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFileChange}
                />
              </Button>

              {file && (
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    border: "2px solid #4CAF50",
                    borderRadius: 2
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ color: "#4CAF50" }}>
                      <InsertDriveFileIcon />
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending}
                sx={{
                  width: "fit-content",
                  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:disabled": {
                    background: "#ccc",
                    color: "#666"
                  }
                }}
              >
                Import Orders
              </Button>

              {uploadMutation.isError && (
                <Alert severity="error">
                  Import failed: {uploadMutation.error instanceof Error ? uploadMutation.error.message : "Unknown error"}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Results Card */}
        {result && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Import Results
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label={`${result.data.total} Total`}
                  color="default"
                  variant="outlined"
                />
                <Chip
                  label={`${result.data.successful} Successful`}
                  color="success"
                />
                <Chip
                  label={`${result.data.failed} Failed`}
                  color={result.data.failed > 0 ? "error" : "default"}
                />
                {(result.data.skipped ?? 0) > 0 && (
                  <Chip
                    label={`${result.data.skipped} Skipped`}
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Stack>

              {result.data.successful > 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {result.message}
                </Alert>
              )}

              {result.data.failed > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {result.data.failed} rows failed to import. Check the error list below.
                </Alert>
              )}

              {(result.data.skipped ?? 0) > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {result.data.skipped} rows were skipped (empty quantity and price). Check that your Excel columns match the expected format.
                </Alert>
              )}

              {/* Successful Imports */}
              {result.data.importedOrders.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Successfully Imported Orders
                  </Typography>
                  <List dense>
                    {result.data.importedOrders.slice(0, 5).map((order) => (
                      <ListItem key={order.id}>
                        <ListItemText
                          primary={`${order.supplier} - ${order.styleNumber}`}
                          secondary={`Row ${order.rowNumber} | Currency: ${order.currency}`}
                        />
                      </ListItem>
                    ))}
                    {result.data.importedOrders.length > 5 && (
                      <ListItem>
                        <ListItemText
                          primary={`... and ${result.data.importedOrders.length - 5} more`}
                        />
                      </ListItem>
                    )}
                  </List>
                </>
              )}

              {/* Errors */}
              {result.data.errors.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                    Errors
                  </Typography>
                  <List dense>
                    {result.data.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`Row ${error.rowNumber}`}
                          secondary={error.error}
                          secondaryTypographyProps={{ color: "error" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expected Columns
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                <li><strong>Supplier</strong> - Vendor/Supplier name</li>
                <li><strong>Brand</strong> - Product brand</li>
                <li><strong>Buyer</strong> - Purchase order buyer</li>
                <li><strong>Category</strong> - Product category</li>
                <li><strong>Style Number</strong> - Unique style identifier (auto-generated if empty)</li>
                <li><strong>Quantity</strong> - Order quantity (numeric)</li>
                <li><strong>Price</strong> - Unit price (numeric)</li>
                <li><strong>Currency</strong> - USD or GBP (default: USD)</li>
                <li><strong>Delivery Date</strong> - Expected delivery date</li>
                <li><strong>Confirmed Ex-Factory Date</strong> - Factory shipment date</li>
              </Box>
              <Typography sx={{ mt: 2 }}>
                <em>Note: Date columns support various formats including YYYY-MM-DD, DD/MM/YYYY, and Excel date serial numbers.</em>
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
