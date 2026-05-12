import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@repo/state/query";
import { getUserProfile, updateUserProfile } from "../api/user.api";
import type { UserProfileUpdate } from "../types/user.types";
import { useAuthActions } from "@repo/state/stores/auth";

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 dakika cache
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthActions();

  return useMutation({
    mutationKey: queryKeys.user.profile(),
    mutationFn: (data: UserProfileUpdate) => updateUserProfile(data),
    onSuccess: (response) => {
      // Invalidate query to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      
      // Update global auth store user object
      if (response.data) {
        updateUser(response.data);
      }
    },
  });
};
