import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Avatar,
  Paper
} from "@mui/material";
// Inline SVG Icons - no external dependency needed
const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1 0-2 1-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/>
  </svg>
);

const AttachMoneyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
  </svg>
);

const CurrencyPoundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 21c1.93 0 3.5-1.57 3.5-3.5V11c0-.83-.67-1.5-1.5-1.5h-1v-1c0-.83-.67-1.5-1.5-1.5S12 7.67 12 8.5V12H14v2h-3.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5H12v1.5c0 1.93 1.57 3.5 3.5 3.5z"/>
  </svg>
);

const BusinessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
  </svg>
);

const LocalOfferIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
  </svg>
);

const CalendarTodayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
  </svg>
);
import { fetchAnalyticsSummary, type PurchaseOrderFilters, type EntityMetrics } from "../api/purchaseOrderApi";
import FilterPanel from "../components/filters/FilterPanel";
import ChartCard from "../components/charts/ChartCard";
import Loader from "../components/common/Loader";

type CurrencyView = "USD" | "GBP";

// Format date: "22 June 2026 04:35 PM"
function formatDateTime(dateValue: string | null | undefined) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function formatCurrency(value: number, currency: CurrencyView) {
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Colorful Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  gradient
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  gradient: string;
}) {
  return (
    <Card
      sx={{
        background: gradient,
        color: "white",
        boxShadow: `0 8px 32px ${color}40`,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 40px ${color}60`
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", md: "2rem" } }}>
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 56,
              height: 56,
              backdropFilter: "blur(10px)"
            }}
          >
            <Icon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SupplierBreakdownCard({
  title,
  data,
  currency
}: {
  title: string;
  data: Record<string, EntityMetrics>;
  currency: CurrencyView;
}) {
  const sortedEntries = useMemo(() => {
    return Object.entries(data)
      .sort((a, b) => b[1].byCurrency[currency].value - a[1].byCurrency[currency].value)
      .slice(0, 10);
  }, [data, currency]);

  const gradient = currency === "GBP"
    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";

  if (sortedEntries.length === 0) {
    return (
      <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
          <Typography color="text.secondary">No data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider"
      }}
    >
      <Box sx={{ p: 2, background: gradient, color: "white" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title} ({currency})
        </Typography>
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          {sortedEntries.map(([name, metrics], index) => (
            <Box
              key={name}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.5,
                borderRadius: 2,
                background: index % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent",
                transition: "background 0.2s",
                "&:hover": { background: "rgba(0,0,0,0.05)" }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: gradient,
                    fontSize: "0.875rem",
                    fontWeight: 700
                  }}
                >
                  {index + 1}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {name}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${metrics.byCurrency[currency].count} orders`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
                <Chip
                  label={formatCurrency(metrics.byCurrency[currency].value, currency)}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    background: gradient,
                    color: "white",
                    fontWeight: 600
                  }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [draftFilters, setDraftFilters] = useState<PurchaseOrderFilters>({});
  const [filters, setFilters] = useState<PurchaseOrderFilters>({});
  const [currencyView, setCurrencyView] = useState<CurrencyView>("USD");

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
      value: currencyView === "GBP" ? metrics.valueGbp : metrics.valueUsd
    }));
  }, [summary, currencyView]);

  const brandChartData = useMemo(() => {
    if (!summary?.byBrand) return [];
    return Object.entries(summary.byBrand).map(([name, metrics]) => ({
      name,
      value: Number((currencyView === "GBP" ? metrics.valueGbp : metrics.valueUsd).toFixed(2))
    }));
  }, [summary, currencyView]);

  if (isLoading) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)", minHeight: "100vh" }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
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
              Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Purchase Orders Analytics & Overview
            </Typography>
          </Box>
          <ButtonGroup
            size="large"
            variant="contained"
            sx={{
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              "& .MuiButton-root": {
                px: 3,
                fontWeight: 600
              }
            }}
          >
            <Button
              variant={currencyView === "USD" ? "contained" : "outlined"}
              onClick={() => setCurrencyView("USD")}
              sx={{
                background: currencyView === "USD" ? "#fff" : "transparent",
                color: currencyView === "USD" ? "#667eea" : "#fff",
                borderColor: "rgba(255,255,255,0.5)"
              }}
            >
              USD ($)
            </Button>
            <Button
              variant={currencyView === "GBP" ? "contained" : "outlined"}
              onClick={() => setCurrencyView("GBP")}
              sx={{
                background: currencyView === "GBP" ? "#fff" : "transparent",
                color: currencyView === "GBP" ? "#764ba2" : "#fff",
                borderColor: "rgba(255,255,255,0.5)"
              }}
            >
              GBP (£)
            </Button>
          </ButtonGroup>
        </Stack>
      </Paper>

      <FilterPanel
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={() => setFilters(draftFilters)}
        onClear={clearFilters}
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Summary Cards with Colorful Gradients */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Orders"
            value={totals.totalOrders.toLocaleString()}
            icon={ShoppingCartIcon}
            color="#4facfe"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Quantity"
            value={totals.totalQuantity.toLocaleString()}
            icon={InventoryIcon}
            color="#43e97b"
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Value (USD)"
            value={formatCurrency(totals.totalValueUsd, "USD")}
            icon={AttachMoneyIcon}
            color="#fa709a"
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Value (GBP)"
            value={formatCurrency(totals.totalValueGbp, "GBP")}
            icon={CurrencyPoundIcon}
            color="#667eea"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>

        {/* Charts with Enhanced Styling */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Box sx={{ p: 2, background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <BusinessIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Order Value by Supplier ({currencyView})
                </Typography>
              </Stack>
            </Box>
            <CardContent>
              <ChartCard title="" data={supplierChartData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Box sx={{ p: 2, background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalOfferIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Order Value by Brand ({currencyView})
                </Typography>
              </Stack>
            </Box>
            <CardContent>
              <ChartCard title="" data={brandChartData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Supplier Breakdown with Currency Separation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SupplierBreakdownCard
            title="Supplier Breakdown"
            data={summary?.bySupplier || {}}
            currency={currencyView}
          />
        </Grid>

        {/* Brand Breakdown with Currency Separation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SupplierBreakdownCard
            title="Brand Breakdown"
            data={summary?.byBrand || {}}
            currency={currencyView}
          />
        </Grid>

        {/* Timeline with Modern Design */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Box sx={{ p: 2, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarTodayIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Delivery Timeline
                </Typography>
              </Stack>
            </Box>
            <CardContent sx={{ p: 0 }}>
              <Stack spacing={0} divider={<Divider />}>
                {(summary?.timeline || []).slice(0, 10).map((item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                      p: 2,
                      background: index % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent",
                      transition: "background 0.2s",
                      "&:hover": { background: "rgba(67, 233, 123, 0.1)" },
                      alignItems: "center"
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                        fontSize: "0.875rem",
                        fontWeight: 700
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 150, color: "#333" }}>
                      {item.supplier}
                    </Typography>
                    <Chip
                      label={item.brand}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                    <Box sx={{ ml: "auto", textAlign: "right" }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "#666" }}>
                        Ex-Factory: <strong>{item.confirmedExFactoryDate}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#43e97b", fontWeight: 600 }}>
                        → Delivery: <strong>{item.deliveryDate}</strong>
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {(summary?.timeline || []).length === 0 && (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                      No delivery data available
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
