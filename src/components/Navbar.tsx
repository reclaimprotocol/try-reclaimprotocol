import { NavLink } from "react-router";
import { useState, useRef } from "react";
import {
  useExpertContext,
  defaultSettings,
  useSelectFromExpertSettings,
} from "../contexts/ExpertContext";
import { ModifiedExpertOptionsPreview } from "./ModifiedExpertOptionsPreview";
import { LINKS } from "../constants";

export const Navbar = () => {
  const { settings } = useExpertContext();
  const isExpertModeEnabled = useSelectFromExpertSettings(
    (settings) => settings.isExpertModeEnabled,
  );

  // Double tap logic
  const [forceVisible, setForceVisible] = useState(false);
  const lastTapRef = useRef<number>(0);

  const handleTouchEnd = (e: React.TouchEvent) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTapRef.current;
    if (tapLength < 300 && tapLength > 0) {
      setForceVisible((prev) => !prev);
      e.preventDefault(); // Prevent click/navigation on double tap
    }
    lastTapRef.current = currentTime;
  };

  return (
    <nav className="navbar">
      <div className="flex gap-6 items-center">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          end
        >
          Home
        </NavLink>
        <div
          className="relative group flex items-center h-full select-none"
          // Add touch listeners for mobile double tap
          onTouchEnd={handleTouchEnd}
          onContextMenu={(_) => {
            // Optional: may want to prevent default context menu if it interferes
          }}
        >
          <NavLink
            to="/expert"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            end
          >
            Expert
          </NavLink>
          {isExpertModeEnabled && (
            <>
              <span
                className={`absolute -top-1 -right-2 w-2 h-2 rounded-full ${
                  settings.parameters !== defaultSettings.parameters ||
                  settings.providerVersion !== defaultSettings.providerVersion
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />
              <ModifiedExpertOptionsPreview forceVisible={forceVisible} />
            </>
          )}
        </div>
        <NavLink
          to="/playground"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Claim Playground
        </NavLink>
      </div>
      <div className="flex gap-2">
        {/* Add more icons here */}
        <GithubIcon href={LINKS.repo} />
      </div>
    </nav>
  );
};

const GithubIcon = ({ href }: { href: string }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-[#0000ee] transition-colors"
    >
      <svg
        height="24"
        width="24"
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    </a>
  );
};
