import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@repo/state/query";
import { getUserAddress, upsertUserAddress } from "../api/user.api";
import type { UserAddressUpsert } from "../types/user.types";

export const useUserAddress = () => {
  return useQuery({
    queryKey: queryKeys.user.address(),
    queryFn: getUserAddress,
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: (failureCount, error: any) => {
      // 404 ise retry yapma, yeni kullanıcıların adresi olmayabilir.
      if (error?.response?.status === 404 || error?.statusCode === 404 || error?.key === "NOT_FOUND") {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUpsertUserAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.user.address(),
    mutationFn: (data: UserAddressUpsert) => upsertUserAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.address() });
    },
  });
};
