// Read-only Google sign-in for YouTube, using Google Identity Services'
// token flow. The browser gets a short-lived access token (about an hour) with
// the youtube.readonly scope; no client secret and no server involved. With it,
// the sync can see the owner's unlisted and private uploads, which an API key
// never can.
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';
const STORE = 'cc.youtubeToken';

export const googleClientId = () => import.meta.env?.VITE_GOOGLE_CLIENT_ID || '';

let gisPromise;
function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  gisPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      gisPromise = null;
      reject(new Error('Could not load Google sign-in.'));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

// Token is kept for this browser tab session only.
export function getYouTubeAccessToken() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (saved && saved.expiresAt > Date.now() + 60_000) return saved.token;
  } catch {
    // ignore
  }
  return '';
}

function saveToken(token, expiresInSec) {
  try {
    if (token) sessionStorage.setItem(STORE, JSON.stringify({ token, expiresAt: Date.now() + expiresInSec * 1000 }));
    else sessionStorage.removeItem(STORE);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('cc-keys-changed'));
}

export async function connectYouTubeAccount() {
  const clientId = googleClientId();
  if (!clientId) throw new Error('Google sign-in is not set up for this app yet (missing VITE_GOOGLE_CLIENT_ID).');
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (res) => {
        if (res.error) return reject(new Error(res.error_description || 'Google sign-in was cancelled.'));
        saveToken(res.access_token, Number(res.expires_in) || 3600);
        resolve(res.access_token);
      },
      error_callback: (err) => reject(new Error(err?.message || 'Google sign-in was cancelled.')),
    });
    client.requestAccessToken();
  });
}

export function disconnectYouTubeAccount() {
  const token = getYouTubeAccessToken();
  if (token && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(token, () => {});
  saveToken('', 0);
}
