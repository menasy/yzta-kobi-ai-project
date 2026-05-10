"use client";

import { useEffect, useState } from "react";

/**
 * useDebounce — Input araması için debounce hook
 *
 * @param value - Debounce edilecek değer
 * @param delay - Bekleme süresi (ms), varsayılan 300ms
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup — component unmount veya value/delay değişiminde timer temizlenir
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
