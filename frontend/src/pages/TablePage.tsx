import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { fetchPurchaseOrders, type PurchaseOrderFilters } from "../api/purchaseOrderApi";
import FilterPanel from "../components/filters/FilterPanel";
import DataTable from "../components/tables/DataTable";
import Loader from "../components/common/Loader";
import { exportOrdersToCsv } from "../utils/csv";

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

  if (isLoading) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: "1.6rem", md: "2.125rem" } }}>
        Purchase Orders Table
      </Typography>
      <Stack spacing={2}>
        <FilterPanel
          filters={draftFilters}
          onChange={setDraftFilters}
          onApply={() => setFilters(draftFilters)}
          onClear={clearFilters}
        />
        <Button variant="outlined" onClick={() => exportOrdersToCsv(orders)} sx={{ width: { xs: "100%", sm: 160 } }}>
          Export CSV
        </Button>
        <Card>
          <CardContent>
            <DataTable rows={orders} />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
