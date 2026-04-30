import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Backdrop, Box, Button, Card, CardContent, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { fetchPurchaseOrders, type PurchaseOrderFilters } from "../api/purchaseOrderApi";
import FilterPanel from "../components/filters/FilterPanel";
import DataTable from "../components/tables/DataTable";
import { exportOrdersToCsv } from "../utils/csv";

// Inline SVG Icons
const TableChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 10.02h7V21h-7zM17 3h7v7h-7zM3 21h7v-7H3zm7-10.02V3H3v7.98z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

export default function TablePage() {
  const [draftFilters, setDraftFilters] = useState<PurchaseOrderFilters>({});
  const [filters, setFilters] = useState<PurchaseOrderFilters>({});
  const clearFilters = () => {
    setDraftFilters({});
    setFilters({});
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["purchase-orders-table", filters],
    queryFn: () => fetchPurchaseOrders(filters)
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)", minHeight: "100vh", position: "relative" }}>
      {/* Loading Backdrop - freezes screen during filter application */}
      <Backdrop
        open={isLoading}
        sx={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
          gap: 2
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: "#4facfe",
            filter: "drop-shadow(0 4px 8px rgba(79, 172, 254, 0.4))"
          }}
        />
        <Typography variant="h6" sx={{ color: "#4facfe", fontWeight: 600 }}>
          Applying filters...
        </Typography>
      </Backdrop>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
          boxShadow: "0 8px 32px rgba(79, 172, 254, 0.4)"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <TableChartIcon />
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
                Purchase Orders Table
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              View and manage all purchase orders
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => exportOrdersToCsv(orders)}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              px: 3,
              py: 1,
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }
            }}
            startIcon={<DownloadIcon />}
            disableElevation
          >
            Export CSV
          </Button>
        </Stack>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <FilterPanel
          filters={draftFilters}
          onChange={setDraftFilters}
          onApply={() => setFilters(draftFilters)}
          onClear={clearFilters}
        />
      </Box>

        <Card
          sx={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider"
          }}
        >
          <Box
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
              borderBottom: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Orders ({orders.length} total)
            </Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <DataTable rows={orders} />
          </CardContent>
        </Card>
    </Box>
  );
}
