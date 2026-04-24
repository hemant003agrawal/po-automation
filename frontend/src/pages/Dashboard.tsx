import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { fetchAnalyticsSummary, type PurchaseOrderFilters } from "../api/purchaseOrderApi";
import FilterPanel from "../components/filters/FilterPanel";
import ChartCard from "../components/charts/ChartCard";
import Loader from "../components/common/Loader";

export default function Dashboard() {
  const [draftFilters, setDraftFilters] = useState<PurchaseOrderFilters>({});
  const [filters, setFilters] = useState<PurchaseOrderFilters>({});
  const clearFilters = () => {
    setDraftFilters({});
    setFilters({});
  };

  const { data: summary, isLoading } = useQuery({
    queryKey: ["po-analytics", filters],
    queryFn: () => fetchAnalyticsSummary(filters),
    refetchInterval: 15000
  });

  const totals = summary?.totals || {
    totalOrders: 0,
    totalQuantity: 0,
    totalValueUsd: 0,
    totalValueGbp: 0,
    usdToGbpRate: 0.79
  };

  const supplierChartData = useMemo(() => {
    if (!summary?.bySupplier) return [];
    return Object.entries(summary.bySupplier).map(([name, metrics]) => ({
      name,
      value: metrics.quantity
    }));
  }, [summary]);

  const brandChartData = useMemo(() => {
    if (!summary?.byBrand) return [];
    return Object.entries(summary.byBrand).map(([name, metrics]) => ({
      name,
      value: Number(metrics.valueUsd.toFixed(2))
    }));
  }, [summary]);

  if (isLoading) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: "1.6rem", md: "2.125rem" } }}>
        Dashboard
      </Typography>
      <FilterPanel
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={() => setFilters(draftFilters)}
        onClear={clearFilters}
      />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Orders</Typography>
              <Typography variant="h4">{totals.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Quantity</Typography>
              <Typography variant="h4">{totals.totalQuantity}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Value (USD)</Typography>
              <Typography variant="h4">${totals.totalValueUsd.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Value (GBP)</Typography>
              <Typography variant="h4">£{totals.totalValueGbp.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Live rate: 1 USD = {totals.usdToGbpRate.toFixed(4)} GBP
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Quantity by Supplier" data={supplierChartData} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Order Value (USD) by Brand" data={brandChartData} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Delivery vs Confirmed Ex-Factory Timeline
              </Typography>
              <Stack spacing={1}>
                {(summary?.timeline || []).slice(0, 8).map((item) => (
                  <Typography key={item.id} variant="body2">
                    {item.supplier} / {item.brand}: Ex-Factory {item.confirmedExFactoryDate} {"->"} Delivery{" "}
                    {item.deliveryDate}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
