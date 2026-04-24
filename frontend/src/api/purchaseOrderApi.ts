import apiClient from "./client";

export type PurchaseOrder = {
  id: string | number;
  supplier: string;
  brand: string;
  buyer: string;
  category: string;
  style_number: string;
  quantity: number;
  price: string;
  delivery_date: string;
  confirmed_ex_factory_date?: string;
  created_at: string;
};

export type PurchaseOrderFilters = {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  supplier?: string;
  category?: string;
  buyer?: string;
};

export type AnalyticsSummary = {
  totals: {
    totalOrders: number;
    totalQuantity: number;
    totalValueUsd: number;
    totalValueGbp: number;
    usdToGbpRate: number;
  };
  bySupplier: Record<string, { count: number; quantity: number; valueUsd: number }>;
  byBrand: Record<string, { count: number; quantity: number; valueUsd: number }>;
  timeline: Array<{
    id: string | number;
    supplier: string;
    brand: string;
    confirmedExFactoryDate: string;
    deliveryDate: string;
  }>;
};

export async function fetchPurchaseOrders(filters: PurchaseOrderFilters = {}) {
  const { data } = await apiClient.get<PurchaseOrder[]>("/purchase-orders", { params: filters });
  return data;
}

export async function uploadPdf(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data;
}

export async function fetchAnalyticsSummary(filters: PurchaseOrderFilters = {}) {
  const { data } = await apiClient.get<AnalyticsSummary>("/purchase-orders/analytics", { params: filters });
  return data;
}
