import { useState } from "react";
import { YourBackendUsingReclaim } from "../../service/reclaim";
import { useNavigate } from "react-router";
import { showSnackbar } from "../Snackbar";
import { useExpertContext } from "../../contexts/ExpertContext";
import { useActiveEnvironment } from "../../hooks/useEnvironment";

export interface StartVerificationButtonProps {
  providerId: string;
}

export default function StartVerificationButton({
  providerId,
}: StartVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { settings } = useExpertContext();
  const environment = useActiveEnvironment();

  const startVerification = async (providerId: string) => {
    try {
      if (!providerId) {
        showSnackbar("Search for a provider to start verifying");
        return;
      }

      // To start verifications in frontend, you should create verification requests at backend and
      // send the reclaim json string to frontend
      const request = await (settings?.isExpertModeEnabled
        ? // This uses advanced options to create a request.
          // You don't need this if you're new to Reclaim and just trying it out.
          YourBackendUsingReclaim.createVerificationRequestAsExpert(
            providerId,
            settings,
          )
        : // This is the simple way to create a request.
          // If you are a beginner with Reclaim, we recommend using this.
          YourBackendUsingReclaim.createVerificationRequest(
            providerId,
            environment,
          ));

      // For this example, we're navigating to a different page with this request to start verification journey
      // You don't have to do this base64 or url encoding at all. We did it just for putting this in query params.
      const encodedRequest = btoa(request);

      // Navigating to /verify page with the request
      // You should check that page to understand how to re-create reclaim verification request
      navigate(`/verify?request=${encodeURIComponent(encodedRequest)}`);
    } catch (error) {
      console.error(error);
      showSnackbar(
        `Could not request verification because ${typeof error === "object" && error && "message" in error ? error.message : error}`,
      );
    }
  };

  return (
    <button
      className="btn-primary"
      disabled={isLoading}
      onClick={async () => {
        if (isLoading) return;
        setIsLoading(true);
        await startVerification(providerId);
        setIsLoading(false);
      }}
    >
      {isLoading ? "Starting Verification..." : "Start Verification"}
    </button>
  );
}
