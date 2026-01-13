import {
  ReclaimProofRequest,
  verifyProof,
  type Proof,
  isMobileDevice,
} from "@reclaimprotocol/js-sdk";
import type { ExpertSettings } from "./expert";

export const YourBackendUsingReclaim = {
  /**
   * @deprecated This should happen on your backend
   *
   * @param providerId - The unique identifier of Reclaim's data provider
   * @returns
   */
  createVerificationRequest: async (providerId: string) => {
    const reclaimAppId = import.meta.env.VITE_RECLAIM_APP_ID || "";
    const reclaimAppSecret = import.meta.env.VITE_RECLAIM_APP_SECRET || "";
    const proofRequest = await ReclaimProofRequest.init(
      reclaimAppId,
      reclaimAppSecret,
      providerId,
    );

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

  validateProof: async (proofs: Proof[]): Promise<boolean> => {
    // Validate proof to check if this is what you expected including
    // request validation and business requirment checks
    return proofs.length > 0;
  },

  /**
   * @deprecated This should happen on your backend
   *
   * @param proof
   */
  processProof: async (proof: string | Proof | Proof[]): Promise<Proof[]> => {
    const proofs = YourBackendUsingReclaim.getProofsAsArray(proof);

    // As best practice, you MUST verify proof using `verifyProof` from `import { verifyProof } from "@reclaimprotocol/js-sdk"`
    // This should happen on your backend.
    //
    // This can also throw when proof verification fails.
    const isProofVerified = await verifyProof(proofs);

    if (!isProofVerified) {
      // Do not use proof which cannot be verified.
      // This can happen when there were transport problems, data was incorrect,
      // some service was down, or someone faked the proof.
      throw new Error("Proof could not be verified");
    }

    // As best practice, you MUST validate proofs as per expectations and business requirements.
    // This should happen on your backend.
    //
    // This must be done to make sure that
    // this is the proof you expected.
    //
    // As an example, validation can be done by checking request url, headers,
    // method, and all proven fields (aka extracted params), etc.
    const isProofValid = await YourBackendUsingReclaim.validateProof(proofs);

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
    const reclaimAppId =
      expertSettings.appId || import.meta.env.VITE_RECLAIM_APP_ID || "";
    const reclaimAppSecret =
      expertSettings.appSecret || import.meta.env.VITE_RECLAIM_APP_SECRET || "";

    const proofRequest = await ReclaimProofRequest.init(
      reclaimAppId,
      reclaimAppSecret,
      providerId,
      {
        providerVersion: expertSettings.providerVersion
          ? expertSettings.providerVersion
          : undefined,
        customSharePageUrl: expertSettings.sharePageUrl
          ? expertSettings.sharePageUrl
          : undefined,
        launchOptions: {
          canUseDeferredDeepLinksFlow:
            isMobileDevice() && expertSettings.useDeferredDeepLinksFlow
              ? expertSettings.useDeferredDeepLinksFlow
              : undefined,
        },
        useAppClip: typeof expertSettings.useAppClip === 'boolean' ? expertSettings.useAppClip : undefined,
        customAppClipUrl: expertSettings.customAppClipUrl
          ? expertSettings.customAppClipUrl
          : undefined,
        extensionID: expertSettings.extensionID ? expertSettings.extensionID : undefined,
        envUrl: expertSettings.envUrl && typeof expertSettings.envUrl === 'string' ? expertSettings.envUrl : undefined,
        useBrowserExtension: typeof expertSettings.useBrowserExtension === 'boolean' ? expertSettings.useBrowserExtension : undefined,
        canAutoSubmit: expertSettings.canAutoSubmit ?? true,
        metadata: expertSettings.metadata
          ? JSON.parse(expertSettings.metadata)
          : undefined,
      },
    );

    if (expertSettings.callbackUrl) {
      proofRequest.setAppCallbackUrl(expertSettings.callbackUrl, true);
    }

    if (expertSettings.redirectUrl) {
      proofRequest.setRedirectUrl(expertSettings.redirectUrl);
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
