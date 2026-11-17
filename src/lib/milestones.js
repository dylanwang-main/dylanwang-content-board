import { BRAIN_SECTIONS } from "./brain.js";

// Publishing and view milestones count synced YouTube videos as well as posts
// logged in the library. Library posts marked YouTube are skipped when videos
// are synced, so the same video isn't counted twice.
export function computeMilestones({ items, videos = [], brainFiles, research, publishedThisMonth, goal }) {
  const learned = (brainFiles || []).filter((file) => file.status === "learned");
  const learnedSections = new Set(learned.map((file) => file.section));
  const published = (items || []).filter((item) => item.status === "published");
  const libraryPosts = videos.length
    ? published.filter((item) => (item.platform || "").toLowerCase() !== "youtube")
    : published;

  const views = [
    ...libraryPosts.map((item) => Number(item.views) || 0),
    ...videos.map((video) => Number(video.view_count) || 0),
  ];
  const postCount = views.length;
  const totalViews = views.reduce((sum, v) => sum + v, 0);
  const topViews = views.reduce((max, v) => Math.max(max, v), 0);

  return [
    { label: "First file learned by the Brain", done: learned.length > 0 },
    { label: "Every Brain section trained", done: BRAIN_SECTIONS.every((section) => learnedSections.has(section.key)) },
    { label: "First research complete", done: (research || []).some((row) => row.status === "complete") },
    { label: "First piece published", done: postCount > 0 },
    { label: "10 pieces published", done: postCount >= 10 },
    { label: "First 10K-view piece", done: topViews >= 10000 },
    { label: "100K total views", done: totalViews >= 100000 },
    { label: "Monthly goal hit", done: Boolean(goal) && (publishedThisMonth || 0) >= goal },
  ];
}
