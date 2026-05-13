import type { QueryClient } from "@tanstack/react-query";

import type { AiActionType } from "../types/ai-actions.types";

import { getAiActionInvalidationQueryKeys } from "../query-keys";

export async function invalidateAiActionQueries(
  queryClient: QueryClient,
  actionType: AiActionType,
): Promise<void> {
  const targets = getAiActionInvalidationQueryKeys(actionType);

  await Promise.all(
    targets.map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey,
      }),
    ),
  );
}
