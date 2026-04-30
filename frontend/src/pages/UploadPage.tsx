import { useState } from "react";
import { Alert, Backdrop, Box, Button, Card, CardContent, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { uploadPdf } from "../api/purchaseOrderApi";

// Inline SVG Icons
const PictureAsPdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V13H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm11 5.5h1v-3h-1v3z"/>
  </svg>
);

const CloudUploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
  </svg>
);

const InsertDriveFileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
  </svg>
);

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage("");
    try {
      await uploadPdf(file);
      setMessage("Upload complete. Dummy PO inserted successfully.");
      setFile(null);
    } catch {
      setMessage("Upload failed. Please upload a valid PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)", minHeight: "100vh" }}>
      {/* Full Screen Loading Overlay */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
          gap: 2
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" color="white">
          Uploading PDF...
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.8)">
          Please wait while we process your file
        </Typography>
      </Backdrop>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          color: "white",
          boxShadow: "0 8px 32px rgba(250, 112, 154, 0.4)"
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.8rem", md: "2.5rem" },
            fontWeight: 800,
            background: "linear-gradient(45deg, #fff 30%, #e0e0e0 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Upload Purchase Order PDF
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
          Upload PDF files to import purchase orders
        </Typography>
      </Paper>

      <Card
        sx={{
          width: "100%",
          maxWidth: 640,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {message && (
              <Alert severity={message.includes("failed") ? "error" : "success"} sx={{ borderRadius: 2 }}>
                {message}
              </Alert>
            )}

            <Button
              variant="contained"
              component="label"
              sx={{
                width: "fit-content",
                background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                color: "white",
                px: 3,
                py: 1.5,
                fontWeight: 600
              }}
              startIcon={<PictureAsPdfIcon />}
              disableElevation
            >
              Select PDF
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>

            {file && (
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                  border: "2px solid #FF8E53",
                  borderRadius: 2
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ color: "#FF8E53" }}>
                    <InsertDriveFileIcon />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {file.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Size: {Math.round(file.size / 1024)} KB
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {!file && (
              <Typography variant="body2" color="text.secondary">
                No file selected
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || loading}
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
              startIcon={<CloudUploadIcon />}
              disableElevation
            >
              Upload PDF
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
