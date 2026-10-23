export const SECTION_LABELS = {
  brand: "Brand",
  offer: "Offer",
  ideal_client: "Ideal client",
  story: "Your story",
  teaching: "Teaching material",
  course_modules: "Course modules",
  constraints: "Hard constraints",
};

const pageItems = (result) => (Array.isArray(result) ? result : result?.items || []);

const list = (arr) => (Array.isArray(arr) ? arr : []).map((item) => `- ${item}`).join("\n");

export function buildBrain(files, brand) {
  const blocks = [];

  if (brand) {
    blocks.push(
      [
        "## Brand profile",
        `Name: ${brand.name || "-"}`,
        `Tagline: ${brand.tagline || "-"}`,
        `Niche: ${brand.niche || "-"}`,
        `Audience: ${brand.audience || "-"}`,
        `Voice: ${brand.voice || "-"}`,
        `Bio: ${brand.bio || "-"}`,
        `Pillars: ${(brand.pillars || []).join(", ") || "-"}`,
      ].join("\n")
    );
  }

  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    const sectionFiles = (files || []).filter((f) => f.section === key);
    if (!sectionFiles.length) continue;

    const rendered = sectionFiles.map((f) => {
      const lines = [`### ${f.file_name}`, `${f.summary || ""}`];
      for (const point of f.key_points || []) lines.push(`- ${point}`);
      return lines.join("\n");
    });

    blocks.push([`## ${label}`, rendered.join("\n\n")].join("\n"));
  }

  return blocks.join("\n\n").slice(0, 40000);
}

const avatarText = (a, label) => {
  if (!a) return "";
  return [
    `### ${label}: ${a.name}`,
    `${a.description || ""}`,
    `Primary desire: ${a.primary_desire}`,
    `Defining experience: ${a.defining_experience}`,
    "Main problems:",
    list(a.main_problems),
  ].join("\n");
};

export function formatResearch(r) {
  if (!r) return "";

  const cr = r.customer_research || {};

  const common = (cr.commonalities || [])
    .map((c) => `- ${c.theme} (${c.percentage}%): ${c.detail}`)
    .join("\n");

  const angles = (r.angles || [])
    .map((a) => `${a.rank}. ${a.title} [strength ${a.strength}/100, for ${a.avatar}] — ${a.hook_idea}`)
    .join("\n");

  const text = [
    `## Customer research (from ${r.source_type === "competitor" ? "competitor" : "own"} ${r.platform} page: ${r.source})`,
    `${cr.summary || ""}`,
    "What the audience has in common:",
    common,
    "Pains:",
    list(cr.pains),
    "Desires:",
    list(cr.desires),
    "Objections:",
    list(cr.objections),
    "Audience language:",
    list(cr.language),
    "",
    "## Avatars",
    avatarText(r.core_avatar, "Core avatar"),
    "",
    (r.sub_avatars || []).map((a, i) => avatarText(a, `Sub avatar ${i + 1}`)).join("\n\n"),
    "",
    "## Ranked angles (strongest first)",
    angles,
  ].join("\n");

  return text.slice(0, 20000);
}

export async function loadCreatorBrain(base44, userId) {
  const [filesPage, brandPage] = await Promise.all([
    base44.entities.BrainFile.filter(
      { status: "learned", created_by_id: userId },
      { sort: "-created_date", limit: 100 }
    ),
    base44.entities.Brand.filter({ created_by_id: userId }, { sort: "-created_date", limit: 1 }),
  ]);

  const files = pageItems(filesPage);
  const brand = pageItems(brandPage)[0] || null;

  if (!files.length && !brand) return null;

  const researchPage = await base44.entities.Research.filter(
    { status: "complete", created_by_id: userId },
    { sort: "-created_date", limit: 1 }
  );
  const research = pageItems(researchPage)[0] || null;

  return [buildBrain(files, brand), formatResearch(research)].filter(Boolean).join("\n\n");
}