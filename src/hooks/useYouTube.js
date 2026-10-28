import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useYouTubeVideos() {
  return useQuery({
    queryKey: ["youtube"],
    queryFn: async () => {
      const page = await base44.entities.YouTubeVideo.list({
        sort: "-published_at",
        limit: 200,
      });
      return page.items;
    },
  });
}

export function useSyncYouTube() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ handle }) => {
      try {
        const response = await base44.functions.invoke("syncYouTube", { handle });
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

export function useYouTubeStats(videos = []) {
  return {
    videos: videos.length,
    views: videos.reduce((sum, video) => sum + (video.view_count || 0), 0),
    likes: videos.reduce((sum, video) => sum + (video.like_count || 0), 0),
  };
}