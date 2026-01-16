import {
  createContext,
  useContext,
  useState,
  useEffect,
  type JSX,
} from "react";
import type { ExpertSettings } from "../service/expert";

interface ExpertContextType {
  settings: ExpertSettings;
  updateSettings: (newSettings: Partial<ExpertSettings>) => void;
  saveSettings: () => void;
  resetSettings: () => void;
}

const defaultSettings: ExpertSettings = {
  isExpertModeEnabled: false,
  launchMethod: 'js-sdk',
  callbackUrl: "",
  parameters: "",
  context: "",
  redirectUrl: "",
  providerVersion: "",
  appId: "",
  appSecret: "",
  sharePageUrl: "",
  useDeferredDeepLinksFlow: true,
  canAutoSubmit: true,
  metadata: "",
  useAppClip: true,
  customAppClipUrl: "",
  extensionID: "",
  envUrl: null,
  useBrowserExtension: true
};

const ExpertContext = createContext<ExpertContextType | undefined>(undefined);

export const useExpertContext = () => {
  const context = useContext(ExpertContext);
  if (!context) {
    throw new Error(
      "useExpertContext must be used within an ExpertContextProvider",
    );
  }
  return context;
};

export function useSelectFromExpertSettings<T>(
  select: (settings: ExpertSettings) => T,
): T {
  const { settings } = useExpertContext();
  if (!settings.isExpertModeEnabled) return select(defaultSettings);

  return select(settings);
}

export const ExpertContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [settings, setSettings] = useState<ExpertSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem("reclaim_expert_settings");
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error("Failed to parse stored expert settings", e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<ExpertSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const saveSettings = () => {
    // Here we could perform validation if needed, but for now we just persist
    localStorage.setItem("reclaim_expert_settings", JSON.stringify(settings));
    console.log("Expert settings saved:", settings);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("reclaim_expert_settings");
  };

  return (
    <ExpertContext.Provider
      value={{ settings, updateSettings, saveSettings, resetSettings }}
    >
      {children}
    </ExpertContext.Provider>
  );
};
