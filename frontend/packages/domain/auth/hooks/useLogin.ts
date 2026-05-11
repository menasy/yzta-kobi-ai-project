"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../api/auth.api";
import type { LoginRequest, LoginResponse } from "../types/auth.types";

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse, variables: LoginRequest) => void;
  onError?: (error: ApiError, variables: LoginRequest) => void;
  onSettled?: (
    data: LoginResponse | undefined,
    error: ApiError | null,
    variables: LoginRequest,
  ) => void;
}

export function useLogin(options: UseLoginOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationKey: [...queryKeys.auth.all, "login"] as const,
    mutationFn: login,
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options.onError?.(error, variables);
    },
    onSettled: (data, error, variables) => {
      options.onSettled?.(data, error ?? null, variables);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
