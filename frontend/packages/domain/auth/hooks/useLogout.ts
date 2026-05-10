"use client";

import type { ApiError } from "@repo/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../state/query/keys";
import { logout } from "../api/auth.api";
import type { LogoutResponse } from "../types/auth.types";

interface UseLogoutOptions {
  onSuccess?: (data: LogoutResponse) => void;
  onError?: (error: ApiError) => void;
  onSettled?: (data: LogoutResponse | undefined, error: ApiError | null) => void;
}

export function useLogout(options: UseLogoutOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<LogoutResponse, ApiError, void>({
    mutationKey: [...queryKeys.auth.all, "logout"] as const,
    mutationFn: logout,
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
    onSettled: (data, error) => {
      options.onSettled?.(data, error ?? null);
    },
  });

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
