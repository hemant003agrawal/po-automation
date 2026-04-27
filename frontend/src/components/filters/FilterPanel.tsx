import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import type { PurchaseOrderFilters } from "../../api/purchaseOrderApi";

type Props = {
  filters: PurchaseOrderFilters;
  onChange: (filters: PurchaseOrderFilters) => void;
  onApply?: () => void;
  onClear?: () => void;
  showCurrencyFilter?: boolean;
};

export default function FilterPanel({ filters, onChange, onApply, onClear, showCurrencyFilter = true }: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
      <TextField
        size="small"
        label="Date From"
        type="date"
        value={filters.dateFrom ?? ""}
        fullWidth
        InputLabelProps={{ shrink: true }}
        onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
      />
      <TextField
        size="small"
        label="Date To"
        type="date"
        value={filters.dateTo ?? ""}
        fullWidth
        InputLabelProps={{ shrink: true }}
        onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
      />
      <TextField
        size="small"
        label="Supplier"
        value={filters.supplier ?? ""}
        fullWidth
        onChange={(e) => onChange({ ...filters, supplier: e.target.value })}
      />
      <TextField
        size="small"
        label="Category"
        value={filters.category ?? ""}
        fullWidth
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
      />
      <TextField
        size="small"
        label="Buyer"
        value={filters.buyer ?? ""}
        fullWidth
        onChange={(e) => onChange({ ...filters, buyer: e.target.value })}
      />
      {showCurrencyFilter && (
        <FormControl size="small" fullWidth>
          <InputLabel id="currency-filter-label">Currency</InputLabel>
          <Select
            labelId="currency-filter-label"
            label="Currency"
            value={filters.currency ?? ""}
            onChange={(e) => onChange({ ...filters, currency: e.target.value as "USD" | "GBP" | undefined })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="USD">USD ($)</MenuItem>
            <MenuItem value="GBP">GBP (£)</MenuItem>
          </Select>
        </FormControl>
      )}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={onApply}>
          Apply
        </Button>
        {onClear && (
          <Button variant="outlined" color="inherit" onClick={onClear}>
            Clear
          </Button>
        )}
      </Box>
    </Stack>
  );
}
