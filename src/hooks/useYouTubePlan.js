import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useGenerateYouTube() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topic }) => {
      try {
        const response = await base44.functions.invoke("generateYouTubeVideo", { topic });
        return response.data;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error ||
            "Could not build your video plan. Please try again."
        );
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}

export function useResearchYouTubeTitle() {
  return useMutation({
    mutationFn: async ({ topic }) => {
      try {
        const response = await base44.functions.invoke("researchYouTubeTitle", { topic });
        return response.data?.titles || [];
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || "Could not research titles. Please try again."
        );
      }
    },
  });
}