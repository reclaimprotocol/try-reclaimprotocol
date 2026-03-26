import { useSearchParams } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { YourBackendUsingReclaim } from "../../service/reclaim";
import { ReclaimProofRequest, type FlowHandle, type Proof } from "@reclaimprotocol/js-sdk";
import { showSnackbar } from "../../components/Snackbar";
import { getErrorMessage } from "../../utils/error_message";
import ResultsView from "../../components/results/Results";
import { SessionIdLabel } from "../../components/SessionIdLabel";
import { ProviderAppInfoTile } from "../../components/ProviderAppInfoTile";
import { useLiveBackground } from "../../components/LiveBackground";
import WordLogo from "../../components/logo/WordLogo";
import { useSelectFromExpertSettings } from "../../contexts/ExpertContext";
import { Dialog } from "../../components/Dialog";

type VerificationStatus = "starting" | "verifying" | "completed" | "error";

function Page() {
  const [status, setStatus] = useState<VerificationStatus>("starting");
  const { setStatus: setStatusLiveBackground } = useLiveBackground();

  const [search] = useSearchParams();
  // Retreiving the base 64 encoded string
  const encodedRequest = search.get("request");

  const [proofRequest, setProofRequest] = useState<ReclaimProofRequest | null>(
    null,
  );
  // for copying
  const [verificationLink, setVerificationLink] = useState<string>("");
  const [proof, setProof] = useState<Proof[] | null>(null);
  const [applicationId, setApplicationId] = useState<string>("");
  const [providerId, setProviderId] = useState<string>("");
  const [flowHandle, setFlowHandle] = useState<FlowHandle | undefined>();

  // Ignore this section of the code, it's just for demo purposes.
  // ==== IGNORE START ====
  const launchMethod = useSelectFromExpertSettings(
    (settings) => settings.launchMethod,
  );

  useEffect(() => {
    setStatusLiveBackground(proof ? "success" : "loading");
  }, [proof, setStatusLiveBackground]);
  // ==== IGNORE END ====

  /**
   * You can use this on your frontend to create ReclaimProofRequest with a JSON string of proof request received
   * from backend.
   *
   * @param requestJsonString - The JSON string representation of a ReclaimProofRequest
   * @returns
   */
  const restoreVerificationRequest = async (requestJsonString: string) => {
    const proofRequest =
      await ReclaimProofRequest.fromJsonString(requestJsonString);

    return proofRequest;
  };

  useEffect(() => {
    if (!encodedRequest) return;
    // converting the base64 string back to utf8 json string
    const requestJsonString = atob(encodedRequest);

    // Using the json string to make ReclaimProofRequest with ReclaimProofRequest.fromJsonString
    restoreVerificationRequest(requestJsonString)
      .then(setProofRequest)
      .catch((error) => {
        console.error(error);
        showSnackbar(
          `Could not request verification because ${getErrorMessage(error)}`,
        );
      });
  }, [encodedRequest]);

  // Simply calling this function will cause reclaim to trigger
  // the appropriate Reclaim verification flow based on device type and configuration
  const launchReclaimFlow = useCallback(
    async (proofRequest: ReclaimProofRequest): Promise<void> => {
      if (proof) return;

      switch (launchMethod) {
        case "js-sdk.portal":
          proofRequest.triggerReclaimFlow({
            verificationMode: 'portal',
          }).then(setFlowHandle).catch((error) => {
            console.error("Failed to trigger reclaim flow", error);
            setStatus("error");
          });
          break;
        case "js-sdk.app":
          proofRequest.triggerReclaimFlow({
            verificationMode: 'app',
          }).then(setFlowHandle).catch((error) => {
            console.error("Failed to trigger reclaim flow", error);
            setStatus("error");
          });
          break;
        case "windowopen":
          proofRequest
            .getRequestUrl()
            .then((url) => {
              setVerificationLink(url);
              window.open(url, "_blank");
            })
            .catch((error) => {
              console.error("Failed to trigger reclaim flow", error);
              setStatus("error");
            });
          break;
        default:
          break;
      }
    },
    [launchMethod, proof],
  );

  const closeFlowHandle = () => {
    try {
      flowHandle?.close();
    } catch (error) {
      console.error('Failed to close flow with handle', error);
    }
  }

  const startVerificationJourney = useCallback(
    async (proofRequest: ReclaimProofRequest): Promise<void> => {
      if (proof) return;

      if (launchMethod == "js-sdk.portal" || launchMethod == "js-sdk.app" || launchMethod == "windowopen") {
        launchReclaimFlow(proofRequest);
      }

      // If you are not using a custom callback, then you can use this function on your frontend
      // to receive proofs (or fatal error) when verification is completed
      //
      // Incase of custom callbacks, you'll get your proof sent as HTTP POST request to the callback URL.
      proofRequest
        .startSession({
          // When proof is provided by this SDK callback here, it is already verified.
          // As best practise, you MUST verify it again using `verifyProof` from `import { verifyProof } from "@reclaimprotocol/js-sdk"`
          onSuccess: async (proof) => {
            console.info({ proof });
            closeFlowHandle();

            if (!proof) {
              // likely a type issue, shouldn't happen
              showSnackbar(`Verification returned unexpected result`);
              return;
            }

            // As best practise, you MUST validate the fields in the proof to make sure that
            // this is the proof you expected.
            //
            // As an example, validation can be done by checking request url, headers,
            // method, proven fields (aka extracted params), etc.
            showSnackbar(`Verifying result`);

            try {
              if (typeof proof === 'string' || (Array.isArray(proof) && proof.length == 0)) {
                // Proof submitted to callback. If this string or empty array, then proof was submitted to callback, not reclaim.
                // If its string, then it will just be a success message
                showSnackbar(`Verification data sent to callback`);
                setProof([]);

                setStatus("completed");
                setStatusLiveBackground("success");
                return;
              }

              const trustableProof =
                await YourBackendUsingReclaim.processProof(proof, proofRequest.getProviderVersion());
              showSnackbar(`Verification completed successfully`);
              setProof(trustableProof);

              setStatus("completed");
              setStatusLiveBackground("success");
            } catch (error) {
              console.error(error);
              showSnackbar(
                `Something went wrong because ${getErrorMessage(error)}`,
              );

              setStatus("error");
              setStatusLiveBackground("error");
            }
          },
          onError: (error) => {
            // Well, I know this is an error and we should show this in UI and stop verification..
            // But users can retry verification. We can assume this
            // verification has 'failed' if you don't receive a proof after ~10 mins
            // of starting verification.
            console.error(error);
            showSnackbar(
              `Something went wrong because ${getErrorMessage(error)}`,
            );
            closeFlowHandle();
          },
        })
        .catch((error) => {
          console.error("Failed to get session information", error);
          setStatus("error");
          showSnackbar(
            `Something went wrong because ${getErrorMessage(error)}`,
          );
        });

      // You can do this when you don't want to use proofRequest.triggerReclaimFlow(),
      // and want to launch verification in other *custom* ways, like letting your user scan a QR code
      // or launching this link in a browser.
      proofRequest
        .getRequestUrl()
        .then(setVerificationLink)
        .catch((error) => {
          console.error("Failed to get verification link", error);
          setStatus("error");
        });

      setStatus("verifying");
    },
    [launchMethod, launchReclaimFlow, setStatusLiveBackground, proof],
  );

  useEffect(() => {
    if (!proofRequest) return;

    // We can start verification journey for user
    // with a ReclaimProofRequest object.
    startVerificationJourney(proofRequest).catch((error) => {
      console.error(error);
      showSnackbar(
        `Could not request verification because ${getErrorMessage(error)}`,
      );
    });

    // Ignore this section of the code, it's just for demo purposes.
    // ==== IGNORE START ====
    if ("applicationId" in proofRequest) {
      setApplicationId((proofRequest as any).applicationId);
    }
    if ("providerId" in proofRequest) {
      setProviderId((proofRequest as any).providerId);
    }
    // ==== IGNORE END ====
  }, [proofRequest, startVerificationJourney]);

  return (
    <div className="container">
      <WordLogo />

      {/* Ignore this section, just for demo decoration */}
      {/* ==== IGNORE START ==== */}
      <ProviderAppInfoTile
        applicationId={applicationId}
        providerId={providerId}
      />
      {/* ==== IGNORE END ==== */}

      {/* You can use session id using `proofRequest.getSessionId()`. You can store it in the DB, or pass it as a query param
      in callback url to identify reclaim sessions. */}
      <SessionIdLabel
        sessionId={proofRequest ? proofRequest.getSessionId() : "..."}
      />

      {/* Ignore this section, just for demo decoration */}
      {/* ==== IGNORE START ==== */}
      {proof ? undefined : <StatusMessage status={status} />}

      <VerificationActions
        hasProof={!!proof}
        verificationLink={verificationLink}
        onLaunch={() => proofRequest && launchReclaimFlow(proofRequest)}
        proofRequest={proofRequest}
      />
      {/* ==== IGNORE END ==== */}

      {/* Check code of this component to understand how to get data from proof */}
      <ResultsView className="mb-6" proof={proof} />

      {/* Terms and conditions apply */}
      <p className="disclaimer">
        Proofs generated by Reclaim Protocol are secure and private.{" "}
        <a
          href="https://docs.reclaimprotocol.org"
          className="link"
          target="_blank"
          rel="noreferrer"
        >
          Learn More
        </a>
      </p>
    </div>
  );
}

