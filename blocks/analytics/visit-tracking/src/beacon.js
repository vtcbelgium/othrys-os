import { normalizePath } from './normalize.js';

/**
 * Client-side visit beacon manager.
 * Sends lightweight visit pings using fetch keepalive / sendBeacon.
 * No cookies, no localStorage, no sessionStorage.
 *
 * @param {object} options
 * @param {string} [options.url='/api/hit']
 * @param {() => string} [options.getPath]
 * @returns {{ start: () => void, stop: () => void, send: (pathOverride?: string) => void }}
 */
export function createVisitBeacon(options = {}) {
  const {
    url = '/api/hit',
    getPath,
  } = options;

  let lastSentPath = null;

  function resolveCurrentPath() {
    if (typeof getPath === 'function') {
      try {
        return getPath();
      } catch {
        return null;
      }
    }
    if (typeof window === 'undefined' || !window.location) {
      return null;
    }
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      return hash;
    }
    return window.location.pathname || '/';
  }

  function send(pathOverride) {
    try {
      const rawPath = pathOverride !== undefined ? pathOverride : resolveCurrentPath();
      const cleanPath = normalizePath(rawPath);
      if (!cleanPath) return;

      lastSentPath = cleanPath;
      const payload = JSON.stringify({ path: cleanPath });

      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
        return;
      }

      if (typeof fetch === 'function') {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
          credentials: 'omit',
        }).catch(() => {});
      }
    } catch {
      // Swallow all client beacon errors completely
    }
  }

  let listener = null;

  function start() {
    if (typeof window === 'undefined') return;
    send();
    listener = () => {
      const current = normalizePath(resolveCurrentPath());
      if (current && current !== lastSentPath) {
        send(current);
      }
    };
    window.addEventListener('hashchange', listener);
    window.addEventListener('popstate', listener);
  }

  function stop() {
    if (typeof window === 'undefined' || !listener) return;
    window.removeEventListener('hashchange', listener);
    window.removeEventListener('popstate', listener);
    listener = null;
  }

  return { start, stop, send };
}

/**
 * Auto-start helper for window load + hashchange.
 *
 * @param {object} [options]
 * @returns {() => void} Unsubscribe function
 */
export function installVisitBeacon(options = {}) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const beacon = createVisitBeacon(options);

  if (document.readyState === 'complete') {
    beacon.start();
  } else {
    const onLoad = () => {
      beacon.start();
      window.removeEventListener('load', onLoad);
    };
    window.addEventListener('load', onLoad);
  }

  return () => beacon.stop();
}
