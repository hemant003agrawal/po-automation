import type { PurchaseOrder } from "../api/purchaseOrderApi";

export function exportOrdersToCsv(orders: PurchaseOrder[]) {
  const headers = [
    "id",
    "supplier",
    "brand",
    "buyer",
    "category",
    "style_number",
    "quantity",
    "price",
    "delivery_date",
    "created_at"
  ];

  const rows = orders.map((order) =>
    headers.map((header) => JSON.stringify(String(order[header as keyof PurchaseOrder] ?? ""))).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "purchase-orders.csv";
  link.click();
  URL.revokeObjectURL(url);
}
