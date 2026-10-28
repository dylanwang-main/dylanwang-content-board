import { useMemo } from "react";
import { useInstagramMedia } from "@/hooks/useInstagram";
import { useOutliers } from "@/hooks/useOutliers";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useTikTokMedia } from "@/hooks/useTikTok";
import { useYouTubeVideos } from "@/hooks/useYouTube";
import { buildSeries, channelRate, inRange, normalizePosts } from "@/lib/channels";

const CHANNELS = ["Instagram", "TikTok", "YouTube"];

export function useChannelMetrics(days) {
  const instagram = useInstagramMedia();
  const tiktok = useTikTokMedia();
  const youtube = useYouTubeVideos();
  const socialAccounts = useSocialAccounts();
  const outlierQuery = useOutliers();

  const instagramList = instagram.data || [];
  const tiktokList = tiktok.data || [];
  const youtubeList = youtube.data || [];
  const outlierList = outlierQuery.data || [];

  return useMemo(() => {
    const posts = normalizePosts(instagramList, tiktokList, youtubeList).filter((post) =>
      inRange(post.date, days)
    );

    const withViews = posts.filter((post) => post.views !== null);
    const views = withViews.reduce((sum, post) => sum + (post.views || 0), 0);
    const likes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const comments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);

    const rate = channelRate(
      withViews.reduce((sum, post) => sum + post.likes, 0),
      withViews.reduce((sum, post) => sum + post.comments, 0),
      withViews.reduce((sum, post) => sum + post.shares, 0),
      views
    );

    const byChannel = CHANNELS.map((name) => {
      const channelPosts = posts.filter((post) => post.platform === name);
      const channelViews = channelPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      const channelLikes = channelPosts.reduce((sum, post) => sum + post.likes, 0);
      const channelComments = channelPosts.reduce((sum, post) => sum + post.comments, 0);
      const channelShares = channelPosts.reduce((sum, post) => sum + post.shares, 0);

      return {
        platform: name,
        posts: channelPosts.length,
        views: channelViews,
        likes: channelLikes,
        comments: channelComments,
        shares: channelShares,
        rate: channelRate(channelLikes, channelComments, channelShares, channelViews),
      };
    });

    const topPosts = [...posts]
      .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
      .slice(0, 5);

    const instagramPosts = posts.filter((post) => post.platform === "Instagram");
    const instagramLikes = instagramPosts.reduce((sum, post) => sum + post.likes, 0);
    const instagramComments = instagramPosts.reduce((sum, post) => sum + post.comments, 0);
    const instagramBest = [...instagramPosts].sort(
      (a, b) => b.likes + b.comments - (a.likes + a.comments)
    )[0];

    const outliers = [...outlierList]
      .sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))
      .slice(0, 3);

    return {
      loading: instagram.isLoading || tiktok.isLoading || youtube.isLoading,
      posts,
      views,
      likes,
      comments,
      rate,
      series: buildSeries(withViews, days),
      byChannel,
      topPosts,
      instagram: {
        posts: instagramPosts.length,
        avgLikes: instagramPosts.length ? instagramLikes / instagramPosts.length : 0,
        avgComments: instagramPosts.length ? instagramComments / instagramPosts.length : 0,
        best: instagramBest || null,
      },
      outliers,
      accounts: socialAccounts.data || [],
    };
  }, [instagramList, tiktokList, youtubeList, outlierList, days, instagram.isLoading, tiktok.isLoading, youtube.isLoading]);
}