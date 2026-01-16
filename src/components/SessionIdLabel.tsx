import React, { useState } from "react";
import shieldTickIcon from "../assets/shield_tick.svg";

interface SessionIdLabelProps {
  sessionId: string;
  className?: string;
}

export const SessionIdLabel: React.FC<SessionIdLabelProps> = ({
  sessionId,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySessionId = async () => {
    if (!sessionId) return;

    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy session ID:", err);
    }
  };

  return (
    <div
      className={`flex items-center justify-center gap-2 group hover:bg-gray-200/60 rounded-lg transition-all px-2 py-1 cursor-pointer ${className}`}
      onClick={handleCopySessionId}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <img
            src={shieldTickIcon}
            alt="Shield Tick"
            className="ml-4 w-4 h-4"
          />
          <code className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors font-mono px-1 py-1">
            {sessionId.length > 16
              ? `${sessionId.substring(0, 8)}…${sessionId.substring(sessionId.length - 8)}`
              : sessionId}
          </code>
          <div className="p-1 rounded" title="Copy Session ID">
            {copied ? (
              <svg
                className="w-4 h-4 text-green-600"
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
            ) : (
              <svg
                className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
