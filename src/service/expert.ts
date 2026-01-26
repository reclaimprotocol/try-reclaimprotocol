export interface ExpertSettings {
  isExpertModeEnabled: boolean;
  launchMethod: "none" | "js-sdk" | "windowopen";
  callbackUrl: string;
  parameters: string; // JSON string
  context: string; // JSON string
  redirectUrl: string;
  /**
   * @since 4.8.0
   */
  errorCallbackUrl: string;
  /**
   * @since 4.8.0
   */
  errorRedirectUrl: string;
  providerVersion: string;
  appId: string;
  appSecret: string;
  sharePageUrl: string;
  useDeferredDeepLinksFlow: boolean;
  useAppClip: boolean;
  customAppClipUrl: string;
  extensionID: string;
  envUrl: string | null;
  useBrowserExtension: boolean;
  /**
   * @since 4.7.0
   */
  canAutoSubmit?: boolean;
  /**
   * @since 4.7.0
   */
  metadata?: string; // JSON string
  /**
   * @since 4.9.0
   */
  preferredLocale?: string;
}
