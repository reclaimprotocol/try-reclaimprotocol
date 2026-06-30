import { useEffect } from "react";
import { useActiveEnvironment } from "../hooks/useEnvironment";
import { getBackendApiBaseUrl } from "../constants";

/**
 * App-wide visual indicator shown only when the app is pointed at staging.
 *
 * Renders a fixed amber warning banner at the top and a thin amber frame around
 * the viewport, and toggles a `staging-active` class on <body> that nudges the
 * (absolutely positioned) navbar / page padding down to clear the banner.
 *
 * Returns null in production, so it has no effect for public visitors.
 */
export const StagingChrome = () => {
  const environment = useActiveEnvironment();
  const isStaging = environment === "staging";

  useEffect(() => {
    document.body.classList.toggle("staging-active", isStaging);
    return () => {
      document.body.classList.remove("staging-active");
    };
  }, [isStaging]);

  if (!isStaging) return null;

  let host = "";
  try {
    host = new URL(getBackendApiBaseUrl(environment)).host;
  } catch {
    // ignore malformed URL — banner still shows the env name
  }

  return (
    <>
      <div className="staging-banner" role="status">
        <span aria-hidden="true">⚠</span>
        <span>Staging{host ? ` · ${host}` : ""}</span>
      </div>
      <div className="staging-frame" aria-hidden="true" />
    </>
  );
};
