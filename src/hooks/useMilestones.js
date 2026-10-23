import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useToggleMilestone(overrides = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ label, done }) => {
      const milestone_overrides = { ...overrides, [label]: done };
      await base44.auth.updateMe({ milestone_overrides });
      return milestone_overrides;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}