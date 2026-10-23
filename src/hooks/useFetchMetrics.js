import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useFetchMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, contentId }) => {
      try {
        const response = await base44.functions.invoke("fetchPostMetrics", {
          url,
          content_id: contentId,
        });
        return response.data.metrics;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || "Could not fetch analytics. Please try again."
        );
      }
    },
    onSuccess: (_metrics, variables) => {
      if (variables?.contentId) queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}