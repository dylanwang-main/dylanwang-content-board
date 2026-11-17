import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useYouTubeVideos() {
  return useQuery({
    queryKey: ["youtube"],
    queryFn: async () => {
      const page = await api.entities.YouTubeVideo.list({
        sort: "-published_at",
        limit: 500,
      });
      return page.items;
    },
    refetchInterval: (query) =>
      (query.state.data || []).some((item) => item.status === "analyzing") ? 5000 : false,
  });
}

export function useSyncYouTube() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ handle }) => {
      try {
        const response = await api.functions.invoke("syncYouTube", { handle });
        return response.data;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || error?.message || "YouTube sync failed. Please try again."
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube"] });
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
    },
  });
}

export function useAnalyzeYouTubeVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId) => {
      await api.entities.YouTubeVideo.update(recordId, { status: "analyzing" });
      queryClient.invalidateQueries({ queryKey: ["youtube"] });

      api.functions
        .invoke("analyzeYouTubeVideo", { video_record_id: recordId })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: ["youtube"] }));

      return recordId;
    },
  });
}

export function useYouTubeStats(videos = []) {
  return {
    videos: videos.length,
    views: videos.reduce((sum, video) => sum + (video.view_count || 0), 0),
    likes: videos.reduce((sum, video) => sum + (video.like_count || 0), 0),
  };
}