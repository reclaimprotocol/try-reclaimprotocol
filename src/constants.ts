/**
 * Central place for app configuration and constants.
 *
 * Anything you might want to change for a deployment lives here.
 *
 * Environments:
 * - The app can talk to either the production or the staging Reclaim backend.
 * - The active environment is chosen at runtime via the Expert-mode toggle and
 *   persisted in localStorage; it is read through `useActiveEnvironment()`
 *   (see `src/contexts/ExpertContext.tsx`). Because of that, the backend / portal
 *   URLs below are exposed as functions of the environment rather than as frozen
 *   constants — a frozen constant captured at import time can't react to a toggle.
 */

/** The environments the app can point at. */
export type AppEnvironment = "production" | "staging";

interface EnvConfig {
  /** Base URL of the Reclaim backend API used for this app's own fetches. */
  backendApiBaseUrl: string;
  /**
   * Value passed to the SDK's `envUrl` option (the backend the SDK talks to).
   * `undefined` => let the SDK use its built-in production default, which also
   * preserves the SDK's EU portal->backend auto-coupling.
   */
  sdkEnvUrl?: string;
  /**
   * Value passed to the SDK's `portalUrl` option (the share page).
   * `undefined` => let the SDK use its built-in default.
   */
  portalUrl?: string;
}

/** Canonical per-environment URLs. */
const ENV_CONFIG: Record<AppEnvironment, EnvConfig> = {
  production: {
    backendApiBaseUrl: "https://api.reclaimprotocol.org",
  },
  staging: {
    backendApiBaseUrl: "https://api-staging.reclaimprotocol.org",
    sdkEnvUrl: "https://api-staging.reclaimprotocol.org",
    portalUrl: "https://portal-staging.reclaimprotocol.org",
  },
};

const envConfig = (env: AppEnvironment): EnvConfig =>
  ENV_CONFIG[env] ?? ENV_CONFIG.production;

/** Base URL for this app's own backend fetches (search, provider/app info). */
export const getBackendApiBaseUrl = (env: AppEnvironment): string =>
  envConfig(env).backendApiBaseUrl;

/** Value for the SDK's `envUrl` option (`undefined` => SDK default). */
export const getReclaimEnvUrl = (env: AppEnvironment): string | undefined =>
  envConfig(env).sdkEnvUrl;

/** Value for the SDK's `portalUrl` option (`undefined` => SDK default). */
export const getReclaimPortalUrl = (env: AppEnvironment): string | undefined =>
  envConfig(env).portalUrl;

/**
 * Reclaim app credentials. In a real integration these belong on your backend;
 * this demo reads them from env so the SDK can be tried directly in the browser.
 */
export const RECLAIM_APP_ID: string = import.meta.env.VITE_RECLAIM_APP_ID || "";
export const RECLAIM_APP_SECRET: string =
  import.meta.env.VITE_RECLAIM_APP_SECRET || "";

/** Reclaim backend API endpoints. Pass the base URL for the active environment. */
export const API_ENDPOINTS = {
  application: (baseUrl: string, applicationId: string) =>
    `${baseUrl}/api/applications/info/${applicationId}`,
  provider: (baseUrl: string, providerId: string, providerVersion?: string) => {
    const url = `${baseUrl}/api/providers/${providerId}`;
    return providerVersion ? `${url}?versionNumber=${providerVersion}` : url;
  },
  searchProviders: (
    baseUrl: string,
    searchQuery: string,
    onlyVerified: boolean,
  ) => {
    const verified = onlyVerified ? "&isVerified=true" : "";
    return `${baseUrl}/api/providers/active/paginated?pageKey=0&pageSize=20&searchQuery=${encodeURIComponent(searchQuery)}${verified}`;
  },
} as const;

/** External links used throughout the demo. */
export const LINKS = {
  docs: "https://docs.reclaimprotocol.org",
  devPortal: "https://dev.reclaimprotocol.org",
  website: "https://reclaimprotocol.org",
  repo: "https://github.com/reclaimprotocol/reclaim-demo-website-v3",
} as const;

/** Browser storage keys. */
export const STORAGE_KEYS = {
  /** localStorage: persisted expert-mode settings. */
  expertSettings: "reclaim_expert_settings",
  /** sessionStorage: id of the provider selected for verification. */
  providerId: "providerId",
  /** sessionStorage: full provider info object for the selected provider. */
  savedProviderInfo: "savedProviderInfo",
  /**
   * sessionStorage: the environment the saved provider selection belongs to.
   * Provider ids/results are environment-specific, so a selection is only
   * restored while the active environment still matches this stamp.
   */
  providerEnv: "providerEnv",
} as const;
