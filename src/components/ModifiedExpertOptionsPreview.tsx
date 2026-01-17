import { useNavigate } from "react-router";
import { defaultSettings, useExpertContext } from "../contexts/ExpertContext";

export const ModifiedExpertOptionsPreview = ({
  forceVisible,
}: {
  forceVisible?: boolean;
}) => {
  const { settings } = useExpertContext();
  const navigate = useNavigate();

  const records = Object.keys(settings)
    .map((key) => {
      const k = key as keyof typeof settings;
      if (
        k === "isExpertModeEnabled" ||
        JSON.stringify(settings[k]) === JSON.stringify(defaultSettings[k])
      ) {
        return null;
      }

      const isWarning = k === "parameters" || k === "providerVersion";
      const isObscured = k === "appSecret";

      return {
        key: k,
        value: settings[k],
        isWarning,
        isObscured,
      };
    })
    .filter((record) => record !== null);

  return (
    <div
      // Force visibility if needed
      className={`absolute top-full left-0 ms-8 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 z-50 cursor-pointer transition-all duration-200
        ${forceVisible ? "visible opacity-100" : `invisible ${records.length ? "group-hover:visible" : ""} opacity-0 group-hover:opacity-100`}
        `}
      onClick={() => navigate("/expert")}
    >
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Expert Mode Enabled
      </h3>
      <div className="space-y-1">
        {records.map((record) => {
          const { key, value, isWarning, isObscured } = record;

          return (
            <div
              key={key}
              className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5"
            >
              {isWarning && (
                <svg
                  className="w-3 h-3 text-amber-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              <span className="font-medium truncate">{key}:</span>
              <span className="truncate max-w-[250px]">
                {isObscured
                  ? "*".repeat(typeof value === "string" ? value.length : 10)
                  : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
