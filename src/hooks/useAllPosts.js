import { useMemo } from "react";
import { useInstagramMedia } from "@/hooks/useInstagram";
import { useTikTokMedia } from "@/hooks/useTikTok";
import { useYouTubeVideos } from "@/hooks/useYouTube";
import { fromInstagram, fromTikTok, fromYouTube } from "@/lib/analysis";

// Every synced post from every platform, in the one shape lib/analysis uses.
export function useAllPosts() {
  const ig = useInstagramMedia();
  const tt = useTikTokMedia();
  const yt = useYouTubeVideos();
  const posts = useMemo(
    () => [
      ...(ig.data || []).map(fromInstagram),
      ...(tt.data || []).map(fromTikTok),
      ...(yt.data || []).map(fromYouTube),
    ],
    [ig.data, tt.data, yt.data],
  );
  return { posts, isLoading: ig.isLoading || tt.isLoading || yt.isLoading };
}
