// Runs a ported backend function in the browser. Each function keeps its
// original (req) => Response signature, so this builds a Request, calls it,
// and unwraps the Response the same way Base44's functions.invoke did:
// resolves { data } on success, throws an error carrying response.data on failure.
const FUNCTIONS = {
  analyzeInstagramVideo: () => import('./analyzeInstagramVideo.js'),
  analyzeTikTokVideo: () => import('./analyzeTikTokVideo.js'),
  analyzeYouTubeVideo: () => import('./analyzeYouTubeVideo.js'),
  buildRoadmap: () => import('./buildRoadmap.js'),
  detectOutliers: () => import('./detectOutliers.js'),
  dissectOutlier: () => import('./dissectOutlier.js'),
  fetchPostMetrics: () => import('./fetchPostMetrics.js'),
  generateContent: () => import('./generateContent.js'),
  generateVariations: () => import('./generateVariations.js'),
  generateYouTubeVideo: () => import('./generateYouTubeVideo.js'),
  learnBrainFile: () => import('./learnBrainFile.js'),
  researchYouTubeTitle: () => import('./researchYouTubeTitle.js'),
  runResearch: () => import('./runResearch.js'),
  scanContent: () => import('./scanContent.js'),
  syncInstagramMedia: () => import('./syncInstagramMedia.js'),
  syncTikTok: () => import('./syncTikTok.js'),
  syncYouTube: () => import('./syncYouTube.js'),
};

export function failure(status, data) {
  const message = data?.error || `Request failed (${status})`;
  return Object.assign(new Error(message), { status, response: { status, data } });
}

export async function invoke(name, payload = {}, registry = FUNCTIONS) {
  const load = registry[name];
  if (!load) throw failure(404, { error: `Unknown function "${name}"` });
  const fn = (await load()).default;
  const req = new Request(`https://app.local/functions/${name}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });
  const res = await fn(req);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw failure(res.status, data);
  return { data };
}
