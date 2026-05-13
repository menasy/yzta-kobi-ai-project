"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation } from "@tanstack/react-query";

import { register as registerUser } from "../api/auth.api";
import type { RegisterRequest, RegisterResponse } from "../types/auth.types";

interface UseRegisterOptions {
  onSuccess?: (data: RegisterResponse, variables: RegisterRequest) => void;
  onError?: (error: ApiError, variables: RegisterRequest) => void;
  onSettled?: (
    data: RegisterResponse | undefined,
    error: ApiError | null,
    variables: RegisterRequest,
  ) => void;
}

export function useRegister(options: UseRegisterOptions = {}) {
  const mutation = useMutation<RegisterResponse, ApiError, RegisterRequest>({
    mutationKey: [...queryKeys.auth.all, "register"] as const,
    mutationFn: registerUser,
    onSuccess: (data, variables) => {
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
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
