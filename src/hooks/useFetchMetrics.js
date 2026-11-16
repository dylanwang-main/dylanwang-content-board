import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useFetchMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, contentId }) => {
      try {
        const response = await api.functions.invoke("fetchPostMetrics", {
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