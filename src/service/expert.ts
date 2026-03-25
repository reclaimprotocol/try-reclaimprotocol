export interface ExpertSettings {
  isExpertModeEnabled: boolean;
  launchMethod: "none" | "js-sdk.portal" | "js-sdk.app" | "windowopen";
  callbackUrl: string;
  parameters: string; // JSON string
  context: string; // JSON string
  redirectUrl: string;
  /**
   * @since 4.11.0
   */
  redirectRequestMethod: "GET" | "POST";
  /**
   * @since 4.11.0
   */
  redirectRequestBody: string;
  /**
   * @since 4.10.0
   */
  cancelCallbackUrl: string;
  /**
   * @since 4.10.0
   */
  cancelRedirectUrl: string;
  /**
   * @since 4.11.0
   */
  cancelRedirectRequestMethod: "GET" | "POST";
  /**
   * @since 4.11.0
   */
  cancelRedirectRequestBody: string;
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
