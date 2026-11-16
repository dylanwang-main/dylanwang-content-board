import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useGenerateYouTube() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topic }) => {
      try {
        const response = await api.functions.invoke("generateYouTubeVideo", { topic });
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
        const response = await api.functions.invoke("researchYouTubeTitle", { topic });
        return response.data?.titles || [];
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || "Could not research titles. Please try again."
        );
      }
    },
  });
}