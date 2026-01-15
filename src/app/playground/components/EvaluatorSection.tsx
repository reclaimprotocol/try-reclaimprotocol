import { useState } from "react";
import { getErrorMessage } from "../../../utils/error_message";
import { Dialog } from "../../../components/Dialog";
import { showSnackbar } from "../../../components/Snackbar";

interface EvaluatorSectionProps {
  title: string;
  evaluate: (
    path: string,
    data: string,
  ) => null | ReclaimStringsResult[] | Promise<ReclaimStringsResult[] | null>;
}

export function EvaluatorSection({ title, evaluate }: EvaluatorSectionProps) {
  const [path, setPath] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState<any | null>(null);
  const [result, setResult] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const input = data;
      if (!input || !path) {
        if (!input) {
          showSnackbar("Data is required");
        }
        if (!path) {
          showSnackbar("Path is required");
        }
        setLoading(false);
        return;
      }

      console.info({ args: { path, input } });
      const result = await evaluate(path, input);
      console.info({ result });

      if (!result || (Array.isArray(result) && result.length === 0)) {
        setError("No results found");
        setLoading(false);
        return;
      }

      let firstResult = null;
      for (const record of result) {
        if (firstResult === null) {
          firstResult = record;
          continue;
        }
        if (firstResult.start_location > record.start_location) {
          firstResult = record;
        }
      }
      if (firstResult) {
        setResult(
          input.substring(firstResult.start_location, firstResult.end_location),
        );
        setError(null);
      } else {
        setError("No results found");
      }
    } catch (error) {
      console.error({ error });
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card">
        <h2>{title}</h2>
        <div className="input-group">
          <label>Path</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="Enter path"
          />
        </div>
        <div className="input-group">
          <label>Data</label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Enter data (multiline)"
            rows={4}
          />
        </div>
        <button
          className="plg-button"
          onClick={handleEvaluate}
          disabled={loading}
        >
          {loading ? "Evaluating..." : "Evaluate"}
        </button>
        {typeof result === 'string' && (
          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <strong>Evaluation Result:</strong>
              <button
                onClick={() => setShowDialog(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View Full Result
              </button>
            </div>
            <div className="bg-gray-800 p-3 rounded-md max-h-[200px] overflow-y-auto">
              <p className="font-mono whitespace-pre-wrap break-all text-gray-200">
                {result}
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="error-box mt-4">
            <strong>Error:</strong>
            <p>{getErrorMessage(error).replace("reclaimStrings.", "")}</p>
          </div>
        )}
      </div>

      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Evaluation Result"
        copy={{
          label: "Result",
          getDataForCopy: () => result ?? '',
        }}
      >
        <pre className="text-xs sm:text-sm font-mono text-gray-800 whitespace-pre-wrap break-all leading-relaxed text-left">
          {result}
        </pre>
      </Dialog>
    </>
  );
}
