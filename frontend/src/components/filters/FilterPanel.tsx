import { Box, Button, Card, CardContent, Chip, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import type { PurchaseOrderFilters } from "../../api/purchaseOrderApi";

// Inline SVG Icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
  </svg>
);

const SupplierIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>
  </svg>
);

const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l-5.5 9h11z M17.5 9L12 22l5.5-13z M6.5 9L12 22l-5.5-13z"/>
  </svg>
);

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const CurrencyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

type Props = {
  filters: PurchaseOrderFilters;
  onChange: (filters: PurchaseOrderFilters) => void;
  onApply?: () => void;
  onClear?: () => void;
  showCurrencyFilter?: boolean;
};

export default function FilterPanel({ filters, onChange, onApply, onClear, showCurrencyFilter = true }: Props) {
  // Count active filters
  const activeFiltersCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.supplier,
    filters.category,
    filters.buyer,
    filters.currency
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "visible",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderRadius: "12px 12px 0 0",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FilterIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Filters
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={activeFiltersCount}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.3)",
                color: "white",
                fontWeight: 700,
                height: 24
              }}
            />
          )}
        </Stack>

        {onClear && hasActiveFilters && (
          <Button
            size="small"
            onClick={onClear}
            startIcon={<ClearIcon />}
            sx={{
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "rgba(255,255,255,0.15)",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.25)"
              }
            }}
          >
            Clear All
          </Button>
        )}
      </Paper>

      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Date Range Section */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Date From"
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: "#667eea", display: "flex" }}>
                      <CalendarIcon />
                    </Box>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8f9fa",
                  "&:hover fieldset": { borderColor: "#667eea" },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" }
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Date To"
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: "#667eea", display: "flex" }}>
                      <CalendarIcon />
                    </Box>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8f9fa",
                  "&:hover fieldset": { borderColor: "#667eea" },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" }
                }
              }}
            />
          </Grid>

          {/* Order Details Section */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Supplier"
              placeholder="Search supplier..."
              value={filters.supplier ?? ""}
              onChange={(e) => onChange({ ...filters, supplier: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: "#667eea", display: "flex" }}>
                      <SupplierIcon />
                    </Box>
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8f9fa",
                  "&:hover fieldset": { borderColor: "#667eea" },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" }
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Category"
              placeholder="Search category..."
              value={filters.category ?? ""}
              onChange={(e) => onChange({ ...filters, category: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: "#667eea", display: "flex" }}>
                      <CategoryIcon />
                    </Box>
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8f9fa",
                  "&:hover fieldset": { borderColor: "#667eea" },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" }
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Buyer"
              placeholder="Search buyer..."
              value={filters.buyer ?? ""}
              onChange={(e) => onChange({ ...filters, buyer: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: "#667eea", display: "flex" }}>
                      <PersonIcon />
                    </Box>
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8f9fa",
                  "&:hover fieldset": { borderColor: "#667eea" },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" }
                }
              }}
            />
          </Grid>

          {showCurrencyFilter && (
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <FormControl
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#f8f9fa",
                    "&:hover fieldset": { borderColor: "#667eea" },
                    "&.Mui-focused fieldset": { borderColor: "#667eea" }
                  }
                }}
              >
                <InputLabel id="currency-filter-label">Currency</InputLabel>
                <Select
                  labelId="currency-filter-label"
                  label="Currency"
                  value={filters.currency ?? ""}
                  onChange={(e) => onChange({ ...filters, currency: e.target.value as "USD" | "GBP" | undefined })}
                  startAdornment={
                    <InputAdornment position="start">
                      <Box sx={{ color: "#667eea", display: "flex", mr: -1 }}>
                        <CurrencyIcon />
                      </Box>
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>All Currencies</em>
                  </MenuItem>
                  <MenuItem value="USD">USD ($) - US Dollar</MenuItem>
                  <MenuItem value="GBP">GBP (£) - British Pound</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Apply Button */}
          <Grid size={{ xs: 12, md: showCurrencyFilter ? 12 : 6, lg: showCurrencyFilter ? 3 : 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={onApply}
              disabled={!onApply}
              startIcon={<SearchIcon />}
              sx={{
                py: 1,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.95rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                  transform: "translateY(-1px)"
                },
                transition: "all 0.3s ease"
              }}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>

        {hasActiveFilters && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Active:
              </Typography>
              {filters.dateFrom && (
                <Chip
                  size="small"
                  label={`From: ${filters.dateFrom}`}
                  sx={{ bgcolor: "rgba(102, 126, 234, 0.1)", color: "#667eea", fontWeight: 500 }}
                />
              )}
              {filters.dateTo && (
                <Chip
                  size="small"
                  label={`To: ${filters.dateTo}`}
                  sx={{ bgcolor: "rgba(102, 126, 234, 0.1)", color: "#667eea", fontWeight: 500 }}
                />
              )}
              {filters.supplier && (
                <Chip
                  size="small"
                  label={`Supplier: ${filters.supplier}`}
                  sx={{ bgcolor: "rgba(102, 126, 234, 0.1)", color: "#667eea", fontWeight: 500 }}
                />
              )}
              {filters.category && (
                <Chip
                  size="small"
                  label={`Category: ${filters.category}`}
                  sx={{ bgcolor: "rgba(102, 126, 234, 0.1)", color: "#667eea", fontWeight: 500 }}
                />
              )}
              {filters.buyer && (
                <Chip
                  size="small"
                  label={`Buyer: ${filters.buyer}`}
                  sx={{ bgcolor: "rgba(102, 126, 234, 0.1)", color: "#667eea", fontWeight: 500 }}
                />
              )}
              {filters.currency && (
                <Chip
                  size="small"
                  label={`Currency: ${filters.currency}`}
                  sx={{ bgcolor: "rgba(102, 126, 234, 0.1)", color: "#667eea", fontWeight: 500 }}
                />
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
