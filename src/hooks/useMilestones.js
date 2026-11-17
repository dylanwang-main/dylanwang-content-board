import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useToggleMilestone(overrides = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ label, done }) => {
      const milestone_overrides = { ...overrides, [label]: done };
      await api.auth.updateMe({ milestone_overrides });
      return milestone_overrides;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}