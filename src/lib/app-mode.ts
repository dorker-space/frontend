export type AppMode = "landing" | "example" | "app";

const LOCALHOST_MODE_KEY = "dorker.localhost.mode";
const EXAMPLE_MODE_CHANGE_EVENT = "dorker:mode-change";

export function isLocalHostname(hostname: string): boolean {
    return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]"
    );
}

/**
 * Resolves the active experience mode from the hostname or localhost query/session state:
 * - `dorker.space` -> "landing"
 * - `example.dorker.space` / `example.localhost` -> "example"
 * - `app.dorker.space` / `app.localhost` -> "app"
 * - `localhost` / `127.0.0.1` -> reads `?mode=landing|example|app` (persisting in sessionStorage),
 *   or defaults to "landing" on `/` and stored session mode on app routes.
 */
export function resolveAppMode(): AppMode {
    if (typeof window === "undefined") {
        return "landing";
    }

    const hostname = window.location.hostname.toLowerCase();

    if (
        hostname === "example.dorker.space" ||
        hostname === "example.localhost" ||
        hostname.startsWith("example.")
    ) {
        return "example";
    }

    if (
        hostname === "app.dorker.space" ||
        hostname === "app.localhost" ||
        hostname.startsWith("app.")
    ) {
        return "app";
    }

    if (hostname === "dorker.space" || hostname === "www.dorker.space") {
        return "landing";
    }

    // Localhost / 127.0.0.1 development convenience via ?mode=landing|example|app
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode")?.toLowerCase();
    if (
        modeParam === "landing" ||
        modeParam === "example" ||
        modeParam === "app"
    ) {
        try {
            window.sessionStorage.setItem(LOCALHOST_MODE_KEY, modeParam);
        } catch {
            // Ignore storage errors
        }
        return modeParam;
    }

    // Support legacy /example path by activating example mode
    if (
        window.location.pathname === "/example" ||
        window.location.pathname.startsWith("/example/")
    ) {
        try {
            window.sessionStorage.setItem(LOCALHOST_MODE_KEY, "example");
        } catch {
            // Ignore storage errors
        }
        return "example";
    }

    // On localhost, the root `/` always serves the landing page unless ?mode=example|app is explicitly passed
    if (window.location.pathname === "/") {
        return "landing";
    }

    try {
        const stored = window.sessionStorage.getItem(LOCALHOST_MODE_KEY);
        if (stored === "example" || stored === "app") {
            return stored;
        }
    } catch {
        // Ignore storage errors
    }

    return "app";
}

export function isExampleMode(): boolean {
    return resolveAppMode() === "example";
}

export function shouldUseSyntheticApi(): boolean {
    return resolveAppMode() !== "app";
}

export function setLocalhostMode(mode: AppMode): void {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(LOCALHOST_MODE_KEY, mode);
        window.dispatchEvent(new CustomEvent(EXAMPLE_MODE_CHANGE_EVENT, { detail: mode }));
    } catch {
        // Ignore storage errors
    }
}

export function onAppModeChange(callback: (mode: AppMode) => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = () => callback(resolveAppMode());
    window.addEventListener(EXAMPLE_MODE_CHANGE_EVENT, handler);
    window.addEventListener("popstate", handler);
    return () => {
        window.removeEventListener(EXAMPLE_MODE_CHANGE_EVENT, handler);
        window.removeEventListener("popstate", handler);
    };
}

export function getExampleWorkspaceUrl(path = "/matches"): string {
    if (typeof window === "undefined") {
        return `https://example.dorker.space${path}`;
    }
    const hostname = window.location.hostname.toLowerCase();
    if (isLocalHostname(hostname)) {
        const separator = path.includes("?") ? "&" : "?";
        return `${path}${separator}mode=example`;
    }
    if (hostname === "example.dorker.space" || hostname === "example.localhost") {
        return path;
    }
    return `https://example.dorker.space${path}`;
}

export function getRealAppUrl(path = "/matches"): string {
    if (typeof window === "undefined") {
        return `https://app.dorker.space${path}`;
    }
    const hostname = window.location.hostname.toLowerCase();
    if (isLocalHostname(hostname)) {
        const separator = path.includes("?") ? "&" : "?";
        return `${path}${separator}mode=app`;
    }
    if (hostname === "app.dorker.space" || hostname === "app.localhost") {
        return path;
    }
    return `https://app.dorker.space${path}`;
}

export function getLandingPageUrl(): string {
    if (typeof window === "undefined") {
        return "https://dorker.space/";
    }
    const hostname = window.location.hostname.toLowerCase();
    if (isLocalHostname(hostname)) {
        return "/?mode=landing";
    }
    if (hostname === "dorker.space" || hostname === "www.dorker.space") {
        return "/";
    }
    return "https://dorker.space/";
}
