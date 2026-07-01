import {
  ReclaimProofRequest,
  verifyProof,
  type Proof,
  isMobileDevice,
  type ProviderVersionInfo,
  type VerifyProofResult,
} from "@reclaimprotocol/js-sdk";
import type { ExpertSettings } from "./expert";
import {
  RECLAIM_APP_ID,
  RECLAIM_APP_SECRET,
  getReclaimEnvUrl,
  getReclaimPortalUrl,
  type AppEnvironment,
} from "../constants";

export const YourBackendUsingReclaim = {
  /**
   * @deprecated This should happen on your backend
   *
   * @param providerId - The unique identifier of Reclaim's data provider
   * @param environment - Which Reclaim backend to target ("production" | "staging")
   * @returns
   */
  createVerificationRequest: async (
    providerId: string,
    environment: AppEnvironment,
  ) => {
    const portalUrl = getReclaimPortalUrl(environment);

    const proofRequest = await ReclaimProofRequest.init(
      RECLAIM_APP_ID,
      RECLAIM_APP_SECRET,
      providerId,
      {
        // `undefined` in production => the SDK uses its built-in defaults.
        envUrl: getReclaimEnvUrl(environment),
        portalUrl,
      },
    );

    // The SDK requires an explicit app callback URL whenever a custom
    // (non-default) share page is used — e.g. the staging portal. Pin it to the
    // SDK's own default callback (derived from `envUrl`): this satisfies the
    // requirement while keeping the polling-based `onSuccess` flow intact, since
    // the value still equals the default the SDK would have used.
    if (portalUrl) {
      proofRequest.setAppCallbackUrl(proofRequest.getAppCallbackUrl());
    }

    return proofRequest.toJsonString();
  },

  getProofsAsArray: (proof: Proof | Proof[] | string): Proof[] => {
    // In most cases, you'll either get a single proof or an array of proofs
    //
    // Note: Apologies for making this complicated, we had to do it to stay
    // backwards compatible with servers using older versions of Reclaim.
    if (Array.isArray(proof)) {
      return proof;
    } else if (typeof proof === "string") {
      // For backwards compatibility
      return JSON.parse(proof);
    } else {
      // For backwards compatibility
      return [proof as Proof];
    }
  },

  validateProof: async (result: VerifyProofResult): Promise<boolean> => {
    // Validate proof to check if this is what you expected
    // data validation and business requirment checks
    return result.data.length > 0;
  },

  /**
   * @deprecated This should happen on your backend
   *
   * @param proof
   */
  processProof: async (proof: string | Proof | Proof[], providerVersionInfo: ProviderVersionInfo): Promise<Proof[]> => {
    const proofs = YourBackendUsingReclaim.getProofsAsArray(proof);

    // As best practice, you MUST verify proof using `verifyProof` from `import { verifyProof } from "@reclaimprotocol/js-sdk"`
    // This should happen on your backend.
    //
    // This can also throw when proof verification fails.
    // 
    // The verifyProof also does validation by checking request url,
    // method, etc.
    const verificationResult = await verifyProof(proofs, providerVersionInfo);

    if (!verificationResult.isVerified) {
      // Do not use proof which cannot be verified.
      // This can happen when there were transport problems, data was incorrect,
      // some service was down, or someone faked the proof.
      throw new Error("Proof could not be verified");
    }

    // As best practice, you MUST validate proofs all proven fields (aka extracted params) as per 
    // expectations and business requirements. This should happen on your backend.
    //
    // This must be done to make sure that this is the proof you expected.
    const isProofValid = await YourBackendUsingReclaim.validateProof(verificationResult);

    if (!isProofValid) {
      // Do not use proof that failed your validation.
      throw new Error("Proof could not be validated");
    }

    return proofs;
  },

  /**
   * Advanced: Create verification request with advanced options to customize
   * verification
   *
   * @deprecated This should happen on your backend
   *
   * @param providerId - The unique identifier of Reclaim's data provider
   * @returns
   */
  createVerificationRequestAsExpert: async (
    providerId: string,
    expertSettings: ExpertSettings,
  ) => {
    const reclaimAppId = expertSettings.appId || RECLAIM_APP_ID;
    const reclaimAppSecret = expertSettings.appSecret || RECLAIM_APP_SECRET;

    const proofRequest = await ReclaimProofRequest.init(
      reclaimAppId,
      reclaimAppSecret,
      providerId,
      {
        providerVersion: expertSettings.providerVersion
          ? expertSettings.providerVersion
          : undefined,
        // Explicit value wins; otherwise fall back to the active environment's
        // portal (undefined in production => SDK default).
        portalUrl:
          expertSettings.sharePageUrl ||
          getReclaimPortalUrl(expertSettings.environment),
        launchOptions: {
          canUseDeferredDeepLinksFlow:
            isMobileDevice() && expertSettings.useDeferredDeepLinksFlow
              ? expertSettings.useDeferredDeepLinksFlow
              : undefined,
        },
        useAppClip:
          typeof expertSettings.useAppClip === "boolean"
            ? expertSettings.useAppClip
            : undefined,
        customAppClipUrl: expertSettings.customAppClipUrl
          ? expertSettings.customAppClipUrl
          : undefined,
        extensionID: expertSettings.extensionID
          ? expertSettings.extensionID
          : undefined,
        // Explicit value wins; otherwise fall back to the active environment's
        // backend (undefined in production => SDK default).
        envUrl:
          expertSettings.envUrl || getReclaimEnvUrl(expertSettings.environment),
        useBrowserExtension:
          typeof expertSettings.useBrowserExtension === "boolean"
            ? expertSettings.useBrowserExtension
            : undefined,
        canAutoSubmit: expertSettings.canAutoSubmit ?? true,
        preferredLocale: expertSettings.preferredLocale,
        metadata: expertSettings.metadata
          ? JSON.parse(expertSettings.metadata)
          : undefined,
      },
    );

    if (expertSettings.callbackUrl) {
      proofRequest.setAppCallbackUrl(expertSettings.callbackUrl, true);
    } else if (
      expertSettings.sharePageUrl ||
      getReclaimPortalUrl(expertSettings.environment)
    ) {
      // A custom share page (explicit `sharePageUrl` or the staging portal)
      // requires an explicit app callback URL. Fall back to the SDK's own
      // default callback (derived from `envUrl`) so the standard polling-based
      // flow keeps working without the developer having to stand up a backend.
      proofRequest.setAppCallbackUrl(proofRequest.getAppCallbackUrl());
    }

    if (expertSettings.redirectUrl) {
      if (!expertSettings.redirectRequestBody && expertSettings.redirectRequestMethod == 'GET') {
        proofRequest.setRedirectUrl(expertSettings.redirectUrl);
      } else {
        const requestBody = JSON.parse(expertSettings.redirectRequestBody || '[]');
        proofRequest.setRedirectUrl(expertSettings.redirectUrl, expertSettings.redirectRequestMethod, requestBody);
      }
    }

    if (expertSettings.cancelCallbackUrl) {
      proofRequest.setCancelCallbackUrl(expertSettings.cancelCallbackUrl);
    }

    if (expertSettings.cancelRedirectUrl) {
      if (!expertSettings.cancelRedirectRequestBody && expertSettings.cancelRedirectRequestMethod == 'GET') {
        proofRequest.setCancelRedirectUrl(expertSettings.cancelRedirectUrl);
      } else {
        const requestBody = JSON.parse(expertSettings.cancelRedirectRequestBody || '[]');
        proofRequest.setCancelRedirectUrl(expertSettings.cancelRedirectUrl, expertSettings.cancelRedirectRequestMethod, requestBody);
      }
    }

    if (expertSettings.context) {
      proofRequest.setJsonContext(JSON.parse(expertSettings.context));
    }

    if (expertSettings.parameters) {
      proofRequest.setParams(JSON.parse(expertSettings.parameters));
    }

    return proofRequest.toJsonString();
  },
};
