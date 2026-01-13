export interface ExpertSettings {
  isExpertModeEnabled: boolean;
  autoTriggerFlow: boolean;
  callbackUrl: string;
  parameters: string; // JSON string
  context: string; // JSON string
  redirectUrl: string;
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
}
