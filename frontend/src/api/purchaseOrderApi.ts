import apiClient from "./client";

export type PurchaseOrder = {
  id: string | number;
  supplier: string;
  brand: string;
  buyer: string;
  category: string;
  style_number: string;
  quantity: number;
  price: string | number;
  currency: "USD" | "GBP";
  price_usd?: number;
  price_gbp?: number;
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
  currency?: "USD" | "GBP";
};

export type CurrencyBreakdown = {
  count: number;
  quantity: number;
  value: number;
};

export type EntityMetrics = {
  count: number;
  quantity: number;
  valueUsd: number;
  valueGbp: number;
  byCurrency: {
    USD: CurrencyBreakdown;
    GBP: CurrencyBreakdown;
  };
};

export type AnalyticsSummary = {
  totals: {
    totalOrders: number;
    totalQuantity: number;
    totalValueUsd: number;
    totalValueGbp: number;
    usdToGbpRate: number;
  };
  bySupplier: Record<string, EntityMetrics>;
  byBrand: Record<string, EntityMetrics>;
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

export type ExcelImportResult = {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    skipped?: number;
    importedOrders: Array<{
      rowNumber: number;
      id: string;
      supplier: string;
      styleNumber: string;
      currency: string;
    }>;
    errors: Array<{
      rowNumber: number;
      error: string;
    }>;
  };
};

export async function uploadExcel(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<ExcelImportResult>("/import-excel", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data;
}

export async function downloadExcelTemplate() {
  const { data } = await apiClient.get("/import-excel/template", {
    responseType: "blob"
  });
  return data;
}

export type ChatResponse = {
  success: boolean;
  query: string;
  response: string;
  type: string;
  data: unknown;
};

export type ChatSuggestion = {
  label: string;
  query: string;
};

export async function sendChatMessage(message: string) {
  const { data } = await apiClient.post<ChatResponse>("/chat", { message });
  return data;
}

export async function fetchChatSuggestions() {
  const { data } = await apiClient.get<{ success: boolean; suggestions: ChatSuggestion[] }>("/chat/suggestions");
  return data.suggestions;
}
