import { Box, Button, Stack, TextField } from "@mui/material";
import type { PurchaseOrderFilters } from "../../api/purchaseOrderApi";

type Props = {
  filters: PurchaseOrderFilters;
  onChange: (filters: PurchaseOrderFilters) => void;
  onApply?: () => void;
  onClear?: () => void;
};

export default function FilterPanel({ filters, onChange, onApply, onClear }: Props) {
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
