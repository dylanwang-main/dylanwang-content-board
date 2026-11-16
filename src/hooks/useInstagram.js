import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useInstagramMedia() {
  return useQuery({
    queryKey: ["instagram"],
    queryFn: async () => {
      const page = await api.entities.InstagramMedia.list({
        sort: "-timestamp",
        limit: 500,
      });
      return page.items;
    },
    refetchInterval: (query) =>
      (query.state.data || []).some((item) => item.status === "analyzing") ? 5000 : false,
  });
}

export function useSyncInstagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.functions.invoke("syncInstagramMedia", {});
        return response.data;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || error?.message || "Instagram sync failed. Please try again."
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram"] });
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
    },
  });
}

export function useAnalyzeInstagramMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId) => {
      await api.entities.InstagramMedia.update(mediaId, { status: "analyzing" });
      queryClient.invalidateQueries({ queryKey: ["instagram"] });

      api.functions
        .invoke("analyzeInstagramVideo", { media_id: mediaId })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: ["instagram"] }));

      return mediaId;
    },
  });
}

export function useDeleteInstagramMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.entities.InstagramMedia.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instagram"] }),
  });
}