const StatusMessage = ({ status }: { status: VerificationStatus }) => {
  return (
    <p className="status-text mt-2 shimmer">
      {(() => {
        switch (status) {
          case "starting":
            return "Starting verification...";
          case "verifying":
            return "Verifying...";
          case "completed":
            return "Verification completed successfully";
          case "error":
            return "Something went wrong";
        }
      })()}
    </p>
  );
};

const VerificationActions = ({
  verificationLink,
  onLaunch,
  hasProof,
  proofRequest,
}: {
  verificationLink: string;
  onLaunch: () => void;
  hasProof: boolean;
  proofRequest: ReclaimProofRequest | null;
}) => {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const onCopy = async (): Promise<void> => {
    if (!verificationLink) {
      return;
    }

    try {
      navigator.clipboard.writeText(verificationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy verification link:", error);
    }
  };

  const getProofRequestJson = () => {
    if (!proofRequest) return "{}";
    try {
      const json = proofRequest.toJsonString();
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch (e) {
      console.error(e);
      return "{}";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6 pt-2">
      <div className="flex flex-row items-center justify-center gap-4">
        <button
          className="flex items-center justify-center gap-1.5 bg-transparent border border-gray-600 text-gray-600 hover:border-gray-800 hover:text-gray-800 rounded-lg transition-all font-medium text-xs"
          style={{ padding: "4px 12px", minWidth: "120px" }}
          onClick={onCopy}
        >
          {copied ? (
            <>
              <span>Copied Link</span>
              <svg
                className="w-3.5 h-3.5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          ) : (
            <>
              <span>Copy Link</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </>
          )}
        </button>

        {hasProof ? undefined : (
          <button
            className="bg-transparent border border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 rounded-lg transition-all font-medium text-xs"
            style={{ padding: "4px 12px", minWidth: "120px" }}
            onClick={onLaunch}
          >
            <span>Launch Again</span>
          </button>
        )}
      </div>

      <button
        className="flex items-center justify-center gap-1.5 bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition-all font-medium text-xs px-3 py-1.5"
        onClick={() => setShowOptions(true)}
      >
        <span>View Options</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16px"
          viewBox="0 -960 960 960"
          width="16px"
          fill="currentColor"
        >
          <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
        </svg>
      </button>

      <Dialog
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        title="Proof Request Options"
        copy={{
          label: "JSON",
          getDataForCopy: getProofRequestJson,
        }}
      >
        <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all font-mono text-start">
          {getProofRequestJson()}
        </pre>
      </Dialog>
    </div>
  );
};

export default Page;
