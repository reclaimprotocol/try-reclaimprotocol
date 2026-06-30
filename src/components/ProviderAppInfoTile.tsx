import { useEffect, useState } from "react";
import { useIsLargeScreen } from "../hooks/useIsLargeScreen";
import { useBackendApiBaseUrl } from "../hooks/useEnvironment";
import { fetchApplicationInfo, fetchProviderInfo } from "../service/backend";

export const ProviderAppInfoTile = ({
  applicationId,
  providerId,
}: {
  applicationId: string;
  providerId: string;
}) => {
  const [applicationInfo, setApplicationInfo] = useState<any | null>(null);
  const [providerInfo, setProviderInfo] = useState<any | null>(null);
  const baseUrl = useBackendApiBaseUrl();

  useEffect(() => {
    fetchApplicationInfo(baseUrl, applicationId).then(setApplicationInfo);
  }, [baseUrl, applicationId]);
  useEffect(() => {
    fetchProviderInfo(baseUrl, providerId).then(setProviderInfo);
  }, [baseUrl, providerId]);

  const isLoadingApplication = !applicationInfo;
  const isLoadingProvider = !providerInfo;

  // Show loading state if either is loading
  const isLoading = isLoadingApplication || isLoadingProvider;

  const isLargeScreen = useIsLargeScreen();

  const iconSize = isLargeScreen ? "96px" : "70px";
  const gapSize = "12px";

  // Don't render if we don't have the necessary data yet and not loading
  // This prevents flickering when data is being fetched
  if (!isLoading && (!applicationInfo?.appImageUrl || !providerInfo?.logoUrl)) {
    // placeholder to avoid layout shift
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: gapSize,
        }}
      >
        <div
          style={{
            maxWidth: iconSize,
            maxHeight: iconSize,
            objectFit: "contain",
            borderRadius: "12px",
          }}
        ></div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
        gap: gapSize,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        {isLoadingProvider || !providerInfo?.logoUrl ? (
          <LoadingPlaceholder iconSize={iconSize} />
        ) : (
          <img
            src={providerInfo.logoUrl}
            alt={providerInfo.name || "Provider"}
            style={{
              width: iconSize,
              height: iconSize,
              objectFit: "cover",
              borderRadius: "12px",
            }}
            onError={(e) => {
              console.error(
                "Failed to load provider logo:",
                providerInfo.logoUrl,
              );
              // Optionally set a fallback image
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#454242ff"
      >
        <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
      </svg>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        {isLoadingApplication || !applicationInfo?.appImageUrl ? (
          <LoadingPlaceholder iconSize={iconSize} />
        ) : (
          <img
            src={applicationInfo.appImageUrl}
            alt={applicationInfo.name || "Application"}
            style={{
              width: iconSize,
              height: iconSize,
              objectFit: "cover",
              borderRadius: "12px",
            }}
            onError={(e) => {
              console.error(
                "Failed to load application image:",
                applicationInfo.appImageUrl,
              );
              // Optionally set a fallback image
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
};

function LoadingPlaceholder({ iconSize }: { iconSize: string }) {
  return (
    <div
      style={{
        width: iconSize,
        height: iconSize,
        backgroundColor: "#f0f0f0",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ opacity: 0.3 }}
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M21 15L16 10L9 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
