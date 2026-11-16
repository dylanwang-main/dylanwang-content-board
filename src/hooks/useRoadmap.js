import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useBuildRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      let roadmap;

      try {
        const response = await api.functions.invoke("buildRoadmap", {});
        roadmap = response.data.roadmap;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || "Could not build your roadmap. Please try again."
        );
      }

      await api.auth.updateMe({ roadmap });

      return roadmap;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}