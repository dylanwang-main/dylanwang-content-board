import { BookHeart, Fingerprint, LibraryBig, Presentation, ShieldBan, Tag, Target } from "lucide-react";

export const BRAIN_SECTIONS = [
  {
    key: "brand",
    label: "Brand",
    icon: Fingerprint,
    description: "Brand guides, voice docs, visual identity, positioning.",
  },
  {
    key: "offer",
    label: "Offer",
    icon: Tag,
    description: "What you sell — pricing, packages, sales pages, guarantees.",
  },
  {
    key: "ideal_client",
    label: "Ideal client",
    icon: Target,
    description: "Avatar docs, survey results, pains, desires and objections.",
  },
  {
    key: "story",
    label: "Your story",
    icon: BookHeart,
    description: "Origin story, milestones, beliefs and personal anecdotes.",
  },
  {
    key: "teaching",
    label: "Teaching material",
    icon: Presentation,
    description: "Frameworks, methods, workshops and notes you teach from.",
  },
  {
    key: "course_modules",
    label: "Course modules",
    icon: LibraryBig,
    description: "Curriculum outlines, lesson scripts and module breakdowns.",
  },
  {
    key: "constraints",
    label: "Hard constraints",
    icon: ShieldBan,
    description: "Non-negotiables — words to avoid, claims never to make, rules.",
  },
];

export const BRAIN_ACCEPT = ".pdf,.txt,.md,.csv,.png,.jpg,.jpeg,.webp";

export const BRAIN_MAX_BYTES = 20 * 1024 * 1024;