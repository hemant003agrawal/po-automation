import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { uploadPdf } from "../api/purchaseOrderApi";

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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: "1.6rem", md: "2.125rem" } }}>
        Upload Purchase Order PDF
      </Typography>
      <Card sx={{ width: "100%", maxWidth: 640 }}>
        <CardContent>
          <Stack spacing={2}>
            {message && <Alert severity={message.includes("failed") ? "error" : "success"}>{message}</Alert>}
            <Button variant="outlined" component="label">
              Select PDF
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>
            <Typography variant="body2">Selected: {file?.name ?? "No file selected"}</Typography>
            {file && (
              <Typography variant="body2" color="text.secondary">
                Preview: {file.name} ({Math.round(file.size / 1024)} KB)
              </Typography>
            )}
            <Button variant="contained" onClick={handleUpload} disabled={!file || loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
