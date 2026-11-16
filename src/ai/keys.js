// API keys the visitor pastes in Settings. They live only in this browser's
// localStorage and are sent straight to the provider (Anthropic / Google),
// never to this app's servers or database.
const KEYS = {
  anthropic: 'cc.anthropicKey',
  youtube: 'cc.youtubeKey',
};

function read(name) {
  try {
    return localStorage.getItem(KEYS[name]) || '';
  } catch {
    return '';
  }
}

function write(name, value) {
  try {
    if (value) localStorage.setItem(KEYS[name], value.trim());
    else localStorage.removeItem(KEYS[name]);
  } catch {
    // Storage blocked (private mode, etc.): the app stays in demo mode.
  }
  window.dispatchEvent(new Event('cc-keys-changed'));
}

export const getAnthropicKey = () => read('anthropic');
export const setAnthropicKey = (v) => write('anthropic', v);
export const getYouTubeKey = () => read('youtube');
export const setYouTubeKey = (v) => write('youtube', v);
export const isDemoMode = () => !getAnthropicKey();
