import {
  ApiResponse,
  CargoTrackingData,
  OrderLookupData,
  StockQueryData,
} from '../types/customer.types';
import {
  CargoTrackingInput,
  OrderLookupInput,
  StockQueryInput,
} from '../schemas/customer.schema';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function lookupOrder(
  input: OrderLookupInput
): Promise<ApiResponse<OrderLookupData>> {
  await delay(1200);

  if (input.orderNumber.startsWith('ERR')) {
    return {
      statusCode: 404,
      key: 'ORDER_NOT_FOUND',
      message: 'Sipariş bulunamadı. Lütfen numaranızı kontrol edip tekrar deneyin.',
      data: null,
      errors: ['Order not found'],
    };
  }

  return {
    statusCode: 200,
    key: 'ORDER_FOUND',
    message: 'Sipariş başarıyla bulundu.',
    data: {
      orderNumber: input.orderNumber,
      status: 'Hazırlanıyor',
      date: new Date().toLocaleDateString('tr-TR'),
      total: '1.250,00 TL',
    },
    errors: null,
  };
}

export async function queryStock(
  input: StockQueryInput
): Promise<ApiResponse<StockQueryData>> {
  await delay(1000);

  if (input.query.toLowerCase() === 'yok') {
    return {
      statusCode: 200,
      key: 'STOCK_FOUND',
      message: 'Stok durumu sorgulandı.',
      data: {
        productName: 'Bilinmeyen Ürün',
        sku: 'UKN-000',
        inStock: false,
        quantity: 0,
      },
      errors: null,
    };
  }

  return {
    statusCode: 200,
    key: 'STOCK_FOUND',
    message: 'Stok durumu sorgulandı.',
    data: {
      productName: input.query,
      sku: `SKU-${Math.floor(Math.random() * 10000)}`,
      inStock: true,
      quantity: Math.floor(Math.random() * 100) + 1,
      location: 'Depo A',
    },
    errors: null,
  };
}

export async function trackCargo(
  input: CargoTrackingInput
): Promise<ApiResponse<CargoTrackingData>> {
  await delay(1500);

  if (input.trackingNumber.startsWith('000')) {
    return {
      statusCode: 404,
      key: 'CARGO_NOT_FOUND',
      message: 'Kargo bulunamadı veya henüz sisteme girilmedi.',
      data: null,
      errors: ['Cargo tracking number invalid'],
    };
  }

  return {
    statusCode: 200,
    key: 'CARGO_FOUND',
    message: 'Kargo durumu başarıyla getirildi.',
    data: {
      trackingNumber: input.trackingNumber,
      company: 'Yurtiçi Kargo',
      status: 'Dağıtıma Çıktı',
      estimatedDelivery: 'Bugün 18:00',
      lastUpdate: 'Şubeden çıkış yapıldı',
    },
    errors: null,
  };
}
