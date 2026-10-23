import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useBuildRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      let roadmap;

      try {
        const response = await base44.functions.invoke("buildRoadmap", {});
        roadmap = response.data.roadmap;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || "Could not build your roadmap. Please try again."
        );
      }

      await base44.auth.updateMe({ roadmap });

      return roadmap;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}