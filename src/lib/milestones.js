import { BRAIN_SECTIONS } from "@/lib/brain";

export function computeMilestones({ items, brainFiles, research, publishedThisMonth, goal }) {
  const learned = (brainFiles || []).filter((file) => file.status === "learned");
  const learnedSections = new Set(learned.map((file) => file.section));
  const published = (items || []).filter((item) => item.status === "published");
  const totalViews = published.reduce((sum, item) => sum + (item.views || 0), 0);
  const topViews = published.reduce((max, item) => Math.max(max, item.views || 0), 0);

  return [
    { label: "First file learned by the Brain", done: learned.length > 0 },
    { label: "Every Brain section trained", done: BRAIN_SECTIONS.every((section) => learnedSections.has(section.key)) },
    { label: "First research complete", done: (research || []).some((row) => row.status === "complete") },
    { label: "First piece published", done: published.length > 0 },
    { label: "10 pieces published", done: published.length >= 10 },
    { label: "First 10K-view piece", done: topViews >= 10000 },
    { label: "100K total views", done: totalViews >= 100000 },
    { label: "Monthly goal hit", done: Boolean(goal) && (publishedThisMonth || 0) >= goal },
  ];
}