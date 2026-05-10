export interface ApiResponse<T> {
  statusCode: number;
  key: string;
  message: string;
  data: T | null;
  errors: string[] | null;
}

export interface OrderLookupData {
  orderNumber: string;
  status: string;
  date: string;
  total: string;
}

export interface StockQueryData {
  productName: string;
  sku: string;
  inStock: boolean;
  quantity: number;
  location?: string;
}

export interface CargoTrackingData {
  trackingNumber: string;
  company: string;
  status: string;
  estimatedDelivery: string;
  lastUpdate: string;
}
