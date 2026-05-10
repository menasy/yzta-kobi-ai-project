import { useState } from 'react';
import { trackCargo } from '../api/customer.api';
import { CargoTrackingInput } from '../schemas/customer.schema';
import { ApiResponse, CargoTrackingData } from '../types/customer.types';

export function useCargoTracking() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CargoTrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: CargoTrackingInput) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response: ApiResponse<CargoTrackingData> = await trackCargo(input);

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
