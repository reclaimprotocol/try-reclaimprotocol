import type { Proof } from "@reclaimprotocol/js-sdk";
import { useMemo, useState, useEffect } from "react";
import {
  formatParamKey,
  formatParamsValue,
  isValueCollection,
} from "../../utils/format_params";
import { Dialog } from "../Dialog";

type ProofRecord = { key: string; value: string };

const collectParametersAsSet = (
  entries: (Record<string, string> | undefined)[],
): Set<ProofRecord> => {
  return (
    entries
      // collecting as a set of records because there may be
      // duplicate keys
      .reduce<Set<{ key: string; value: string }>>((a, b) => {
        if (!b) return a;

        return new Set([
          ...a,
          ...Object.entries(b).map(([key, value]) => ({ key, value })),
        ]);
      }, new Set())
  );
};

export default function ResultsView({
  proof,
  className,
}: {
  proof: Proof[] | null;
  className?: string;
}) {
  const extractedParameters: Set<ProofRecord> = useMemo(() => {
    if (!proof) return new Set<ProofRecord>();

    // This is how you get a map of string keys and values of
    // verified data from the proof
    const extractParameters = (o: Proof): Record<string, string> =>
      JSON.parse(o.claimData.context).extractedParameters;

    // Collecting all verified data from multiple proofs into one
    // a single set.
    // You don't have to do this. Your usecase
    // may not need collecting all verified data from multiple proofs.
    // We did it for presentation purposes in this demo.
    return collectParametersAsSet(proof.map(extractParameters));
  }, [proof]);

  const attachedPublicData: Set<ProofRecord> = useMemo(() => {
    if (!proof) return new Set<ProofRecord>();

    const extractPublicData = (o: Proof): Record<string, string> | undefined =>
      o.publicData;

    // Collecting all attached public data from multiple proofs into one
    // a single set.
    // You don't have to do this. Your usecase
    // may not need collecting all attached public data from multiple proofs.
    // We did it for presentation purposes in this demo.
    return collectParametersAsSet([
      // Taking only the first entry that is not null or undefined.
      // Right now, all public data attached in every proof is exactly the same.
      proof.map(extractPublicData).find((o) => !!o),
    ]);
  }, [proof]);

  if (!proof) return null;

  // Everything below is just for presentation

  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3 text-center">
        {proof && proof.length == 0 ? `Proof was sent to callback` : `What was Shared`}
      </p>

      <SharedDataDisplay
        extractedParameters={extractedParameters}
        attachedPublicData={attachedPublicData}
      />

      <ProofDetailsDialog proof={proof} />
    </div>
  );
}

const ProofDetailsDialog = ({ proof }: { proof: Proof[] }) => {
  const [isOpen, setShowDetails] = useState(false);

  const onClose = () => setShowDetails(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen)
    return (
      <div className="w-full max-w-2xl mt-4 text-center">
        <button
          onClick={() => setShowDetails(true)}
          className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors"
        >
          View detailed proof
        </button>
      </div>
    );

  let proofText = JSON.stringify(proof, null, 2);

  if (proof.length == 0) {
    proofText = "Proof was sent to callback";
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Generated Proofs"
      copy={{
        label: "Proof",
        getDataForCopy: () => proofText,
      }}
    >
      <pre className="text-xs sm:text-sm font-mono text-gray-800 whitespace-pre-wrap break-all leading-relaxed text-left">
        {proofText}
      </pre>
    </Dialog>
  );
};

const ParameterEntry: React.FC<{
  paramKey: string;
  value: unknown;
  status?: "pending" | "generating" | "verifying" | "completed" | "failed";
}> = ({ paramKey, value }) => {
  return (
    <div className="flex items-start gap-3">
      <CompletedIcon />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide text-left">
          {formatParamKey(paramKey)}
        </div>
        <_RenderValue value={value} />
      </div>
    </div>
  );
};

const _RenderValue = ({ value }: { value: unknown }) => {
  const [humanizedFormat, setHumanizedFormat] = useState<boolean>(true);
  const isCollection = isValueCollection(value);

  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) {
      return (
        <span className="text-gray-400">{formatParamsValue(value, false)}</span>
      );
    }
    if (typeof value === "boolean") {
      return <span className="text-[#0000EE]">{value ? "Yes" : "No"}</span>;
    }
    if (typeof value === "object") {
      return (
        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto text-[#0000EE]">
          {formatParamsValue(value, false)}
        </pre>
      );
    }
    return (
      <span className="text-[#0000EE]">{formatParamsValue(value, false)}</span>
    );
  };

  return (
    <div
      className="text-base font-medium break-all mt-0.5 text-left"
      onClick={() => {
        if (!isCollection) return;
        return setHumanizedFormat(!humanizedFormat);
      }}
    >
      {humanizedFormat
        ? formatParamsValue(value, humanizedFormat)
        : renderValue(value)}
    </div>
  );
};

const CompletedIcon = () => {
  return (
    <svg
      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

const SharedDataDisplay = ({
  extractedParameters,
  attachedPublicData,
}: {
  extractedParameters: Set<ProofRecord>;
  attachedPublicData: Set<ProofRecord>;
}) => {
  const extractedParametersArray = Array.from(extractedParameters);
  const attachedPublicDataArray = Array.from(attachedPublicData);

  return (
    <div className="flex-1 px-4 pb-4 overflow-y-auto min-h-[180px] max-h-[25vh] max-w-[30vh]">
      <div className="flex flex-col">
        <div className="space-y-3">
          <div className="space-y-3 pr-2">
            {extractedParametersArray.map(({ key, value }) => (
              <ParameterEntry key={key} paramKey={key} value={value} />
            ))}
          </div>
        </div>

        {attachedPublicDataArray && attachedPublicDataArray.length > 0 ? (
          <>
            <div className="mt-2 pt-2 border-t border-gray-300">
              <p className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  className="text-gray-500"
                  fill="currentColor"
                >
                  <path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z" />
                </svg>
                More
              </p>
              <div className="space-y-3 max-h-[20vh] overflow-y-auto pr-2">
                {attachedPublicDataArray.map(({ key, value }) => (
                  <div key={key} className="flex items-start gap-3">
                    <CompletedIcon />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide text-left">
                        {formatParamKey(key)}
                      </div>
                      <_RenderValue value={value} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : undefined}
      </div>
    </div>
  );
};
