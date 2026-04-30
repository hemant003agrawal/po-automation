import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { useMemo, useState } from "react";
import type { PurchaseOrder } from "../../api/purchaseOrderApi";

type Props = {
  rows: PurchaseOrder[];
};

function formatDeliveryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  // Format: "29 March 2026 at 12:00 AM" with capital AM/PM
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);

  // Capitalize AM/PM
  return formatted.replace(/\b(am|pm)\b/gi, (match) => match.toUpperCase());
}

function formatCurrencyValue(value: number | string | undefined, currency: string) {
  const numValue = typeof value === "string" ? parseFloat(value) : (value || 0);
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${numValue.toFixed(2)}`;
}

function CurrencyChip({ currency }: { currency: string }) {
  const isGbp = currency === "GBP";
  return (
    <Chip
      label={currency}
      size="small"
      color={isGbp ? "secondary" : "primary"}
      variant="outlined"
      sx={{ fontWeight: 600, minWidth: 50 }}
    />
  );
}

export default function DataTable({ rows }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default 10 rows per page

  const paginatedRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage]
  );

  return (
    <>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Brand</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Buyer</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Style Number</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Currency</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Value (USD)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Value (GBP)</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Ex-Factory Date</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#333" }}>Delivery Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((order) => (
              <TableRow
                key={order.id}
                sx={{
                  "&:hover": { backgroundColor: "rgba(102, 126, 234, 0.08)" },
                  transition: "background-color 0.2s"
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{order.supplier}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{order.brand}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{order.buyer}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{order.category}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{order.style_number}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "#667eea" }}>{order.quantity}</TableCell>
                <TableCell>
                  <CurrencyChip currency={order.currency || "USD"} />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrencyValue(order.price, order.currency || "USD")}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "#4CAF50" }}>
                  {order.price_usd ? formatCurrencyValue(order.price_usd, "USD") : "-"}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "#9C27B0" }}>
                  {order.price_gbp ? formatCurrencyValue(order.price_gbp, "GBP") : "-"}
                </TableCell>
                <TableCell sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                  {formatDeliveryDate(order.confirmed_ex_factory_date || "")}
                </TableCell>
                <TableCell sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                  {formatDeliveryDate(order.delivery_date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        labelRowsPerPage="Rows per page:"
      />
    </>
  );
}
