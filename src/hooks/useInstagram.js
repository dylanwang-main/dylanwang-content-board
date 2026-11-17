import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";
import { fetchMediaInsights, instagramToken } from "@/lib/instagram";
import { isReel } from "@/lib/mediaFilters";

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

// Full stats for one post, fetched when its detail view opens. The headline
// numbers are saved back so cards and sorting pick them up.
export function useMediaInsights(item) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["instagram-insights", item?.ig_id],
    enabled: Boolean(item?.ig_id),
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const me = await api.auth.me();
      const token = await instagramToken(me, (data) => api.auth.updateMe(data));
      if (!token) throw new Error("Instagram is not connected.");
      const stats = await fetchMediaInsights({
        token,
        igUserId: me.instagram_user_id,
        mediaId: item.ig_id,
        reel: isReel(item),
      });
      const patch = {};
      if (stats.views != null) patch.view_count = stats.views;
      if (stats.shares != null) patch.shares_count = stats.shares;
      if (stats.saved != null) patch.saved_count = stats.saved;
      if (Object.keys(patch).length) {
        await api.entities.InstagramMedia.update(item.id, patch).catch(() => {});
        queryClient.invalidateQueries({ queryKey: ["instagram"] });
      }
      return stats;
    },
  });
}
