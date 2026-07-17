declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    __turnstileScriptPromise?: Promise<void>;
  }
}

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

/**
 * Loads the Cloudflare Turnstile script exactly once per page, no matter how many
 * lead forms mount simultaneously (e.g. an inline form plus a modal-triggered one
 * on the same page) — each still renders its own independent widget via
 * window.turnstile.render(), but they share one script tag instead of each
 * injecting a duplicate one, which previously caused "already been loaded"
 * warnings and left whichever widget loaded second stuck waiting forever.
 *
 * The in-flight promise is stashed on `window` rather than kept in module scope:
 * this file gets bundled into more than one chunk (each import site pulls in its
 * own copy), so a plain module-level variable would give each chunk its own
 * independent singleton instead of one shared across the whole page.
 */
export function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileScriptPromise) return window.__turnstileScriptPromise;

  window.__turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile script')));
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(script);
  });

  return window.__turnstileScriptPromise;
}
