import { useStore } from "zustand";
import { useMessageStoreContext } from "./provider";
import { ApiError } from "@repo/core";
import type { ApiResponse } from "@repo/core";

export function useMessages() {
  const store = useMessageStoreContext();
  return useStore(store, (state) => state.messages);
}

export function useShowMessage() {
  const store = useMessageStoreContext();
  return useStore(store, (state) => state.showMessage);
}

export function useShowSuccess() {
  const store = useMessageStoreContext();
  return useStore(store, (state) => state.showSuccess);
}

export function useShowError() {
  const store = useMessageStoreContext();
  return useStore(store, (state) => state.showError);
}

export function useShowNotification() {
  const store = useMessageStoreContext();
  return useStore(store, (state) => state.showNotification);
}

export function useDismissMessage() {
  const store = useMessageStoreContext();
  return useStore(store, (state) => state.dismissMessage);
}

export function useClearAllMessages() {
  const store = useMessageStoreContext();
  return useStore(store, (state) => state.clearAllMessages);
}

/**
 * Hook to integrate API responses with the message store.
 */
export function useApiMessageActions() {
  const showSuccess = useShowSuccess();
  const showError = useShowError();

  const showApiSuccess = <T>(
    response: ApiResponse<T>,
    fallbackTitle = "Başarılı",
    duration?: number
  ) => {
    // Show the backend message if available
    const msg = response.message?.trim();
    showSuccess(fallbackTitle, msg || undefined, duration);
  };

  const showApiError = (
    error: unknown,
    fallbackTitle = "Hata Oluştu",
    fallbackMessage = "İşleminiz gerçekleştirilirken bir hata oluştu.",
    duration?: number
  ) => {
    if (error instanceof ApiError) {
      // Prioritize the message from ApiError
      showError(fallbackTitle, error.message || fallbackMessage, duration);
    } else if (error instanceof Error) {
      showError(fallbackTitle, error.message || fallbackMessage, duration);
    } else {
      showError(fallbackTitle, fallbackMessage, duration);
    }
  };

  return {
    showApiSuccess,
    showApiError,
  };
}
