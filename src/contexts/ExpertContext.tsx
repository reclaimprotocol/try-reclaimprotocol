import {
  createContext,
  useContext,
  useState,
  useEffect,
  type JSX,
} from "react";
import type { ExpertSettings } from "../service/expert";
import { STORAGE_KEYS } from "../constants";

interface ExpertContextType {
  settings: ExpertSettings;
  updateSettings: (newSettings: Partial<ExpertSettings>) => void;
  saveSettings: () => void;
  resetSettings: () => void;
}

export const defaultSettings: ExpertSettings = {
  isExpertModeEnabled: false,
  environment: "production",
  launchMethod: "js-sdk.portal",
  callbackUrl: "",
  parameters: "",
  context: "",
  redirectUrl: "",
  redirectRequestMethod: "GET",
  redirectRequestBody: "",
  cancelCallbackUrl: "",
  cancelRedirectUrl: "",
  cancelRedirectRequestMethod: "GET",
  cancelRedirectRequestBody: "",
  providerVersion: "",
  appId: "",
  appSecret: "",
  sharePageUrl: "",
  useDeferredDeepLinksFlow: true,
  canAutoSubmit: true,
  metadata: "",
  useAppClip: false,
  customAppClipUrl: "",
  extensionID: "",
  envUrl: null,
  useBrowserExtension: true,
  preferredLocale: "",
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
    const storedSettings = localStorage.getItem(STORAGE_KEYS.expertSettings);
    if (storedSettings) {
      try {
        // Merge over defaults so fields added after this blob was saved
        // (e.g. `environment`) fall back to their default instead of undefined.
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
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
    localStorage.setItem(STORAGE_KEYS.expertSettings, JSON.stringify(settings));
    console.log("Expert settings saved:", settings);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEYS.expertSettings);
  };

  return (
    <ExpertContext.Provider
      value={{ settings, updateSettings, saveSettings, resetSettings }}
    >
      {children}
    </ExpertContext.Provider>
  );
};
