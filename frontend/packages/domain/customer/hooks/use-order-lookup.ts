import { useState } from 'react';
import { lookupOrder } from '../api/customer.api';
import { OrderLookupInput } from '../schemas/customer.schema';
import { ApiResponse, OrderLookupData } from '../types/customer.types';

export function useOrderLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OrderLookupData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: OrderLookupInput) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response: ApiResponse<OrderLookupData> = await lookupOrder(input);

      if (response.statusCode >= 400 || !response.data) {
        setError(response.message || 'Bir hata oluştu.');
      } else {
        setData(response.data);
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { mutate, isLoading, data, error, reset };
}
