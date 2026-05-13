"use client";

import type { ApiError } from "@repo/core";
import { useHealth } from "@repo/domain/health";
import { useSystemActions } from "@repo/state";
import { useEffect } from "react";

function toSystemError(error: ApiError) {
  return {
    message: error.message,
    key: error.key,
    statusCode: error.statusCode,
  };
}

export function SystemStatusSync() {
  const { data, error, isLoading, isPending } = useHealth({
    retry: false,
  });
  const { setChecking, setError, setStatus } = useSystemActions();

  useEffect(() => {
    setChecking(isLoading || isPending);
  }, [isLoading, isPending, setChecking]);

  useEffect(() => {
    if (error) {
      setError(toSystemError(error));
    }
  }, [error, setError]);

  useEffect(() => {
    if (data?.data) {
      setStatus(data.data);
    }
  }, [data, setStatus]);

  return null;
}
