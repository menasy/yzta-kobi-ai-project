import { useState } from 'react';
import { queryStock } from '../api/customer.api';
import { StockQueryInput } from '../schemas/customer.schema';
import { ApiResponse, StockQueryData } from '../types/customer.types';

export function useStockQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<StockQueryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StockQueryInput) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response: ApiResponse<StockQueryData> = await queryStock(input);

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
