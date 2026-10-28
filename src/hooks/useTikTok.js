import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useTikTokMedia() {
  return useQuery({
    queryKey: ["tiktok"],
    queryFn: async () => {
      const page = await base44.entities.TikTokMedia.list({
        sort: "-create_time",
        limit: 200,
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
        const response = await base44.functions.invoke("syncTikTok", {});
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
      await base44.entities.TikTokMedia.update(mediaId, { status: "analyzing" });
      queryClient.invalidateQueries({ queryKey: ["tiktok"] });

      base44.functions
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
    mutationFn: (id) => base44.entities.TikTokMedia.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tiktok"] }),
  });
}