import {
  getBackendApiBaseUrl,
  type AppEnvironment,
} from "../constants";
import { useSelectFromExpertSettings } from "../contexts/ExpertContext";

/**
 * The environment the app currently points at.
 *
 * Read through `useSelectFromExpertSettings`, so it resolves to "production"
 * whenever Expert mode is off — this is what keeps staging gated behind Expert
 * mode for public visitors.
 */
export function useActiveEnvironment(): AppEnvironment {
  return useSelectFromExpertSettings((settings) => settings.environment);
}

/** Base URL for this app's own backend fetches, for the active environment. */
export function useBackendApiBaseUrl(): string {
  return getBackendApiBaseUrl(useActiveEnvironment());
}
