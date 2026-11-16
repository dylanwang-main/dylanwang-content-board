import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useTikTokMedia() {
  return useQuery({
    queryKey: ["tiktok"],
    queryFn: async () => {
      const page = await api.entities.TikTokMedia.list({
        sort: "-create_time",
        limit: 500,
      });
      return page.items;
    },
    refetchInterval: (query) =>
      (query.state.data || []).some((item) => item.status === "analyzing") ? 5000 : false,
  });
}

export function useSyncTikTok() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.functions.invoke("syncTikTok", {});
        return response.data;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || error?.message || "TikTok sync failed. Please try again."
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiktok"] });
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
    },
  });
}

export function useAnalyzeTikTokMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId) => {
      await api.entities.TikTokMedia.update(mediaId, { status: "analyzing" });
      queryClient.invalidateQueries({ queryKey: ["tiktok"] });

      api.functions
        .invoke("analyzeTikTokVideo", { media_id: mediaId })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: ["tiktok"] }));

      return mediaId;
    },
  });
}

export function useDeleteTikTokMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.entities.TikTokMedia.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tiktok"] }),
  });
}