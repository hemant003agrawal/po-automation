import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { useMemo, useState } from "react";
import type { PurchaseOrder } from "../../api/purchaseOrderApi";

type Props = {
  rows: PurchaseOrder[];
};

function formatDeliveryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
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
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage]
  );

  return (
    <>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Style Number</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Value (USD)</TableCell>
              <TableCell align="right">Value (GBP)</TableCell>
              <TableCell>Ex-Factory Date</TableCell>
              <TableCell>Delivery Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.brand}</TableCell>
                <TableCell>{order.buyer}</TableCell>
                <TableCell>{order.category}</TableCell>
                <TableCell>{order.style_number}</TableCell>
                <TableCell align="right">{order.quantity}</TableCell>
                <TableCell>
                  <CurrencyChip currency={order.currency || "USD"} />
                </TableCell>
                <TableCell align="right">
                  {formatCurrencyValue(order.price, order.currency || "USD")}
                </TableCell>
                <TableCell align="right">
                  {order.price_usd ? formatCurrencyValue(order.price_usd, "USD") : "-"}
                </TableCell>
                <TableCell align="right">
                  {order.price_gbp ? formatCurrencyValue(order.price_gbp, "GBP") : "-"}
                </TableCell>
                <TableCell>{formatDeliveryDate(order.confirmed_ex_factory_date || "")}</TableCell>
                <TableCell>{formatDeliveryDate(order.delivery_date)}</TableCell>
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
        rowsPerPageOptions={[5, 10, 25]}
      />
    </>
  );
}
